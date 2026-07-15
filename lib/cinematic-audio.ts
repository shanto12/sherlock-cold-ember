/**
 * Dependency-free audio graph for The Cold Ember Casebook. It combines bounded
 * procedural ambience with decoded, self-hosted production stems.
 *
 * The constructor is intentionally inert. `AudioContext` is created only by an
 * explicit call to `start()`, which the UI must make from a user gesture. This
 * keeps the engine compliant with browser autoplay policies and prevents sound
 * from beginning merely because a component mounted.
 */

export const CINEMATIC_SCENES = [
  "summons",
  "passage",
  "room",
  "archive",
  "conclusion",
] as const;

export type CinematicScene = (typeof CINEMATIC_SCENES)[number];

export type CinematicSoundCue =
  | "case-open"
  | "clue"
  | "deduction"
  | "footsteps"
  | "paper"
  | "reveal"
  | "telegram"
  | "ui";

export type CinematicAudioBus = "ambience" | "dialogue";

export type CinematicAudioAssetResult = "complete" | "stopped" | "failed";

export interface CinematicAudioAssetPlayback {
  readonly url: string;
  readonly durationMs: number;
  readonly startedAtContextTime: number;
  readonly result: Promise<CinematicAudioAssetResult>;
  setGain(value: number): void;
  stop(): void;
}

export type CinematicAudioStatus =
  | "idle"
  | "running"
  | "suspended"
  | "stopped"
  | "unavailable"
  | "destroyed";

export interface CinematicAudioDebugSnapshot {
  readonly explicitStartRequired: true;
  readonly supported: boolean;
  readonly initialized: boolean;
  readonly initializationCount: number;
  readonly startInvocationCount: number;
  readonly started: boolean;
  readonly status: CinematicAudioStatus;
  readonly contextState: AudioContextState | "unavailable" | "uninitialized";
  readonly scene: CinematicScene;
  readonly sceneChangeCount: number;
  readonly masterVolume: number;
  readonly ambienceVolume: number;
  readonly dialogueVolume: number;
  readonly effectiveDialogueVolume: number;
  readonly intervalCount: number;
  readonly ambientSourceCount: number;
  readonly ambientNodeCount: number;
  readonly transientSourceCount: number;
  readonly transientNodeCount: number;
  readonly cueCount: number;
  readonly lastCue: CinematicSoundCue | null;
  readonly lastAmbientEvent: string | null;
  readonly decodedAssetCount: number;
  readonly activeAssetSourceCount: number;
  readonly activeAssetNodeCount: number;
  readonly assetPlaybackCount: number;
  readonly assetFailureCount: number;
  readonly dialogueDucking: boolean;
  readonly manuallySuspended: boolean;
  readonly visibilitySuspended: boolean;
  readonly visibilityBound: boolean;
}

type AudioContextConstructor = new (
  contextOptions?: AudioContextOptions,
) => AudioContext;

export interface CinematicAudioOptions {
  readonly scene?: CinematicScene;
  readonly masterVolume?: number;
  readonly ambienceVolume?: number;
  readonly dialogueVolume?: number;
  /** Used by tests; this factory is never invoked before `start()`. */
  readonly contextFactory?: () => AudioContext;
  /** Pass `null` to opt out of automatic page-visibility handling. */
  readonly document?: Document | null;
  readonly random?: () => number;
  readonly publishDebug?: boolean;
  readonly onDebugChange?: (snapshot: CinematicAudioDebugSnapshot) => void;
}

export interface PlayCinematicCueOptions {
  readonly bus?: CinematicAudioBus;
  /** Multiplier applied in addition to the selected bus volume. */
  readonly intensity?: number;
}

export interface PlayCinematicAssetOptions {
  readonly bus?: CinematicAudioBus;
  readonly gain?: number;
  readonly loop?: boolean;
}

const DEBUG_GLOBAL_KEY = "__coldEmberAudioDebug";
const MIN_ENVELOPE_GAIN = 0.0001;

const isScene = (value: string): value is CinematicScene =>
  (CINEMATIC_SCENES as readonly string[]).includes(value);

const clamp = (value: number, minimum = 0, maximum = 1): number => {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
};

const getDefaultDocument = (): Document | null =>
  typeof document === "undefined" ? null : document;

const getBrowserAudioContextConstructor = (): AudioContextConstructor | null => {
  if (typeof globalThis === "undefined") return null;

  const browserGlobal = globalThis as unknown as {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };

  return (
    browserGlobal.AudioContext ?? browserGlobal.webkitAudioContext ?? null
  );
};

export const isCinematicAudioSupported = (): boolean =>
  getBrowserAudioContextConstructor() !== null;

export const getPublishedCinematicAudioDebug =
  (): CinematicAudioDebugSnapshot | null => {
    if (typeof globalThis === "undefined") return null;
    const debugGlobal = globalThis as unknown as Record<string, unknown>;
    const snapshot = debugGlobal[DEBUG_GLOBAL_KEY];
    return snapshot && typeof snapshot === "object"
      ? (snapshot as CinematicAudioDebugSnapshot)
      : null;
  };

/**
 * A small procedural audio engine. Instantiate during render if useful, but
 * call `start()` only from a click, keypress, or other explicit user gesture.
 */
export class CinematicAudioEngine {
  private readonly contextFactory?: () => AudioContext;
  private readonly documentRef: Document | null;
  private readonly random: () => number;
  private readonly publishDebugEnabled: boolean;
  private readonly onDebugChange?: (
    snapshot: CinematicAudioDebugSnapshot,
  ) => void;

  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private dialogueGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private scene: CinematicScene;
  private masterVolume: number;
  private ambienceVolume: number;
  private dialogueVolume: number;
  private status: CinematicAudioStatus = "idle";
  private started = false;
  private destroyed = false;
  private manuallySuspended = false;
  private visibilitySuspended = false;
  private resumeAfterVisibility = false;

  private initializationCount = 0;
  private startInvocationCount = 0;
  private sceneChangeCount = 0;
  private cueCount = 0;
  private lastCue: CinematicSoundCue | null = null;
  private lastAmbientEvent: string | null = null;
  private lifecycleRevision = 0;
  private sceneMixDirty = false;

  private readonly sceneIntervals = new Set<ReturnType<typeof setInterval>>();
  private readonly ambientSources = new Set<AudioScheduledSourceNode>();
  private readonly ambientNodes = new Set<AudioNode>();
  private readonly transientSources = new Set<AudioScheduledSourceNode>();
  private readonly transientNodes = new Set<AudioNode>();
  private readonly decodedAssets = new Map<
    string,
    Promise<AudioBuffer | null>
  >();
  private readonly assetSources = new Set<AudioBufferSourceNode>();
  private readonly assetNodes = new Set<AudioNode>();
  private readonly assetStops = new Set<() => void>();
  private readonly directResumes = new Set<Promise<void>>();
  private contextTransition: Promise<void> = Promise.resolve();

  private visibilityBound = false;
  private visibilityListener: (() => void) | null = null;
  private assetPlaybackCount = 0;
  private assetFailureCount = 0;
  private dialogueDucking = false;

  public constructor(options: CinematicAudioOptions = {}) {
    this.contextFactory = options.contextFactory;
    this.documentRef =
      options.document === undefined ? getDefaultDocument() : options.document;
    this.random = options.random ?? Math.random;
    this.publishDebugEnabled = options.publishDebug ?? true;
    this.onDebugChange = options.onDebugChange;
    this.scene = options.scene ?? "summons";
    this.masterVolume = clamp(options.masterVolume ?? 0.78);
    this.ambienceVolume = clamp(options.ambienceVolume ?? 0.72);
    this.dialogueVolume = clamp(options.dialogueVolume ?? 0.92);

    this.publishDebug();
  }

  /**
   * The only method that can create an AudioContext. Call it directly from a
   * user gesture. Returns true when the context is actively running.
   */
  public async start(): Promise<boolean> {
    this.startInvocationCount += 1;

    if (this.destroyed) {
      this.publishDebug();
      return false;
    }

    const revision = ++this.lifecycleRevision;
    if (!this.context && !this.initializeContext()) {
      return this.rollbackFailedStart(revision, "unavailable");
    }

    const context = this.context;
    if (!context || context.state === "closed") {
      return this.rollbackFailedStart(revision, "unavailable");
    }

    // Starting is provisional until the browser confirms a running context.
    // A failed attempt must never arm later visibility-driven playback.
    this.started = false;
    this.dialogueDucking = false;
    this.rampGain(this.ambienceGain, this.ambienceVolume);
    this.manuallySuspended = false;
    this.resumeAfterVisibility = false;
    this.visibilitySuspended = Boolean(this.documentRef?.hidden);

    if (this.documentRef?.hidden) {
      return this.rollbackFailedStart(revision, "suspended");
    }

    try {
      if (context.state === "suspended" || context.state === "interrupted") {
        await this.resumeContextDirect(context);
      }
    } catch {
      return this.rollbackFailedStart(revision, "suspended");
    }

    // A stopped engine can still have an older visibility suspension settling.
    // Let it finish, then make this newer user-start the final resume operation.
    await this.contextTransition.catch(() => undefined);
    if (revision !== this.lifecycleRevision || this.destroyed) {
      // A newer visibility/stop/destroy transition owns cleanup and state.
      return false;
    }
    if (this.documentRef?.hidden) {
      return this.rollbackFailedStart(revision, "suspended");
    }

    if (context.state !== "running") {
      try {
        await this.resumeContextDirect(context);
      } catch {
        return this.rollbackFailedStart(revision, "suspended");
      }
      const stateAfterRetry = context.state as AudioContextState;
      if (
        revision !== this.lifecycleRevision ||
        this.destroyed ||
        this.documentRef?.hidden ||
        stateAfterRetry !== "running"
      ) {
        return this.rollbackFailedStart(revision, "suspended");
      }
    }

    this.started = true;
    this.visibilitySuspended = false;
    this.resumeAfterVisibility = false;
    this.bindVisibility();
    this.startSceneAmbience();
    this.status = "running";
    this.publishDebug();
    return true;
  }

  /** Suspends playback without discarding the current scene mix. */
  public async suspend(): Promise<boolean> {
    if (!this.context || !this.started || this.destroyed) return false;
    const revision = ++this.lifecycleRevision;
    this.manuallySuspended = true;
    this.resumeAfterVisibility = false;
    const authoritative = await this.queueContextTransition(revision, async () => {
      await this.awaitDirectResumes();
      if (revision !== this.lifecycleRevision) return;
      await this.suspendContext();
    });
    if (!authoritative) return false;
    this.status = "suspended";
    this.publishDebug();
    return true;
  }

  /** Resumes an already initialized engine; it never creates an AudioContext. */
  public async resume(): Promise<boolean> {
    const context = this.context;
    if (
      !context ||
      !this.started ||
      this.destroyed ||
      context.state === "closed" ||
      this.documentRef?.hidden
    ) {
      return false;
    }

    const revision = ++this.lifecycleRevision;
    this.manuallySuspended = false;
    this.visibilitySuspended = false;
    this.resumeAfterVisibility = false;

    try {
      if (context.state !== "running") await this.resumeContextDirect(context);
    } catch {
      if (revision === this.lifecycleRevision && !this.destroyed) {
        this.status = "suspended";
        this.publishDebug();
      }
      return false;
    }

    if (
      revision !== this.lifecycleRevision ||
      this.destroyed ||
      !this.started ||
      this.documentRef?.hidden ||
      context.state !== "running"
    ) {
      return false;
    }

    if (this.sceneMixDirty || this.ambientSources.size === 0) {
      this.startSceneAmbience();
    }
    this.status = "running";
    this.publishDebug();
    return true;
  }

  /** Stops all scheduled sound while keeping the context reusable. */
  public async stop(): Promise<void> {
    if (this.destroyed) return;
    const revision = ++this.lifecycleRevision;
    this.started = false;
    this.dialogueDucking = false;
    this.rampGain(this.ambienceGain, this.ambienceVolume);
    this.manuallySuspended = false;
    this.visibilitySuspended = false;
    this.resumeAfterVisibility = false;
    this.clearSceneIntervals();
    this.stopAmbientSources();
    this.stopTransientSources();
    this.stopAssetSources();
    const authoritative = await this.queueContextTransition(revision, async () => {
      await this.awaitDirectResumes();
      if (revision !== this.lifecycleRevision) return;
      await this.suspendContext();
    });
    if (!authoritative) return;
    this.status = "stopped";
    this.publishDebug();
  }

  /** Permanently releases the context, nodes, timers, and visibility listener. */
  public async destroy(): Promise<void> {
    if (this.destroyed) return;

    ++this.lifecycleRevision;
    this.started = false;
    this.destroyed = true;
    this.dialogueDucking = false;
    this.status = "destroyed";
    this.clearSceneIntervals();
    this.stopAmbientSources();
    this.stopTransientSources();
    this.stopAssetSources();
    this.unbindVisibility();

    const context = this.context;
    this.unbindContextStateChange();
    this.context = null;
    this.masterGain = null;
    this.ambienceGain = null;
    this.dialogueGain = null;
    this.noiseBuffer = null;
    this.decodedAssets.clear();

    if (context && context.state !== "closed") {
      try {
        // close() is authoritative even when a prior resume/suspend promise is
        // still settling; waiting first could deadlock during page teardown.
        await context.close();
      } catch {
        // The page may already be tearing down. All local references are gone.
      }
    }

    this.publishDebug();
  }

  public setScene(scene: CinematicScene): void {
    if (!isScene(scene) || scene === this.scene || this.destroyed) return;
    this.scene = scene;
    this.sceneChangeCount += 1;
    this.sceneMixDirty = true;

    if (
      this.started &&
      this.context?.state === "running" &&
      !this.visibilitySuspended &&
      !this.manuallySuspended
    ) {
      this.startSceneAmbience();
    }

    this.publishDebug();
  }

  public getScene(): CinematicScene {
    return this.scene;
  }

  public setMasterVolume(value: number): number {
    this.masterVolume = clamp(value);
    this.rampGain(this.masterGain, this.masterVolume);
    this.publishDebug();
    return this.masterVolume;
  }

  public setAmbienceVolume(value: number): number {
    this.ambienceVolume = clamp(value);
    this.rampGain(
      this.ambienceGain,
      this.ambienceVolume * (this.dialogueDucking ? 0.48 : 1),
    );
    this.publishDebug();
    return this.ambienceVolume;
  }

  public setDialogueVolume(value: number): number {
    this.dialogueVolume = clamp(value);
    this.rampGain(this.dialogueGain, this.dialogueVolume);
    this.publishDebug();
    return this.dialogueVolume;
  }

  /** Effective value to apply to SpeechSynthesisUtterance.volume. */
  public getEffectiveDialogueVolume(): number {
    return clamp(this.masterVolume * this.dialogueVolume);
  }

  /** Smoothly lowers the atmosphere while an authored line is active. */
  public setDialogueDucking(active: boolean): void {
    if (this.dialogueDucking === active || this.destroyed) return;
    this.dialogueDucking = active;
    this.rampGain(
      this.ambienceGain,
      this.ambienceVolume * (active ? 0.48 : 1),
      active ? 0.04 : 0.22,
    );
    this.publishDebug();
  }

  /**
   * Plays a short generated cue. This is a no-op until `start()` has completed,
   * and it never resumes or initializes audio by itself.
   */
  public playCue(
    cue: CinematicSoundCue,
    options: PlayCinematicCueOptions = {},
  ): boolean {
    const context = this.context;
    if (
      !context ||
      !this.started ||
      this.destroyed ||
      context.state !== "running" ||
      this.visibilitySuspended
    ) {
      return false;
    }

    const bus = options.bus ?? "dialogue";
    const intensity = clamp(options.intensity ?? 1, 0, 1.5);
    const now = context.currentTime + 0.012;

    switch (cue) {
      case "case-open":
        this.playTone(196, now, 0.3, 0.075 * intensity, bus, "sine");
        this.playTone(293.66, now + 0.12, 0.42, 0.055 * intensity, bus, "sine");
        break;
      case "clue":
        this.playTone(523.25, now, 0.16, 0.055 * intensity, bus, "sine");
        this.playTone(783.99, now + 0.08, 0.24, 0.04 * intensity, bus, "sine");
        break;
      case "deduction":
        [392, 493.88, 659.25].forEach((frequency, index) => {
          this.playTone(
            frequency,
            now + index * 0.11,
            0.48,
            0.038 * intensity,
            bus,
            "sine",
          );
        });
        break;
      case "footsteps":
        this.playTone(74, now, 0.11, 0.12 * intensity, bus, "triangle");
        this.playTone(68, now + 0.19, 0.12, 0.1 * intensity, bus, "triangle");
        break;
      case "paper":
        this.playNoiseBurst(now, 0.26, 0.065 * intensity, bus, "highpass", 1850);
        this.playNoiseBurst(
          now + 0.09,
          0.18,
          0.04 * intensity,
          bus,
          "bandpass",
          3400,
        );
        break;
      case "reveal":
        this.playTone(98, now, 0.72, 0.075 * intensity, bus, "sine");
        this.playTone(392, now + 0.45, 0.7, 0.045 * intensity, bus, "sine");
        this.playTone(587.33, now + 0.58, 0.62, 0.035 * intensity, bus, "sine");
        break;
      case "telegram":
        [0, 0.13, 0.38, 0.51].forEach((offset, index) => {
          this.playTone(
            index < 2 ? 830 : 740,
            now + offset,
            index < 2 ? 0.065 : 0.11,
            0.047 * intensity,
            bus,
            "square",
          );
        });
        break;
      case "ui":
        this.playTone(440, now, 0.045, 0.026 * intensity, bus, "sine");
        break;
    }

    this.cueCount += 1;
    this.lastCue = cue;
    this.publishDebug();
    return true;
  }

  /**
   * Decodes and plays a same-origin production asset through the existing
   * Web Audio graph. The method never creates or resumes an AudioContext, so a
   * trusted interaction must have completed `start()` first. Decoded buffers
   * are cached for the lifetime of this engine and are released by destroy().
   */
  public async playAsset(
    url: string,
    options: PlayCinematicAssetOptions = {},
  ): Promise<CinematicAudioAssetPlayback | null> {
    const context = this.context;
    const revision = this.lifecycleRevision;
    if (
      !context ||
      !this.started ||
      this.destroyed ||
      context.state !== "running" ||
      this.visibilitySuspended ||
      !this.isSafeAssetUrl(url)
    ) {
      return null;
    }

    const buffer = await this.loadAssetBuffer(url, context);
    if (
      !buffer ||
      revision !== this.lifecycleRevision ||
      context !== this.context ||
      !this.started ||
      this.destroyed ||
      context.state !== "running" ||
      this.visibilitySuspended
    ) {
      if (!buffer) {
        this.assetFailureCount += 1;
        this.publishDebug();
      }
      return null;
    }

    const destination =
      (options.bus ?? "dialogue") === "dialogue"
        ? this.dialogueGain
        : this.ambienceGain;
    if (!destination) return null;

    try {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      source.loop = options.loop ?? false;
      gain.gain.value = clamp(options.gain ?? 1, 0, 2);
      source.connect(gain);
      gain.connect(destination);

      let stopped = false;
      let settled = false;
      let resolveResult!: (result: CinematicAudioAssetResult) => void;
      const result = new Promise<CinematicAudioAssetResult>((resolve) => {
        resolveResult = resolve;
      });

      const finish = (outcome: CinematicAudioAssetResult) => {
        if (settled) return;
        settled = true;
        this.assetSources.delete(source);
        this.assetNodes.delete(source);
        this.assetNodes.delete(gain);
        this.assetStops.delete(stop);
        try {
          source.disconnect();
        } catch {
          // A concurrent engine teardown may already have disconnected it.
        }
        try {
          gain.disconnect();
        } catch {
          // A concurrent engine teardown may already have disconnected it.
        }
        resolveResult(outcome);
        this.publishDebug();
      };

      const stop = () => {
        if (settled) return;
        stopped = true;
        try {
          source.stop();
        } catch {
          finish("stopped");
        }
      };

      source.addEventListener(
        "ended",
        () => finish(stopped ? "stopped" : "complete"),
        { once: true },
      );

      this.assetSources.add(source);
      this.assetNodes.add(source);
      this.assetNodes.add(gain);
      this.assetStops.add(stop);
      this.assetPlaybackCount += 1;
      const startedAtContextTime = context.currentTime + 0.012;
      source.start(startedAtContextTime);
      this.publishDebug();

      return Object.freeze({
        url,
        durationMs: buffer.duration * 1_000,
        startedAtContextTime,
        result,
        setGain: (value: number) => this.rampGain(gain, clamp(value, 0, 2)),
        stop,
      });
    } catch {
      this.assetFailureCount += 1;
      this.publishDebug();
      return null;
    }
  }

  /**
   * Adds visibility suspension to a custom Document. Calling this method does
   * not initialize audio. The constructor's document is used by default.
   */
  public bindVisibility(): void {
    if (this.visibilityBound || !this.documentRef || this.destroyed) return;

    this.visibilityListener = () => {
      const hidden = this.documentRef?.hidden ?? false;
      if (hidden) {
        const revision = ++this.lifecycleRevision;
        const wasRunning =
          this.started && this.context?.state === "running" && !this.manuallySuspended;
        this.visibilitySuspended = true;
        this.resumeAfterVisibility = wasRunning;
        void this.suspendForVisibility(revision);
        return;
      }

      const shouldResume =
        this.resumeAfterVisibility && this.started && !this.manuallySuspended;
      this.visibilitySuspended = false;
      this.resumeAfterVisibility = false;

      if (shouldResume) {
        const revision = ++this.lifecycleRevision;
        void this.resumeAfterVisibilityChange(revision);
      }
      else this.publishDebug();
    };

    this.documentRef.addEventListener(
      "visibilitychange",
      this.visibilityListener,
    );
    this.visibilityBound = true;
    this.publishDebug();
  }

  public unbindVisibility(): void {
    if (!this.visibilityBound || !this.documentRef || !this.visibilityListener) {
      return;
    }

    this.documentRef.removeEventListener(
      "visibilitychange",
      this.visibilityListener,
    );
    this.visibilityListener = null;
    this.visibilityBound = false;
    this.publishDebug();
  }

  public getDebugSnapshot(): CinematicAudioDebugSnapshot {
    const supported = Boolean(this.contextFactory) || isCinematicAudioSupported();
    const contextState = this.context
      ? this.context.state
      : supported
        ? "uninitialized"
        : "unavailable";

    return Object.freeze({
      explicitStartRequired: true,
      supported,
      initialized: this.context !== null,
      initializationCount: this.initializationCount,
      startInvocationCount: this.startInvocationCount,
      started: this.started,
      status: this.status,
      contextState,
      scene: this.scene,
      sceneChangeCount: this.sceneChangeCount,
      masterVolume: this.masterVolume,
      ambienceVolume: this.ambienceVolume,
      dialogueVolume: this.dialogueVolume,
      effectiveDialogueVolume: this.getEffectiveDialogueVolume(),
      intervalCount: this.sceneIntervals.size,
      ambientSourceCount: this.ambientSources.size,
      ambientNodeCount: this.ambientNodes.size,
      transientSourceCount: this.transientSources.size,
      transientNodeCount: this.transientNodes.size,
      cueCount: this.cueCount,
      lastCue: this.lastCue,
      lastAmbientEvent: this.lastAmbientEvent,
      decodedAssetCount: this.decodedAssets.size,
      activeAssetSourceCount: this.assetSources.size,
      activeAssetNodeCount: this.assetNodes.size,
      assetPlaybackCount: this.assetPlaybackCount,
      assetFailureCount: this.assetFailureCount,
      dialogueDucking: this.dialogueDucking,
      manuallySuspended: this.manuallySuspended,
      visibilitySuspended: this.visibilitySuspended,
      visibilityBound: this.visibilityBound,
    });
  }

  private initializeContext(): boolean {
    if (this.context || this.destroyed) return Boolean(this.context);

    let createdContext: AudioContext | null = null;

    try {
      const constructor = getBrowserAudioContextConstructor();
      if (this.contextFactory) {
        createdContext = this.contextFactory();
      } else if (constructor) {
        try {
          createdContext = new constructor({ latencyHint: "interactive" });
        } catch {
          // Older WebKit releases expose AudioContext but reject options.
          createdContext = new constructor();
        }
      }

      if (!createdContext) return false;

      const masterGain = createdContext.createGain();
      const ambienceGain = createdContext.createGain();
      const dialogueGain = createdContext.createGain();

      masterGain.gain.value = this.masterVolume;
      ambienceGain.gain.value = this.ambienceVolume;
      dialogueGain.gain.value = this.dialogueVolume;
      ambienceGain.connect(masterGain);
      dialogueGain.connect(masterGain);
      masterGain.connect(createdContext.destination);

      this.context = createdContext;
      this.masterGain = masterGain;
      this.ambienceGain = ambienceGain;
      this.dialogueGain = dialogueGain;
      this.noiseBuffer = this.createNoiseBuffer(createdContext);
      this.initializationCount += 1;

      createdContext.addEventListener(
        "statechange",
        this.handleContextStateChange,
      );
      return true;
    } catch {
      if (createdContext && createdContext.state !== "closed") {
        void createdContext.close().catch(() => undefined);
      }
      this.context = null;
      this.masterGain = null;
      this.ambienceGain = null;
      this.dialogueGain = null;
      this.noiseBuffer = null;
      return false;
    }
  }

  private readonly handleContextStateChange = (): void => {
    if (!this.context || this.destroyed) return;
    if (this.context.state === "running" && this.started) this.status = "running";
    else if (this.context.state === "closed") this.status = "unavailable";
    else if (this.started) this.status = "suspended";
    this.publishDebug();
  };

  private createNoiseBuffer(context: AudioContext): AudioBuffer {
    const durationSeconds = 2;
    const frameCount = Math.max(1, Math.floor(context.sampleRate * durationSeconds));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;

    for (let index = 0; index < data.length; index += 1) {
      const white = clamp(this.random(), 0, 1) * 2 - 1;
      // A small amount of correlation softens the synthetic white noise.
      previous = previous * 0.22 + white * 0.78;
      data[index] = previous;
    }

    return buffer;
  }

  private startSceneAmbience(): void {
    const context = this.context;
    if (
      !context ||
      !this.started ||
      context.state !== "running" ||
      this.visibilitySuspended ||
      this.manuallySuspended
    ) {
      return;
    }

    this.clearSceneIntervals();
    this.stopAmbientSources();
    this.lastAmbientEvent = null;

    switch (this.scene) {
      case "summons":
        this.startNoiseBed("lowpass", 1650, 0.72, 0.082);
        this.startNoiseBed("bandpass", 3900, 0.9, 0.022);
        this.startOscillatorBed(52, 0.012, "sine");
        this.addSceneInterval(9_000, () => this.playClockChime());
        break;
      case "passage":
        this.startNoiseBed("lowpass", 1500, 0.65, 0.068);
        this.startNoiseBed("bandpass", 3500, 0.82, 0.025);
        this.startOscillatorBed(46, 0.014, "sine");
        this.addSceneInterval(1_480, () => this.playHansomRhythm());
        break;
      case "room":
        this.startNoiseBed("bandpass", 1320, 1.1, 0.017);
        this.startOscillatorBed(57, 0.008, "sine");
        this.addSceneInterval(1_260, () => this.playFireCrackle());
        break;
      case "archive":
        this.startNoiseBed("lowpass", 880, 0.74, 0.015);
        this.startOscillatorBed(50, 0.006, "sine");
        this.addSceneInterval(6_400, () => this.playArchiveRustle());
        break;
      case "conclusion":
        this.startNoiseBed("bandpass", 690, 0.72, 0.019);
        this.startOscillatorBed(62, 0.0065, "sine");
        this.startOscillatorBed(93, 0.003, "sine");
        this.addSceneInterval(10_800, () => this.playResolutionChime());
        break;
    }

    this.sceneMixDirty = false;
    this.publishDebug();
  }

  private startNoiseBed(
    filterType: BiquadFilterType,
    frequency: number,
    quality: number,
    level: number,
  ): void {
    const context = this.context;
    const bus = this.ambienceGain;
    const buffer = this.noiseBuffer;
    if (!context || !bus || !buffer) return;

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = quality;
    gain.gain.value = level;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    this.ambientSources.add(source);
    this.ambientNodes.add(source);
    this.ambientNodes.add(filter);
    this.ambientNodes.add(gain);
    source.start();
  }

  private startOscillatorBed(
    frequency: number,
    level: number,
    type: OscillatorType,
  ): void {
    const context = this.context;
    const bus = this.ambienceGain;
    if (!context || !bus) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gain.gain.value = level;
    oscillator.connect(gain);
    gain.connect(bus);

    this.ambientSources.add(oscillator);
    this.ambientNodes.add(oscillator);
    this.ambientNodes.add(gain);
    oscillator.start();
  }

  private playClockChime(): void {
    if (!this.canScheduleBackgroundEvent()) return;
    const now = this.context!.currentTime + 0.02;
    this.playTone(196, now, 0.75, 0.022, "ambience", "sine");
    this.playTone(293.66, now + 0.26, 0.9, 0.016, "ambience", "sine");
    this.noteAmbientEvent("clock-chime");
  }

  private playHansomRhythm(): void {
    if (!this.canScheduleBackgroundEvent()) return;
    const now = this.context!.currentTime + 0.01;
    this.playTone(67, now, 0.1, 0.035, "ambience", "triangle");
    this.playTone(73, now + 0.2, 0.09, 0.03, "ambience", "triangle");
    this.playNoiseBurst(now + 0.03, 0.12, 0.012, "ambience", "lowpass", 540);
    this.noteAmbientEvent("hansom-hoofbeat");
  }

  private playFireCrackle(): void {
    if (!this.canScheduleBackgroundEvent() || this.safeRandom() < 0.26) return;
    const now = this.context!.currentTime + 0.01;
    const frequency = 950 + this.safeRandom() * 1_700;
    this.playNoiseBurst(
      now,
      0.028 + this.safeRandom() * 0.055,
      0.014,
      "ambience",
      "bandpass",
      frequency,
    );
    this.noteAmbientEvent("gas-fire-crackle");
  }

  private playArchiveRustle(): void {
    if (!this.canScheduleBackgroundEvent()) return;
    const now = this.context!.currentTime + 0.01;
    this.playNoiseBurst(now, 0.31, 0.018, "ambience", "highpass", 1_700);
    this.playNoiseBurst(
      now + 0.13,
      0.24,
      0.012,
      "ambience",
      "bandpass",
      3_200,
    );
    this.noteAmbientEvent("archive-paper-rustle");
  }

  private playResolutionChime(): void {
    if (!this.canScheduleBackgroundEvent()) return;
    const now = this.context!.currentTime + 0.02;
    this.playTone(293.66, now, 0.85, 0.015, "ambience", "sine");
    this.playTone(440, now + 0.18, 0.95, 0.012, "ambience", "sine");
    this.playTone(587.33, now + 0.34, 1.05, 0.009, "ambience", "sine");
    this.noteAmbientEvent("resolution-chime");
  }

  private playTone(
    frequency: number,
    startsAt: number,
    duration: number,
    peak: number,
    bus: CinematicAudioBus,
    type: OscillatorType,
  ): void {
    const context = this.context;
    const destination = bus === "dialogue" ? this.dialogueGain : this.ambienceGain;
    if (!context || !destination || context.state === "closed") return;

    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const safeDuration = Math.max(0.025, duration);
    const safeStart = Math.max(context.currentTime, startsAt);
    const attackEnds = safeStart + Math.min(0.035, safeDuration * 0.24);
    const releaseStarts = safeStart + safeDuration * 0.56;
    const endsAt = safeStart + safeDuration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, safeStart);
    envelope.gain.setValueAtTime(MIN_ENVELOPE_GAIN, safeStart);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(MIN_ENVELOPE_GAIN, peak),
      attackEnds,
    );
    envelope.gain.setValueAtTime(
      Math.max(MIN_ENVELOPE_GAIN, peak),
      releaseStarts,
    );
    envelope.gain.exponentialRampToValueAtTime(MIN_ENVELOPE_GAIN, endsAt);
    oscillator.connect(envelope);
    envelope.connect(destination);

    this.registerTransient(oscillator, [oscillator, envelope]);
    oscillator.start(safeStart);
    oscillator.stop(endsAt + 0.025);
  }

  private playNoiseBurst(
    startsAt: number,
    duration: number,
    peak: number,
    bus: CinematicAudioBus,
    filterType: BiquadFilterType,
    frequency: number,
  ): void {
    const context = this.context;
    const buffer = this.noiseBuffer;
    const destination = bus === "dialogue" ? this.dialogueGain : this.ambienceGain;
    if (!context || !buffer || !destination || context.state === "closed") return;

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    const safeDuration = Math.max(0.025, Math.min(duration, buffer.duration * 0.8));
    const safeStart = Math.max(context.currentTime, startsAt);
    const endsAt = safeStart + safeDuration;
    const maximumOffset = Math.max(0, buffer.duration - safeDuration - 0.01);
    const offset = this.safeRandom() * maximumOffset;

    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, safeStart);
    filter.Q.value = filterType === "bandpass" ? 0.85 : 0.55;
    envelope.gain.setValueAtTime(MIN_ENVELOPE_GAIN, safeStart);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(MIN_ENVELOPE_GAIN, peak),
      safeStart + Math.min(0.018, safeDuration * 0.25),
    );
    envelope.gain.exponentialRampToValueAtTime(MIN_ENVELOPE_GAIN, endsAt);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(destination);

    this.registerTransient(source, [source, filter, envelope]);
    source.start(safeStart, offset, safeDuration);
  }

  private registerTransient(
    source: AudioScheduledSourceNode,
    nodes: readonly AudioNode[],
  ): void {
    this.transientSources.add(source);
    nodes.forEach((node) => this.transientNodes.add(node));

    source.addEventListener(
      "ended",
      () => {
        this.transientSources.delete(source);
        nodes.forEach((node) => {
          this.transientNodes.delete(node);
          try {
            node.disconnect();
          } catch {
            // A teardown may already have disconnected this node.
          }
        });
        this.publishDebug();
      },
      { once: true },
    );
  }

  private addSceneInterval(delay: number, callback: () => void): void {
    const sceneAtRegistration = this.scene;
    const interval = setInterval(() => {
      if (this.scene !== sceneAtRegistration || !this.started) return;
      callback();
    }, delay);
    this.sceneIntervals.add(interval);
  }

  private canScheduleBackgroundEvent(): boolean {
    return Boolean(
      this.context &&
        this.context.state === "running" &&
        this.started &&
        !this.visibilitySuspended &&
        !this.manuallySuspended,
    );
  }

  private noteAmbientEvent(eventName: string): void {
    this.lastAmbientEvent = eventName;
    this.publishDebug();
  }

  private clearSceneIntervals(): void {
    this.sceneIntervals.forEach((interval) => clearInterval(interval));
    this.sceneIntervals.clear();
  }

  private stopAmbientSources(): void {
    this.ambientSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // The source may already have ended during a scene transition.
      }
    });
    this.ambientSources.clear();

    this.ambientNodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // Disconnection is idempotent for our lifecycle purposes.
      }
    });
    this.ambientNodes.clear();
  }

  private stopTransientSources(): void {
    this.transientSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // The scheduled source may already be complete.
      }
    });
    this.transientSources.clear();

    this.transientNodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // The ended handler may already have removed this node.
      }
    });
    this.transientNodes.clear();
  }

  private stopAssetSources(): void {
    [...this.assetStops].forEach((stop) => stop());
    this.assetStops.clear();
    this.assetSources.clear();
    this.assetNodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // An ended handler may already have released this node.
      }
    });
    this.assetNodes.clear();
    this.publishDebug();
  }

  private isSafeAssetUrl(url: string): boolean {
    return (
      /^\/audio\/[a-z0-9/_.-]+\.(?:mp3|ogg|opus|wav)$/i.test(url) &&
      !url.includes("..")
    );
  }

  private loadAssetBuffer(
    url: string,
    context: AudioContext,
  ): Promise<AudioBuffer | null> {
    const cached = this.decodedAssets.get(url);
    if (cached) return cached;

    if (
      typeof globalThis.fetch !== "function" ||
      typeof context.decodeAudioData !== "function"
    ) {
      return Promise.resolve(null);
    }

    const request = (async () => {
      const response = await globalThis.fetch(url, {
        cache: "force-cache",
        credentials: "same-origin",
      });
      if (!response.ok) return null;
      const encoded = await response.arrayBuffer();
      if (encoded.byteLength === 0) return null;
      return context.decodeAudioData(encoded.slice(0));
    })().catch(() => null);

    this.decodedAssets.set(url, request);
    return request;
  }

  private rampGain(
    node: GainNode | null,
    value: number,
    timeConstant = 0.035,
  ): void {
    const context = this.context;
    if (!context || !node || context.state === "closed") return;
    const now = context.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setTargetAtTime(value, now, timeConstant);
  }

  private async rollbackFailedStart(
    revision: number,
    status: Extract<CinematicAudioStatus, "suspended" | "unavailable">,
  ): Promise<false> {
    if (revision !== this.lifecycleRevision || this.destroyed) return false;

    this.started = false;
    this.dialogueDucking = false;
    this.manuallySuspended = false;
    this.resumeAfterVisibility = false;
    this.visibilitySuspended = Boolean(this.documentRef?.hidden);
    this.clearSceneIntervals();
    this.stopAmbientSources();
    this.stopTransientSources();
    this.stopAssetSources();

    // A previously queued visibility resume may already be inside the browser
    // call. Drain it before suspension so a failed start cannot later wake up.
    await this.contextTransition.catch(() => undefined);
    await this.awaitDirectResumes();
    if (revision !== this.lifecycleRevision || this.destroyed) return false;

    await this.suspendContext();
    if (revision !== this.lifecycleRevision || this.destroyed) return false;

    this.status = status;
    this.publishDebug();
    return false;
  }

  private queueContextTransition(
    revision: number,
    transition: () => Promise<void>,
  ): Promise<boolean> {
    const operation = this.contextTransition
      .catch(() => undefined)
      .then(async () => {
        if (revision !== this.lifecycleRevision || this.destroyed) return false;

        try {
          await transition();
        } catch {
          return false;
        }

        return revision === this.lifecycleRevision && !this.destroyed;
      });

    this.contextTransition = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  private async resumeContextDirect(context: AudioContext): Promise<void> {
    const resume = context.resume();
    this.directResumes.add(resume);
    try {
      await resume;
    } finally {
      this.directResumes.delete(resume);
    }
  }

  private async awaitDirectResumes(): Promise<void> {
    if (this.directResumes.size === 0) return;
    await Promise.allSettled(Array.from(this.directResumes));
  }

  private async suspendContext(): Promise<void> {
    const context = this.context;
    if (!context || context.state === "closed" || context.state === "suspended") {
      return;
    }

    try {
      await context.suspend();
    } catch {
      // Browser teardown can race with suspension.
    }
  }

  private async suspendForVisibility(revision: number): Promise<void> {
    if (revision !== this.lifecycleRevision || this.destroyed) return;

    const shouldClearMix = this.started && !this.manuallySuspended;
    if (shouldClearMix) {
      this.clearSceneIntervals();
      this.stopAmbientSources();
      this.stopTransientSources();
    }

    const authoritative = await this.queueContextTransition(revision, async () => {
      await this.awaitDirectResumes();
      if (revision !== this.lifecycleRevision) return;
      await this.suspendContext();
    });
    if (!authoritative) return;

    if (this.started && !this.manuallySuspended) {
      this.status = "suspended";
    }
    this.publishDebug();
  }

  private async resumeAfterVisibilityChange(revision: number): Promise<void> {
    const context = this.context;
    if (
      revision !== this.lifecycleRevision ||
      this.destroyed ||
      !context ||
      context.state === "closed" ||
      !this.started
    ) {
      this.publishDebug();
      return;
    }

    const authoritative = await this.queueContextTransition(revision, async () => {
      await this.awaitDirectResumes();
      if (revision !== this.lifecycleRevision) return;
      if (context.state !== "running") await context.resume();
    });

    if (!authoritative) {
      if (revision === this.lifecycleRevision && !this.destroyed) {
        this.status = "suspended";
        this.publishDebug();
      }
      return;
    }

    if (
      !this.started ||
      this.manuallySuspended ||
      this.visibilitySuspended ||
      this.documentRef?.hidden ||
      context.state !== "running"
    ) {
      this.status = "suspended";
      this.publishDebug();
      return;
    }

    if (this.sceneMixDirty || this.ambientSources.size === 0) {
      this.startSceneAmbience();
    }
    this.status = "running";
    this.publishDebug();
  }

  private unbindContextStateChange(): void {
    this.context?.removeEventListener(
      "statechange",
      this.handleContextStateChange,
    );
  }

  private safeRandom(): number {
    return clamp(this.random(), 0, 1);
  }

  private publishDebug(): void {
    const snapshot = this.getDebugSnapshot();

    if (this.publishDebugEnabled && typeof globalThis !== "undefined") {
      const debugGlobal = globalThis as unknown as Record<string, unknown>;
      debugGlobal[DEBUG_GLOBAL_KEY] = snapshot;
    }

    try {
      this.onDebugChange?.(snapshot);
    } catch {
      // Observability must never interrupt audio lifecycle work.
    }
  }
}
