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
  disableProducedAudio?: boolean;
};

async function installAudioHarness(page: Page, options: AudioHarnessOptions = {}) {
  await page.addInitScript((settings) => {
    const qaWindow = window as Window & {
      __qaAudioContextConstructed?: number;
      __qaSpeechRequests?: string[];
      __qaSpeechCancels?: number;
      __qaSetAudioHidden?: (hidden: boolean) => void;
      __qaDisableProducedAudio?: boolean;
      webkitAudioContext?: typeof AudioContext;
    };
    qaWindow.__qaAudioContextConstructed = 0;
    qaWindow.__qaSpeechRequests = [];
    qaWindow.__qaSpeechCancels = 0;
    qaWindow.__qaDisableProducedAudio = settings.disableProducedAudio ?? true;

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

async function unlockDefaultConversation(page: Page) {
  await page.locator("#summons-title").click({ position: { x: 4, y: 4 } });
}

function conversationConsole(page: Page) {
  return page.getByLabel("Cinematic sound controls");
}

function headerConversationToggle(page: Page) {
  return page.locator(".case-header").getByRole("button", {
    name: /Turn conversation (?:off|on)/,
  });
}

test("arms by default and unlocks from an ordinary keyboard interaction", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "keyboard activation runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page);
  await page.goto("/");
  await waitForCasebookHydration(page);

  await expect(conversationConsole(page)).toContainText(
    /conversation on · starts with your first interaction/i,
  );
  expect(
    await page.evaluate(
      () => (window as Window & { __qaAudioContextConstructed?: number }).__qaAudioContextConstructed,
    ),
  ).toBe(0);
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);

  await page.locator("#summons-title").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __qaAudioContextConstructed?: number }).__qaAudioContextConstructed,
      ),
    )
    .toBe(1);
  await expect(conversationConsole(page)).toContainText(/conversation playing/i);
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await runtime.assertClean(testInfo);
});

test("plays self-hosted dialogue and ambience stems through one unlocked audio graph", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "produced asset transport runs once on desktop");
  const runtime = monitorRuntime(page);
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/audio\/cinematic\/.*\.mp3(?:$|\?)/i.test(request.url())) {
      audioRequests.push(request.url());
    }
  });
  await installAudioHarness(page, { disableProducedAudio: false });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await unlockDefaultConversation(page);
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (window as Window & {
              __coldEmberAudioDebug?: {
                assetPlaybackCount?: number;
                activeAssetSourceCount?: number;
              };
            }).__coldEmberAudioDebug,
        ),
      { timeout: 20_000 },
    )
    .toMatchObject({ assetPlaybackCount: 2, activeAssetSourceCount: 2 });

  const caption = page.getByRole("region", { name: "Dialogue caption" });
  await expect(caption).toContainText("Mrs. Hudson", { timeout: 8_000 });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: { dialogueDucking?: boolean };
          }).__coldEmberAudioDebug?.dialogueDucking,
      ),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);
  expect(audioRequests.some((url) => /\/ambience\/summons\./.test(url))).toBe(true);
  expect(audioRequests.some((url) => /\/scenes\/summons-dialogue\./.test(url))).toBe(true);
  const origin = new URL(page.url()).origin;
  expect(new Set(audioRequests.map((url) => new URL(url).origin))).toEqual(new Set([origin]));
  expect(audioRequests.some((url) => /elevenlabs/i.test(url))).toBe(false);

  await page.getByRole("button", { name: "Next scene" }).click();
  await expect(caption).toContainText(/Dr\. Watson|Hansom driver/, { timeout: 20_000 });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: { assetPlaybackCount?: number; scene?: string };
          }).__coldEmberAudioDebug,
      ),
    )
    .toMatchObject({ assetPlaybackCount: 4, scene: "passage" });
  expect(audioRequests.some((url) => /\/ambience\/passage\./.test(url))).toBe(true);
  expect(audioRequests.some((url) => /\/scenes\/passage-dialogue\./.test(url))).toBe(true);

  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & {
            __coldEmberAudioDebug?: {
              activeAssetSourceCount?: number;
              activeAssetNodeCount?: number;
              dialogueDucking?: boolean;
              status?: string;
            };
          }).__coldEmberAudioDebug,
      ),
    )
    .toMatchObject({
      activeAssetSourceCount: 0,
      activeAssetNodeCount: 0,
      dialogueDucking: false,
      status: "stopped",
    });
  await runtime.assertClean(testInfo);
});

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
  await expect(conversationConsole(page)).toBeVisible();
  await expect(conversationConsole(page)).toContainText(
    /conversation on · starts with your first interaction/i,
  );
  await expect(
    conversationConsole(page).getByRole("button", { name: "Turn conversation off" }),
  ).toHaveAttribute("aria-pressed", "true");

  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation off");
  await unlockDefaultConversation(page);
  await expect(headerConversationToggle(page)).toHaveAttribute("aria-pressed", "true");
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
  await mixer.getByRole("button", { name: "Turn conversation off" }).click();
  await expect(mixer.getByRole("button", { name: "Turn conversation on" })).toBeVisible();
  await mixer.getByRole("button", { name: "Turn conversation on" }).click();
  await expect(mixer.getByRole("button", { name: "Turn conversation off" })).toBeVisible();
  await mixer.getByLabel("Master").fill("64");
  await mixer.getByLabel("Atmosphere").fill("37");
  await mixer.getByLabel("Dialogue").fill("81");
  await mixer.getByRole("button", { name: "Close sound mixer" }).click();

  await expect(caption).toBeVisible();
  await expect(
    conversationConsole(page).getByRole("button", { name: "Turn conversation off" }),
  ).toBeVisible();
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
  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation off");
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
  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation off");

  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await expect(conversationConsole(page)).toBeVisible();
  await expect(
    conversationConsole(page).getByRole("button", { name: "Turn conversation on" }),
  ).toHaveAttribute("aria-pressed", "false");
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
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("cold-ember-conversation")))
    .toBe("off");

  await page.reload();
  await waitForCasebookHydration(page);
  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation on");
  await expect(headerConversationToggle(page)).toHaveAttribute("aria-pressed", "false");
  expect(
    await page.evaluate(
      () => (window as Window & { __qaAudioContextConstructed?: number }).__qaAudioContextConstructed,
    ),
  ).toBe(0);

  await expect(
    conversationConsole(page).getByRole("button", { name: "Turn conversation on" }),
  ).toBeVisible();
  await unlockDefaultConversation(page);
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);
  await conversationConsole(page).getByRole("button", { name: "Turn conversation on" }).click();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toBeVisible();

  await headerConversationToggle(page).click();
  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation on");
  await headerConversationToggle(page).click();
  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation off");
  await page.evaluate(() => {
    const qaWindow = window as Window & {
      __qaSetAudioHidden?: (hidden: boolean) => void;
    };
    qaWindow.__qaSetAudioHidden?.(true);
    qaWindow.__qaSetAudioHidden?.(false);
    document.querySelector<HTMLButtonElement>(
      '.case-header [aria-label="Turn conversation off"]',
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

  await unlockDefaultConversation(page);
  await expect(conversationConsole(page)).toBeVisible();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await runtime.assertClean(testInfo);
});

test("completes a four-line conversation and returns every control to its ready state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "full completion path runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { speechDwellMs: 100 });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await unlockDefaultConversation(page);
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
  await expect(
    conversationConsole(page).getByRole("button", { name: "Turn conversation off" }),
  ).toBeVisible();
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
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

  await unlockDefaultConversation(page);
  const caption = page.getByRole("region", { name: "Dialogue caption" });
  await expect(caption).toBeVisible();
  await expect(caption.locator(".caption-transcript")).toHaveAttribute("aria-live", "polite");
  await page.waitForTimeout(900);
  expect(
    await page.evaluate(
      () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
    ),
  ).toBe(0);
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await runtime.assertClean(testInfo);
});

test("ignores a late speech start event after the visitor stops the conversation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "late speech event guard runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { speechStartDelayMs: 650 });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await unlockDefaultConversation(page);
  const caption = page.getByRole("region", { name: "Dialogue caption" });
  await expect(caption).toBeVisible();
  await expect(caption.locator(".caption-transcript")).toHaveAttribute("aria-live", "polite");
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
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

  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation off");
  await unlockDefaultConversation(page);
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
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await runtime.assertClean(testInfo);
});

for (const speechFailure of ["throw", "error"] as const) {
  test(`keeps the current timed caption when speech synthesis reports ${speechFailure}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "speech failure fallback runs once on desktop");
    const runtime = monitorRuntime(page);
    await installAudioHarness(page, { speechFailure });
    await page.goto("/");
    await waitForCasebookHydration(page);

    await unlockDefaultConversation(page);
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
    await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
    await expect(caption).toHaveCount(0);
    await runtime.assertClean(testInfo);
  });
}

test("cancels delayed dialogue when hidden and follows the latest scene after navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "delayed lifecycle race runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { delayedAudioStartMs: 2_500 });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await unlockDefaultConversation(page);
  await page.waitForTimeout(400);
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
  await expect(conversationConsole(page)).toBeVisible();
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
  await expect(conversationConsole(page)).toBeVisible();
  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation off");

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
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests?.length ?? 0,
      ),
    )
    .toBe(1);
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toContainText("Dr. Watson");
  const requests = await page.evaluate(
    () => (window as Window & { __qaSpeechRequests?: string[] }).__qaSpeechRequests ?? [],
  );
  expect(requests[0]).toMatch(/would not miss it/i);
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await runtime.assertClean(testInfo);
});

test("fails closed without Web Audio and supports the prefixed context fallback", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "capability fallbacks run once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page, { disableAudio: true });
  await page.goto("/");
  await waitForCasebookHydration(page);
  await expect(headerConversationToggle(page)).toHaveAccessibleName("Turn conversation off");
  await unlockDefaultConversation(page);
  await page.getByRole("button", { name: "Mixer", exact: true }).click();
  const fallbackMixer = page.getByRole("dialog", { name: "Cinematic sound mixer" });
  await expect(fallbackMixer.locator(".sound-unavailable")).toContainText(/cannot play the produced soundscape/i);
  await expect(fallbackMixer.getByRole("button", { name: "Turn conversation off" })).toBeEnabled();
  await expect(fallbackMixer.getByRole("button", { name: "Replay active scene" })).toBeEnabled();
  await fallbackMixer.getByRole("button", { name: "Close sound mixer" }).click();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toBeVisible();
  await expect(conversationConsole(page)).toBeVisible();
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
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await runtime.assertClean(testInfo);

  const prefixedPage = await context.newPage();
  const prefixedRuntime = monitorRuntime(prefixedPage);
  await installAudioHarness(prefixedPage, { webkitOnly: true });
  await prefixedPage.goto("/");
  await waitForCasebookHydration(prefixedPage);
  await expect(headerConversationToggle(prefixedPage)).toHaveAccessibleName("Turn conversation on");
  await headerConversationToggle(prefixedPage).click();
  await expect(prefixedPage.getByLabel("Cinematic sound controls")).toBeVisible();
  expect(
    await prefixedPage.evaluate(
      () => (window as Window & { __qaAudioContextConstructed?: number }).__qaAudioContextConstructed,
    ),
  ).toBe(1);
  await headerConversationToggle(prefixedPage).click();
  await prefixedRuntime.assertClean(testInfo);
  await prefixedPage.close();
});

test("starts the authored conversation automatically once in all five scene entries", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "full scene dialogue matrix runs once on desktop");
  const runtime = monitorRuntime(page);
  await installAudioHarness(page);
  await page.goto("/");
  await waitForCasebookHydration(page);
  await unlockDefaultConversation(page);

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
    if (index < expected.length - 1) {
      await page.getByRole("button", { name: "Next scene" }).click();
    }
  }

  await page.locator(".commission-section").scrollIntoViewIfNeeded();
  await expect(page.getByRole("region", { name: "Dialogue caption" })).toContainText("Inspector Lestrade");
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await runtime.assertClean(testInfo);
});

test("keeps the sound console, captions, and mixer safe in short landscape and enlarged portrait layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "responsive stress pass runs once on desktop");
  const runtime = monitorRuntime(page);
  await page.setViewportSize({ width: 667, height: 375 });
  await installAudioHarness(page);
  await page.goto("/");
  await waitForCasebookHydration(page);
  await unlockDefaultConversation(page);
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

  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
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
  await runtime.assertClean(testInfo);
});

test("keeps scene dialogue, captions, and mixer controls usable at every release viewport", async ({ page }, testInfo) => {
  const runtime = monitorRuntime(page);
  await installAudioHarness(page);
  await page.goto("/");
  await waitForCasebookHydration(page);

  await unlockDefaultConversation(page);
  await expect(conversationConsole(page)).toBeVisible();
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
  await mixer.getByRole("button", { name: "Close sound mixer" }).click();
  await expect(mixer).not.toBeVisible();
  await expect(caption).toBeVisible();
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await conversationConsole(page).getByRole("button", { name: "Turn conversation on" }).click();
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

  await expect(caption).toContainText(/Lestrade|Watson|Holmes/i);
  await conversationConsole(page).getByRole("button", { name: "Turn conversation off" }).click();
  await expectNoHorizontalOverflow(page);
  await expectPrimaryTouchTargets(page);
  await runtime.assertClean(testInfo);
});
