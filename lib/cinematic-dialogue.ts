import { CINEMATIC_AUDIO_MANIFEST } from "./cinematic-audio-manifest";
import type {
  CinematicAudioAssetPlayback,
  PlayCinematicAssetOptions,
} from "./cinematic-audio";
import type {
  DialogueCharacter,
  DialogueLine,
  DialogueSceneId,
} from "./dialogue-script";

export type DialoguePlaybackResult = "complete" | "stopped";

export type DialoguePlaybackOptions = {
  scene?: DialogueSceneId;
  getVolume: () => number;
  onLineStart: (line: DialogueLine, index: number) => void;
  onLineEnd?: (line: DialogueLine, index: number) => void;
  onSpeechStart?: (line: DialogueLine, index: number) => void;
  onSpeechActivityChange?: (active: boolean) => void;
};

export type CinematicDialogueAssetTransport = {
  playAsset: (
    url: string,
    options?: PlayCinematicAssetOptions,
  ) => Promise<CinematicAudioAssetPlayback | null>;
};

type VoiceDirection = {
  rate: number;
  pitch: number;
  preferredNames: string[];
};

const DIRECTIONS: Record<DialogueCharacter, VoiceDirection> = {
  "Sherlock Holmes": {
    rate: 0.88,
    pitch: 0.76,
    preferredNames: ["Daniel", "Arthur", "Oliver", "Thomas"],
  },
  "Dr. Watson": {
    rate: 0.93,
    pitch: 0.94,
    preferredNames: ["Arthur", "Daniel", "Oliver", "George"],
  },
  "Inspector Lestrade": {
    rate: 0.97,
    pitch: 0.82,
    preferredNames: ["Thomas", "Daniel", "Arthur", "Oliver"],
  },
  "Inspector Gregory": {
    rate: 0.94,
    pitch: 0.86,
    preferredNames: ["George", "Thomas", "Daniel", "Arthur"],
  },
  "Irene Adler": {
    rate: 0.9,
    pitch: 1.08,
    preferredNames: ["Serena", "Martha", "Kate", "Stephanie"],
  },
  "Mrs. Hudson": {
    rate: 0.92,
    pitch: 1.02,
    preferredNames: ["Martha", "Serena", "Kate", "Stephanie"],
  },
  "Hansom driver": {
    rate: 0.98,
    pitch: 0.8,
    preferredNames: ["Thomas", "George", "Daniel", "Arthur"],
  },
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const captionDuration = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  return Math.min(8_000, Math.max(2_200, words * 340));
};

/**
 * Plays a self-hosted produced scene stem through the supplied Web Audio
 * transport. If an asset cannot be decoded, it falls back to a local browser
 * voice and finally to timed captions. No runtime provider call is made.
 */
export class CinematicDialoguePlayer {
  private readonly assetTransport: CinematicDialogueAssetTransport | null;
  private generation = 0;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private activeTimer: number | null = null;
  private activeResolver: (() => void) | null = null;
  private activeDialogueAsset: CinematicAudioAssetPlayback | null = null;
  private activeAmbienceAsset: CinematicAudioAssetPlayback | null = null;
  private readonly activeCueTimers = new Set<number>();

  public constructor(assetTransport: CinematicDialogueAssetTransport | null = null) {
    this.assetTransport = assetTransport;
  }

  public isVoiceAvailable(): boolean {
    return this.assetTransport !== null || this.isSystemVoiceAvailable();
  }

  private isSystemVoiceAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof window.speechSynthesis?.speak === "function" &&
      typeof window.SpeechSynthesisUtterance === "function"
    );
  }

  public stop(): void {
    this.generation += 1;
    this.activeCueTimers.forEach((timer) => window.clearTimeout(timer));
    this.activeCueTimers.clear();
    this.activeDialogueAsset?.stop();
    this.activeAmbienceAsset?.stop();
    this.activeDialogueAsset = null;
    this.activeAmbienceAsset = null;
    const settle = this.activeResolver;
    this.activeResolver = null;
    if (this.activeTimer !== null) window.clearTimeout(this.activeTimer);
    this.activeTimer = null;
    this.activeUtterance = null;
    if (this.isSystemVoiceAvailable()) window.speechSynthesis.cancel();
    settle?.();
  }

  public async play(
    lines: readonly DialogueLine[],
    options: DialoguePlaybackOptions,
  ): Promise<DialoguePlaybackResult> {
    this.stop();
    const generation = this.generation;

    const generatedResult = await this.playGeneratedScene(
      lines,
      options,
      generation,
    );
    if (generatedResult) return generatedResult;

    for (let index = 0; index < lines.length; index += 1) {
      if (generation !== this.generation) return "stopped";
      const line = lines[index];
      options.onLineStart(line, index);
      await this.performLine(
        line,
        clamp(options.getVolume()),
        generation,
        () => options.onSpeechStart?.(line, index),
        (active) => options.onSpeechActivityChange?.(active),
      );
      if (generation !== this.generation) return "stopped";
      options.onLineEnd?.(line, index);
      await this.waitFor(index === lines.length - 1 ? 140 : 320, generation);
    }

    return generation === this.generation ? "complete" : "stopped";
  }

  private async playGeneratedScene(
    lines: readonly DialogueLine[],
    options: DialoguePlaybackOptions,
    generation: number,
  ): Promise<DialoguePlaybackResult | null> {
    const sceneId = options.scene;
    if (!sceneId || !this.assetTransport || typeof window === "undefined") {
      return null;
    }

    const scene = CINEMATIC_AUDIO_MANIFEST.scenes[sceneId];
    if (
      scene.lines.length !== lines.length ||
      scene.lines.some(
        (manifestLine, index) =>
          manifestLine.index !== index ||
          manifestLine.speaker !== lines[index]?.speaker ||
          manifestLine.text !== lines[index]?.text,
      )
    ) {
      return null;
    }

    const [ambience, dialogue] = await Promise.all([
      this.assetTransport.playAsset(scene.ambienceLoop.url, {
        bus: "ambience",
        gain: 1.45,
        loop: true,
      }),
      this.assetTransport.playAsset(scene.dialogueStem.url, {
        bus: "dialogue",
      }),
    ]);

    if (generation !== this.generation) {
      ambience?.stop();
      dialogue?.stop();
      return "stopped";
    }

    this.activeAmbienceAsset = ambience;
    if (!dialogue) return null;
    this.activeDialogueAsset = dialogue;

    const schedule = (delayMs: number, callback: () => void) => {
      const timer = window.setTimeout(() => {
        this.activeCueTimers.delete(timer);
        if (generation === this.generation) callback();
      }, Math.max(0, delayMs + 12));
      this.activeCueTimers.add(timer);
    };

    scene.lines.forEach((cue, index) => {
      const line = lines[index];
      schedule(cue.startMs, () => {
        options.onLineStart(line, index);
        const audible = clamp(options.getVolume()) > 0;
        options.onSpeechActivityChange?.(audible);
        if (audible) options.onSpeechStart?.(line, index);
      });
      schedule(cue.endMs, () => {
        options.onSpeechActivityChange?.(false);
        options.onLineEnd?.(line, index);
      });
    });

    const assetResult = await dialogue.result;
    if (this.activeDialogueAsset === dialogue) this.activeDialogueAsset = null;
    this.activeCueTimers.forEach((timer) => window.clearTimeout(timer));
    this.activeCueTimers.clear();
    options.onSpeechActivityChange?.(false);
    if (generation !== this.generation || assetResult === "stopped") {
      return "stopped";
    }
    return assetResult === "complete" ? "complete" : null;
  }

  private selectVoice(speaker: DialogueCharacter): SpeechSynthesisVoice | null {
    if (!this.isSystemVoiceAvailable()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    const direction = DIRECTIONS[speaker];
    const localVoices = voices.filter((voice) => voice.localService);
    if (localVoices.length === 0) return null;
    const english = localVoices.filter((voice) => /^en[-_]/i.test(voice.lang));
    const british = english.filter((voice) => /^en[-_]GB$/i.test(voice.lang));
    const candidates =
      british.length > 0 ? british : english.length > 0 ? english : localVoices;
    return (
      candidates.find((voice) =>
        direction.preferredNames.some((name) =>
          voice.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()),
        ),
      ) ?? candidates[0]
    );
  }

  private async performLine(
    line: DialogueLine,
    volume: number,
    generation: number,
    onSpeechStart: () => void,
    onSpeechActiveChange: (active: boolean) => void,
  ): Promise<void> {
    const lineStartedAt = window.performance.now();
    const lineCaptionDuration = captionDuration(line.text);

    if (volume <= 0) {
      onSpeechActiveChange(false);
      await this.waitFor(lineCaptionDuration, generation);
      return;
    }

    if (!this.isSystemVoiceAvailable()) {
      onSpeechActiveChange(false);
      await this.waitFor(lineCaptionDuration, generation);
      return;
    }

    let voice = this.selectVoice(line.speaker);
    if (!voice) {
      await this.waitFor(450, generation);
      if (generation !== this.generation) return;
      voice = this.selectVoice(line.speaker);
    }
    if (!voice) {
      onSpeechActiveChange(false);
      await this.waitFor(lineCaptionDuration, generation);
      return;
    }

    const result = await new Promise<"complete" | "failed">((resolve) => {
      if (generation !== this.generation) {
        resolve("complete");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(line.text);
      const direction = DIRECTIONS[line.speaker];
      utterance.lang = "en-GB";
      utterance.rate = direction.rate;
      utterance.pitch = direction.pitch;
      utterance.volume = volume;
      utterance.voice = voice;
      this.activeUtterance = utterance;

      let settled = false;
      let speechActive = false;
      const setSpeechActive = (active: boolean) => {
        if (speechActive === active) return;
        speechActive = active;
        onSpeechActiveChange(active);
      };
      const finish = (result: "complete" | "failed" = "complete") => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        if (this.activeTimer === timeout) this.activeTimer = null;
        if (this.activeResolver === finish) this.activeResolver = null;
        if (this.activeUtterance === utterance) this.activeUtterance = null;
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
        setSpeechActive(false);
        resolve(result);
      };
      const timeout = window.setTimeout(
        () => finish("failed"),
        lineCaptionDuration + 4_000,
      );
      this.activeTimer = timeout;
      this.activeResolver = finish;
      utterance.onstart = () => {
        if (!settled && generation === this.generation) setSpeechActive(true);
      };
      utterance.onend = () => finish("complete");
      utterance.onerror = () => finish("failed");

      try {
        window.speechSynthesis.speak(utterance);
        onSpeechStart();
      } catch {
        finish("failed");
      }
    });

    if (result === "failed" && generation === this.generation) {
      const elapsed = window.performance.now() - lineStartedAt;
      const remainingCaptionTime = Math.max(0, lineCaptionDuration - elapsed);
      await this.waitFor(remainingCaptionTime, generation);
    }
  }

  private async waitFor(duration: number, generation: number): Promise<void> {
    if (generation !== this.generation) return;
    await new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (this.activeTimer === timer) this.activeTimer = null;
        if (this.activeResolver === finish) this.activeResolver = null;
        resolve();
      };
      const timer = window.setTimeout(finish, duration);
      this.activeTimer = timer;
      this.activeResolver = finish;
    });
  }
}
