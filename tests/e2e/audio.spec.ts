import { expect, test, type Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPrimaryTouchTargets,
  monitorRuntime,
  waitForCasebookHydration,
} from "./helpers";

type AudioHarnessOptions = {
  brokenAudio?: boolean;
  delayedAudioStartMs?: number;
  disableAudio?: boolean;
  disableSpeech?: boolean;
  speechDwellMs?: number;
  speechFailure?: "error" | "throw";
  speechStartDelayMs?: number;
  webkitOnly?: boolean;
};

async function installAudioHarness(page: Page, options: AudioHarnessOptions = {}) {
  await page.addInitScript((settings) => {
    const qaWindow = window as Window & {
      __qaAudioContextConstructed?: number;
      __qaSpeechRequests?: string[];
      __qaSpeechCancels?: number;
      __qaSetAudioHidden?: (hidden: boolean) => void;
      webkitAudioContext?: typeof AudioContext;
    };
    qaWindow.__qaAudioContextConstructed = 0;
    qaWindow.__qaSpeechRequests = [];
    qaWindow.__qaSpeechCancels = 0;

    const NativeAudioContext = window.AudioContext;
    if (settings.disableAudio) {
      Object.defineProperty(window, "AudioContext", { configurable: true, value: undefined });
      Object.defineProperty(qaWindow, "webkitAudioContext", { configurable: true, value: undefined });
    } else if (settings.brokenAudio) {
      class QABrokenAudioContext {
        public constructor() {
          qaWindow.__qaAudioContextConstructed =
            (qaWindow.__qaAudioContextConstructed ?? 0) + 1;
          throw new Error("QA AudioContext construction failure");
        }
      }
      Object.defineProperty(window, "AudioContext", {
        configurable: true,
        value: QABrokenAudioContext,
      });
    } else if (settings.delayedAudioStartMs) {
      class QAAudioParam {
        public value = 1;
        public cancelScheduledValues() { return this; }
        public exponentialRampToValueAtTime() { return this; }
        public setTargetAtTime() { return this; }
        public setValueAtTime() { return this; }
      }
      class QAAudioNode extends EventTarget {
        public gain = new QAAudioParam();
        public frequency = new QAAudioParam();
        public Q = new QAAudioParam();
        public type = "sine";
        public buffer: AudioBuffer | null = null;
        public loop = false;
        public onended: (() => void) | null = null;
        public connect() { return this; }
        public disconnect() { return undefined; }
        public start() { return undefined; }
        public stop() {
          window.queueMicrotask(() => {
            this.onended?.();
            this.dispatchEvent(new Event("ended"));
          });
        }
      }
      class QADelayedAudioContext extends EventTarget {
        public currentTime = 0;
        public destination = new QAAudioNode();
        public sampleRate = 100;
        public state: AudioContextState = "suspended";
        public constructor() {
          super();
          qaWindow.__qaAudioContextConstructed =
            (qaWindow.__qaAudioContextConstructed ?? 0) + 1;
        }
        public createBuffer(_channels: number, length: number) {
          const data = new Float32Array(length);
          return {
            duration: length / this.sampleRate,
            getChannelData: () => data,
          } as unknown as AudioBuffer;
        }
        public createGain() { return new QAAudioNode() as unknown as GainNode; }
        public createBiquadFilter() { return new QAAudioNode() as unknown as BiquadFilterNode; }
        public createBufferSource() { return new QAAudioNode() as unknown as AudioBufferSourceNode; }
        public createOscillator() { return new QAAudioNode() as unknown as OscillatorNode; }
        public async resume() {
          await new Promise((resolve) => window.setTimeout(resolve, settings.delayedAudioStartMs));
          this.state = "running";
          this.dispatchEvent(new Event("statechange"));
        }
        public async suspend() {
          this.state = "suspended";
          this.dispatchEvent(new Event("statechange"));
        }
        public async close() {
          this.state = "closed";
          this.dispatchEvent(new Event("statechange"));
        }
      }
      Object.defineProperty(window, "AudioContext", {
        configurable: true,
        value: QADelayedAudioContext,
      });
    } else if (NativeAudioContext) {
      const InstrumentedAudioContext = new Proxy(NativeAudioContext, {
        construct(target, argumentsList, newTarget) {
          qaWindow.__qaAudioContextConstructed =
            (qaWindow.__qaAudioContextConstructed ?? 0) + 1;
          return Reflect.construct(target, argumentsList, newTarget);
        },
      });
      if (settings.webkitOnly) {
        Object.defineProperty(window, "AudioContext", { configurable: true, value: undefined });
        Object.defineProperty(qaWindow, "webkitAudioContext", {
          configurable: true,
          value: InstrumentedAudioContext,
        });
      } else {
        Object.defineProperty(window, "AudioContext", {
          configurable: true,
          value: InstrumentedAudioContext,
        });
      }
    }

    if (settings.disableSpeech) {
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
      Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: undefined });
    } else {
      class QASpeechSynthesisUtterance {
        public text: string;
        public lang = "";
        public rate = 1;
        public pitch = 1;
        public volume = 1;
        public voice: SpeechSynthesisVoice | null = null;
        public onstart: ((event: SpeechSynthesisEvent) => void) | null = null;
        public onend: ((event: SpeechSynthesisEvent) => void) | null = null;
        public onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;

        public constructor(text = "") {
          this.text = text;
        }
      }
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        configurable: true,
        value: QASpeechSynthesisUtterance,
      });
      const synthesis = window.speechSynthesis;
      Object.defineProperty(synthesis, "getVoices", {
        configurable: true,
        value: () => [
          {
            default: true,
            lang: "en-GB",
            localService: true,
            name: "QA Local British Voice",
            voiceURI: "qa-local-en-gb",
          },
        ],
      });
      Object.defineProperty(synthesis, "speak", {
        configurable: true,
        value: (utterance: SpeechSynthesisUtterance) => {
          qaWindow.__qaSpeechRequests?.push(utterance.text);
          if (settings.speechFailure === "throw") throw new Error("QA speech failure");
          const startSpeech = () =>
            utterance.onstart?.(new Event("start") as SpeechSynthesisEvent);
          if (settings.speechStartDelayMs) {
            window.setTimeout(startSpeech, settings.speechStartDelayMs);
          } else {
            startSpeech();
          }
          if (settings.speechFailure === "error") {
            window.setTimeout(
              () => utterance.onerror?.(new Event("error") as SpeechSynthesisErrorEvent),
              80,
            );
            return;
          }
          const dwell = settings.speechDwellMs ?? (
            /You see|obvious fact|dog did nothing|make a stir/i.test(utterance.text)
              ? 5_000
              : 2_000
          );
          window.setTimeout(
            () => utterance.onend?.(new Event("end") as SpeechSynthesisEvent),
            dwell,
          );
        },
      });
      Object.defineProperty(synthesis, "cancel", {
        configurable: true,
        value: () => {
          qaWindow.__qaSpeechCancels = (qaWindow.__qaSpeechCancels ?? 0) + 1;
        },
      });
    }

    let hidden = false;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => hidden,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => (hidden ? "hidden" : "visible"),
    });
    qaWindow.__qaSetAudioHidden = (next) => {
      hidden = next;
      document.dispatchEvent(new Event("visibilitychange"));
    };
  }, options);
}

test("keeps audio gesture-locked, persists mixer choices, and releases its lifecycle", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "detailed audio lifecycle runs once on desktop");
  const runtime = monitorRuntime(page);
  const requestedAudioAssets: string[] = [];
  page.on("request", (request) => {
    if (
      request.resourceType() === "media" ||
      /\.(?:aac|flac|m4a|mp3|ogg|opus|wav)(?:$|\?)/i.test(request.url())
    ) {
      requestedAudioAssets.push(request.url());
    }
  });
  await installAudioHarness(page);
  await page.goto("/");
  await waitForCasebookHydration(page);

  expect(
    await page.evaluate(
      () => (window as Window & { __qaAudioContextConstructed?: number }).__qaAudioContextConstructed,
    ),
  ).toBe(0);
  const beforeGesture = await page.evaluate(
    () =>
      (window as Window & {
        __coldEmberAudioDebug?: {
          explicitStartRequired: boolean;
          initialized: boolean;
          startInvocationCount: number;
        };
      }).__coldEmberAudioDebug,
  );
  expect(beforeGesture).toMatchObject({
    explicitStartRequired: true,
    initialized: false,
    startInvocationCount: 0,
  });
  await expect(page.locator("audio[autoplay], video[autoplay]")).toHaveCount(0);
  await expect(page.getByLabel("Cinematic sound controls")).toHaveCount(0);

  const soundToggle = page.getByRole("button", { name: "Turn cinematic sound on" });
  await soundToggle.click();
  await expect(page.getByRole("button", { name: "Turn cinematic sound off" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Cinematic sound controls")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __qaAudioContextConstructed?: number }).__qaAudioContextConstructed,
      ),
    )
    .toBe(1);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __coldEmberAudioDebug?: { status?: string } })
            .__coldEmberAudioDebug?.status,
      ),
    )
    .toBe("running");

  await page.getByRole("button", { name: "Read the telegram" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: { lastCue?: string; cueCount?: number };
          }).__coldEmberAudioDebug,
      ),
    )
    .toMatchObject({ lastCue: "telegram" });
  await page.getByRole("button", { name: "Fold the telegram" }).click();

  await page.getByRole("button", { name: "Hear conversation" }).click();
  const caption = page.getByRole("region", { name: "Dialogue caption" });
  await expect(caption).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __coldEmberDialogueDebug?: { speakRequestCount?: number } })
            .__coldEmberDialogueDebug?.speakRequestCount ?? 0,
      ),
    )
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
      ),
    )
    .toBeGreaterThan(0);
  await expect(page.getByRole("link", { name: /Canonical echo/i })).toBeVisible();
  await page.getByRole("button", { name: "Dismiss dialogue caption" }).click();
  await expect(caption).toHaveCount(0);

  await page.getByRole("button", { name: "Mixer", exact: true }).click();
  const mixer = page.getByRole("dialog", { name: "Cinematic sound mixer" });
  await expect(mixer).toBeVisible();
  await expect(mixer.getByRole("link", { name: /Read dialogue and sound provenance/i })).toHaveAttribute(
    "href",
    /github\.com\/shanto12\/sherlock-cold-ember\/blob\/main\/docs\/dialogue-sources\.md/,
  );
  await mixer.getByRole("button", { name: "Stop all sound" }).click();
  await expect(mixer.getByRole("button", { name: "Start soundscape" })).toBeVisible();
  await mixer.getByRole("button", { name: "Start soundscape" }).click();
  await expect(mixer.getByRole("button", { name: "Stop all sound" })).toBeVisible();
  await mixer.getByLabel("Master").fill("64");
  await mixer.getByLabel("Atmosphere").fill("37");
  await mixer.getByLabel("Dialogue").fill("81");
  await mixer.getByRole("button", { name: "Close sound mixer" }).click();

  const existingStop = page.getByRole("button", { name: "Stop conversation" }).first();
  if (await existingStop.isVisible().catch(() => false)) await existingStop.click();
  await page.getByRole("button", { name: "Hear conversation" }).click();
  await expect(page.getByRole("button", { name: "Stop conversation" }).first()).toBeVisible();
  const speechCancelsBeforeHide = await page.evaluate(
    () => (window as Window & { __qaSpeechCancels?: number }).__qaSpeechCancels ?? 0,
  );

  await page.evaluate(() =>
    (window as Window & { __qaSetAudioHidden?: (hidden: boolean) => void }).__qaSetAudioHidden?.(true),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: {
              visibilitySuspended?: boolean;
              intervalCount?: number;
              ambientSourceCount?: number;
              ambientNodeCount?: number;
              transientSourceCount?: number;
              transientNodeCount?: number;
            };
          }).__coldEmberAudioDebug,
      ),
    )
    .toMatchObject({
      visibilitySuspended: true,
      intervalCount: 0,
      ambientSourceCount: 0,
      ambientNodeCount: 0,
      transientSourceCount: 0,
      transientNodeCount: 0,
    });
  await expect(page.getByRole("button", { name: "Resume cinematic sound" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __qaSpeechCancels?: number }).__qaSpeechCancels ?? 0,
      ),
    )
    .toBeGreaterThan(speechCancelsBeforeHide);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberDialogueDebug?: { playing?: boolean; lastResult?: string };
          }).__coldEmberDialogueDebug,
      ),
    )
    .toMatchObject({ playing: false, lastResult: "stopped" });
  await page.evaluate(() =>
    (window as Window & { __qaSetAudioHidden?: (hidden: boolean) => void }).__qaSetAudioHidden?.(false),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __coldEmberAudioDebug?: { status?: string } })
            .__coldEmberAudioDebug?.status,
      ),
    )
    .toBe("running");
  await expect(page.getByRole("button", { name: "Turn cinematic sound off" })).toBeVisible();

  await page.getByRole("button", { name: "Mute cinematic sound" }).click();
  await expect(page.getByLabel("Cinematic sound controls")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: {
              status?: string;
              intervalCount?: number;
              ambientSourceCount?: number;
              ambientNodeCount?: number;
              transientSourceCount?: number;
              transientNodeCount?: number;
            };
          }).__coldEmberAudioDebug,
      ),
    )
    .toMatchObject({
      status: "stopped",
      intervalCount: 0,
      ambientSourceCount: 0,
      ambientNodeCount: 0,
      transientSourceCount: 0,
      transientNodeCount: 0,
    });

  const storedSettings = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cold-ember-audio-settings") ?? "{}"),
  );
  expect(storedSettings).toMatchObject({ master: 0.64, ambience: 0.37, dialogue: 0.81 });

  await page.reload();
  await waitForCasebookHydration(page);
  await expect(page.getByRole("button", { name: "Turn cinematic sound on" })).toHaveAttribute("aria-pressed", "false");
  expect(
    await page.evaluate(
      () => (window as Window & { __qaAudioContextConstructed?: number }).__qaAudioContextConstructed,
    ),
  ).toBe(0);

  await page.getByRole("button", { name: "Turn cinematic sound on" }).click();
  await expect(page.getByRole("button", { name: "Turn cinematic sound off" })).toBeVisible();
  await page.evaluate(() => {
    const qaWindow = window as Window & {
      __qaSetAudioHidden?: (hidden: boolean) => void;
    };
    qaWindow.__qaSetAudioHidden?.(true);
    qaWindow.__qaSetAudioHidden?.(false);
    document.querySelector<HTMLButtonElement>(
      '[aria-label="Turn cinematic sound off"]',
    )?.click();
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: {
              status?: string;
              started?: boolean;
              intervalCount?: number;
              ambientSourceCount?: number;
              ambientNodeCount?: number;
              transientSourceCount?: number;
              transientNodeCount?: number;
              contextState?: string;
            };
          }).__coldEmberAudioDebug,
      ),
    )
    .toMatchObject({
      status: "stopped",
      started: false,
      intervalCount: 0,
      ambientSourceCount: 0,
      ambientNodeCount: 0,
      transientSourceCount: 0,
      transientNodeCount: 0,
      contextState: "suspended",
    });
  expect(requestedAudioAssets).toEqual([]);
  await runtime.assertClean(testInfo);
});

test("keeps timed captions available when local speech synthesis is unavailable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "fallback behavior runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { disableSpeech: true });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await page.getByRole("button", { name: /Enter with sound/i }).click();
  await expect(page.getByLabel("Cinematic sound controls")).toBeVisible();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Stop conversation" }).first().click();
  await runtime.assertClean(testInfo);
});

test("completes a four-line conversation and returns every control to its ready state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "full completion path runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { speechDwellMs: 100 });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await page.getByRole("button", { name: /Enter with sound/i }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberDialogueDebug?: {
              lastResult?: string;
              playing?: boolean;
              lineIndex?: number;
              lineCount?: number;
            };
          }).__coldEmberDialogueDebug,
      ),
      { timeout: 10_000 },
    )
    .toMatchObject({
      lastResult: "complete",
      playing: false,
      lineIndex: 3,
      lineCount: 4,
    });
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(4);
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Hear conversation" })).toBeVisible();
  await page.getByRole("button", { name: "Turn cinematic sound off" }).click();
  await runtime.assertClean(testInfo);
});

test("uses live timed captions instead of silent synthesis when persisted voice volume is zero", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "zero-volume accessibility fallback runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page);
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "cold-ember-audio-settings",
      JSON.stringify({ master: 0, ambience: 0.48, dialogue: 0.86 }),
    );
  });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await page.getByRole("button", { name: /Enter with sound/i }).click();
  const caption = page.getByRole("region", { name: "Dialogue caption" });
  await expect(caption).toBeVisible();
  await expect(caption.locator(".caption-transcript")).toHaveAttribute("aria-live", "polite");
  await page.waitForTimeout(900);
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Stop conversation" }).first().click();
  await runtime.assertClean(testInfo);
});

test("ignores a late speech start event after the visitor stops the conversation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "late speech event guard runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { speechStartDelayMs: 650 });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await page.getByRole("button", { name: /Enter with sound/i }).click();
  const caption = page.getByRole("region", { name: "Dialogue caption" });
  await expect(caption).toBeVisible();
  await expect(caption.locator(".caption-transcript")).toHaveAttribute("aria-live", "polite");
  await page.getByRole("button", { name: "Stop conversation" }).first().click();
  await page.waitForTimeout(800);
  await expect(caption).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __coldEmberDialogueDebug?: { speechActive?: boolean } })
            .__coldEmberDialogueDebug?.speechActive,
      ),
    )
    .toBe(false);
  await runtime.assertClean(testInfo);
});

test("continues with captioned dialogue when Web Audio exists but cannot initialize", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "operational audio fallback runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { brokenAudio: true });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await expect(page.getByRole("button", { name: "Turn cinematic sound on" })).toBeEnabled();
  await page.getByRole("button", { name: /Enter with sound/i }).click();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toBeVisible();
  await expect(page.locator("#audio-support-note")).toContainText(/could not start/i);
  await expect(page.getByLabel("Cinematic sound controls")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: { initialized?: boolean; started?: boolean; status?: string };
          }).__coldEmberAudioDebug,
      ),
    )
    .toMatchObject({ initialized: false, started: false, status: "unavailable" });
  await page.getByRole("button", { name: "Stop conversation" }).first().click();
  await runtime.assertClean(testInfo);
});

for (const speechFailure of ["throw", "error"] as const) {
  test(`keeps the current timed caption when speech synthesis reports ${speechFailure}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "speech failure fallback runs once on desktop");
    const runtime = monitorRuntime(page);
    await installAudioHarness(page, { speechFailure });
    await page.goto("/");
    await waitForCasebookHydration(page);

    await page.getByRole("button", { name: /Enter with sound/i }).click();
    const caption = page.getByRole("region", { name: "Dialogue caption" });
    await expect(caption).toBeVisible();
    const firstCaption = await caption.locator(".caption-transcript p").innerText();
    await expect(caption.locator(".caption-transcript")).toHaveAttribute("aria-live", "polite");
    await page.waitForTimeout(900);
    await expect(caption.locator(".caption-transcript p")).toHaveText(firstCaption);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & { __coldEmberDialogueDebug?: { playing?: boolean } })
              .__coldEmberDialogueDebug?.playing,
        ),
      )
      .toBe(true);
    await page.getByRole("button", { name: "Stop conversation" }).first().click();
    await expect(caption).toHaveCount(0);
    await runtime.assertClean(testInfo);
  });
}

test("cancels delayed dialogue when startup becomes hidden or the active scene changes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "delayed lifecycle race runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { delayedAudioStartMs: 2_500 });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await page.getByRole("button", { name: /Enter with sound/i }).click();
  await page.evaluate(() =>
    (window as Window & { __qaSetAudioHidden?: (hidden: boolean) => void })
      .__qaSetAudioHidden?.(true),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: {
              status?: string;
              started?: boolean;
              contextState?: string;
              intervalCount?: number;
              ambientSourceCount?: number;
              ambientNodeCount?: number;
              transientSourceCount?: number;
              transientNodeCount?: number;
            };
          }).__coldEmberAudioDebug,
      ),
    )
    .toMatchObject({
      status: "suspended",
      started: false,
      contextState: "suspended",
      intervalCount: 0,
      ambientSourceCount: 0,
      ambientNodeCount: 0,
      transientSourceCount: 0,
      transientNodeCount: 0,
    });
  await expect(page.getByLabel("Cinematic sound controls")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toHaveCount(0);
  await page.evaluate(() =>
    (window as Window & { __qaSetAudioHidden?: (hidden: boolean) => void })
      .__qaSetAudioHidden?.(false),
  );
  await page.waitForTimeout(450);
  await expect(page.getByLabel("Cinematic sound controls")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Turn cinematic sound on" })).toBeVisible();

  await page.getByRole("button", { name: /Enter with sound/i }).click();
  await page.getByRole("button", { name: "Next scene" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __coldEmberAudioDebug?: { scene?: string } })
            .__coldEmberAudioDebug?.scene,
      ),
    )
    .toBe("passage");
  await expect(page.getByRole("button", { name: "Turn cinematic sound off" })).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toHaveCount(0);
  await page.getByRole("button", { name: "Turn cinematic sound off" }).click();
  await runtime.assertClean(testInfo);
});

test("fails closed without Web Audio and supports the prefixed context fallback", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "capability fallbacks run once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { disableAudio: true });
  await page.goto("/");
  await waitForCasebookHydration(page);
  const dialogueControls = page.getByRole("button", { name: "Open captioned dialogue controls" });
  await expect(dialogueControls).toBeEnabled();
  await expect(dialogueControls).not.toHaveAttribute("aria-pressed");
  await expect(dialogueControls).toHaveAttribute("aria-haspopup", "dialog");
  await dialogueControls.click();
  const fallbackMixer = page.getByRole("dialog", { name: "Cinematic sound mixer" });
  await expect(fallbackMixer.locator(".sound-unavailable")).toContainText(/cannot generate the ambient soundscape/i);
  await expect(fallbackMixer.getByRole("button", { name: "Start soundscape" })).toBeDisabled();
  await expect(fallbackMixer.getByRole("button", { name: "Play scene conversation" })).toBeEnabled();
  await fallbackMixer.getByRole("button", { name: "Close sound mixer" }).click();
  await page.getByRole("button", { name: "Play captioned summons" }).click();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toBeVisible();
  await expect(page.getByLabel("Cinematic sound controls")).toBeVisible();
  const unavailable = await page.evaluate(
    () =>
      (window as Window & {
        __coldEmberAudioDebug?: { supported?: boolean; initialized?: boolean; started?: boolean; status?: string };
      }).__coldEmberAudioDebug,
  );
  expect(unavailable).toMatchObject({
    supported: false,
    initialized: false,
    started: false,
  });
  await page.getByRole("button", { name: "Stop conversation" }).first().click();
  await runtime.assertClean(testInfo);

  const prefixedPage = await context.newPage();
  const prefixedRuntime = monitorRuntime(prefixedPage);
  await installAudioHarness(prefixedPage, { webkitOnly: true });
  await prefixedPage.goto("/");
  await waitForCasebookHydration(prefixedPage);
  await prefixedPage.getByRole("button", { name: "Turn cinematic sound on" }).click();
  await expect(prefixedPage.getByLabel("Cinematic sound controls")).toBeVisible();
  expect(
    await prefixedPage.evaluate(
      () => (window as Window & { __qaAudioContextConstructed?: number }).__qaAudioContextConstructed,
    ),
  ).toBe(1);
  await prefixedPage.getByRole("button", { name: "Turn cinematic sound off" }).click();
  await prefixedRuntime.assertClean(testInfo);
  await prefixedPage.close();
});

test("starts and stops the authored conversation in all five scenes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "full scene dialogue matrix runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page);
  await page.goto("/");
  await waitForCasebookHydration(page);
  await page.getByRole("button", { name: "Turn cinematic sound on" }).click();

  const expected = [
    ["summons", "Mrs. Hudson"],
    ["passage", "Dr. Watson"],
    ["room", "Inspector Lestrade"],
    ["archive", "Dr. Watson"],
    ["conclusion", "Inspector Lestrade"],
  ] as const;

  for (let index = 0; index < expected.length; index += 1) {
    const [scene, firstSpeaker] = expected[index];
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & { __coldEmberAudioDebug?: { scene?: string } })
              .__coldEmberAudioDebug?.scene,
        ),
      )
      .toBe(scene);
    await page.getByRole("button", { name: "Hear conversation" }).click();
    const caption = page.getByRole("region", { name: "Dialogue caption" });
    await expect(caption).toContainText(firstSpeaker);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & {
              __coldEmberDialogueDebug?: { scene?: string; lineCount?: number; playing?: boolean };
            }).__coldEmberDialogueDebug,
        ),
      )
      .toMatchObject({ scene, lineCount: 4, playing: true });
    await page.getByRole("button", { name: "Stop conversation" }).first().click();
    await expect(caption).toHaveCount(0);
    if (index < expected.length - 1) {
      await page.getByRole("button", { name: "Next scene" }).click();
    }
  }

  await page.locator(".commission-section").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Hear conversation" })).toBeVisible();
  await page.getByRole("button", { name: "Hear conversation" }).click();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toContainText("Inspector Lestrade");
  await page.getByRole("button", { name: "Stop conversation" }).first().click();
  await page.getByRole("button", { name: "Turn cinematic sound off" }).click();
  await runtime.assertClean(testInfo);
});

test("keeps the sound console, captions, and mixer safe in short landscape and enlarged portrait layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "responsive stress pass runs once on desktop");
  const runtime = monitorRuntime(page);
  await page.setViewportSize({ width: 667, height: 375 });
  await installAudioHarness(page);
  await page.goto("/");
  await waitForCasebookHydration(page);
  await page.getByRole("button", { name: /Enter with sound/i }).click();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toBeVisible();

  const landscapeBoxes = await page.evaluate(() => {
    const read = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      if (!rect) throw new Error(`Missing ${selector}`);
      return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
    };
    return {
      caption: read(".cinematic-caption"),
      console: read(".sound-console"),
      rail: read(".scene-rail"),
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  });
  expect(landscapeBoxes.caption.top).toBeGreaterThanOrEqual(0);
  expect(landscapeBoxes.caption.bottom).toBeLessThanOrEqual(landscapeBoxes.console.top + 1);
  expect(landscapeBoxes.console.bottom).toBeLessThanOrEqual(landscapeBoxes.rail.top + 1);
  expect(landscapeBoxes.rail.bottom).toBeLessThanOrEqual(landscapeBoxes.viewport.height);
  expect(landscapeBoxes.caption.right).toBeLessThanOrEqual(landscapeBoxes.viewport.width);

  await page.getByRole("button", { name: "Stop conversation" }).first().click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addStyleTag({ content: "html { font-size: 125% !important; }" });
  await page.getByRole("button", { name: "Mixer", exact: true }).click();
  const mixer = page.getByRole("dialog", { name: "Cinematic sound mixer" });
  await expect(mixer).toBeVisible();
  const mixerBox = await mixer.boundingBox();
  expect(mixerBox).not.toBeNull();
  expect(mixerBox!.y).toBeGreaterThanOrEqual(0);
  expect(mixerBox!.y + mixerBox!.height).toBeLessThanOrEqual(844);
  await expectPrimaryTouchTargets(page);
  await mixer.getByRole("button", { name: "Close sound mixer" }).click();
  await expectNoHorizontalOverflow(page);
  await expectPrimaryTouchTargets(page);
  await page.getByRole("button", { name: "Turn cinematic sound off" }).click();
  await runtime.assertClean(testInfo);
});

test("keeps scene dialogue, captions, and mixer controls usable at every release viewport", async ({ page }, testInfo) => {
  const runtime = monitorRuntime(page);
  await installAudioHarness(page);
  await page.goto("/");
  await waitForCasebookHydration(page);

  await page.getByRole("button", { name: /Enter with sound/i }).click();
  await expect(page.getByLabel("Cinematic sound controls")).toBeVisible();
  const caption = page.getByRole("region", { name: "Dialogue caption" });
  await expect(caption).toBeVisible();
  await expect(caption).toContainText(/Mrs\. Hudson|Dr\. Watson|Sherlock Holmes/i);

  await page.getByRole("button", { name: "Mixer", exact: true }).click();
  const mixer = page.getByRole("dialog", { name: "Cinematic sound mixer" });
  await expect(mixer).toBeVisible();
  await expect(caption).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __coldEmberDialogueDebug?: { playing?: boolean } })
            .__coldEmberDialogueDebug?.playing,
      ),
    )
    .toBe(false);
  await mixer.getByRole("button", { name: /Play scene conversation/i }).click();
  await expect(mixer).not.toBeVisible();
  await expect(caption).toBeVisible();
  await page.getByRole("button", { name: "Stop conversation" }).first().click();
  await page.getByRole("button", { name: "Mixer", exact: true }).click();
  await expect(mixer).toBeVisible();
  await mixer.getByRole("button", { name: "Close sound mixer" }).click();

  await page.getByRole("button", { name: /^Index$/i }).click();
  await page.getByRole("dialog", { name: /Chapter index/i }).getByRole("button", { name: /The room/i }).click();
  await expect(page.getByRole("heading", { name: /Nothing here is silent/i })).toBeInViewport();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __coldEmberAudioDebug?: { scene?: string } })
            .__coldEmberAudioDebug?.scene,
      ),
    )
    .toBe("room");

  await page.getByRole("button", { name: "Hear conversation" }).click();
  await expect(caption).toContainText(/Lestrade|Watson|Holmes/i);
  const finalStop = page.getByRole("button", { name: "Stop conversation" }).first();
  if (await finalStop.isVisible().catch(() => false)) await finalStop.click();
  else await expect(page.getByRole("button", { name: "Hear conversation" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectPrimaryTouchTargets(page);
  await runtime.assertClean(testInfo);
});
