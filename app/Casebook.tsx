"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Scene = {
  id: string;
  label: string;
  title: string;
  time: string;
  image: string;
  alt: string;
};

type Evidence = {
  id: string;
  label: string;
  title: string;
  observation: string;
};

const SCENES: Scene[] = [
  {
    id: "summons",
    label: "Observation I",
    title: "The summons",
    time: "10:17 PM",
    image: "telegram",
    alt: "Sherlock Holmes studies a telegram beside a low fire in his Baker Street rooms.",
  },
  {
    id: "passage",
    label: "Observation II",
    title: "The passage",
    time: "11:47 PM",
    image: "hansom",
    alt: "Sherlock Holmes rides through rain-dark London in a period hansom cab.",
  },
  {
    id: "room",
    label: "Observation III",
    title: "The room",
    time: "12:08 AM",
    image: "crime-room",
    alt: "Holmes kneels to inspect a non-graphic crime scene in a Victorian bindery.",
  },
  {
    id: "archive",
    label: "Observation IV",
    title: "The archive",
    time: "2:32 AM",
    image: "reference-room",
    alt: "Holmes compares several reference books under a green-shaded lamp.",
  },
  {
    id: "conclusion",
    label: "Observation V",
    title: "The deduction",
    time: "5:41 AM",
    image: "deduction",
    alt: "Holmes arranges the evidence as cold dawn reaches Baker Street.",
  },
];

const EVIDENCE: Record<string, Evidence> = {
  telegram: {
    id: "telegram",
    label: "Wire / 10:17",
    title: "The urgent telegram",
    observation:
      "A bookbinder lies unconscious beside a locked cabinet. A rare folio is missing, yet the wet floor records no departing thief.",
  },
  route: {
    id: "route",
    label: "Route / South",
    title: "The driver’s route",
    observation:
      "The cab crossed fresh roadworks at Kennington. Pale clay gathered on the near wheel—and on Holmes’s boot when he stepped down.",
  },
  footprint: {
    id: "footprint",
    label: "Floor / A",
    title: "The pale-clay footprint",
    observation:
      "Its outward edge is deeper than its inward edge. Whoever made it was leaving under a heavy load, not arriving in pursuit.",
  },
  ash: {
    id: "ash",
    label: "Hearth / B",
    title: "The tobacco ash",
    observation:
      "Fine black flakes and a single grey curl match the victim’s own clay pipe. The visitor smoked nothing here.",
  },
  glass: {
    id: "glass",
    label: "Desk / C",
    title: "The blue glass",
    observation:
      "Not a lamp fragment. The bevel and cobalt tint belong to a binder’s inspection lens, broken before the supposed attack.",
  },
  latch: {
    id: "latch",
    label: "Cabinet / D",
    title: "The warm brass latch",
    observation:
      "The stove is cold, yet the inner latch holds warmth. The cabinet was opened moments before the police crossed the threshold.",
  },
  archive: {
    id: "archive",
    label: "Index / 62",
    title: "The reference chain",
    observation:
      "Ash, clay, trade marks, and the night route agree: the room was arranged to describe an intruder who never existed.",
  },
  conclusion: {
    id: "conclusion",
    label: "Case / Closed",
    title: "The manufactured alibi",
    observation:
      "The bookbinder staged the theft, carried the folio to a waiting buyer, and returned by cab—bringing the roadwork clay back with him.",
  },
};

const CRIME_CLUES = [
  { id: "footprint", number: "01", name: "Pale-clay footprint" },
  { id: "ash", number: "02", name: "Tobacco ash" },
  { id: "glass", number: "03", name: "Blue glass fragment" },
  { id: "latch", number: "04", name: "Warm brass latch" },
];

const BOOKS = [
  {
    id: "residues",
    number: "LXII",
    title: "Residues of the Pipe",
    text: "Grey curl, fine black flake, and no coarse fibre: the ash belongs to the victim’s familiar clay pipe, not a stranger’s cigar.",
  },
  {
    id: "impressions",
    number: "XVIII",
    title: "Impressions in London Clay",
    text: "Weight deepens the departing edge. Pale Kennington clay travelled into the room after the rain had already begun.",
  },
  {
    id: "trades",
    number: "XXXI",
    title: "Trades Written Upon the Hand",
    text: "A binder’s crescent scar and varnish-dark thumbnail identify the only hand that could release the hidden cabinet catch.",
  },
  {
    id: "routes",
    number: "VII",
    title: "South London Routes",
    text: "The second fare crossed the roadworks after midnight. The cab’s roof trapdoor gave the driver a clear view of his passenger’s parcel.",
  },
];

function ScenePicture({ scene, mobile = false }: { scene: Scene; mobile?: boolean }) {
  return (
    <picture className={mobile ? "mobile-picture" : "stage-picture"}>
      <source srcSet={`/scenes/${scene.image}.avif`} type="image/avif" />
      <img
        src={`/scenes/${scene.image}.jpg`}
        alt={mobile ? scene.alt : ""}
        width="1536"
        height="1024"
        loading={scene.id === "summons" ? "eager" : "lazy"}
        fetchPriority={scene.id === "summons" ? "high" : "auto"}
      />
    </picture>
  );
}

function AmbienceCanvas({ scene, paused }: { scene: number; paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Array<{
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      drift: number;
    }> = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: 64 }, (_, index) => ({
        x: (index * 137.5) % width,
        y: (index * 89.3) % height,
        speed: 0.55 + (index % 8) * 0.14,
        length: 7 + (index % 7) * 2.5,
        opacity: 0.08 + (index % 6) * 0.025,
        drift: ((index % 5) - 2) * 0.12,
      }));
    };

    const draw = (time: number) => {
      frame = 0;
      context.clearRect(0, 0, width, height);

      if (scene <= 2) {
        context.lineWidth = 0.8;
        particles.forEach((particle) => {
          particle.y += particle.speed;
          particle.x += particle.drift;
          if (particle.y > height + 20) {
            particle.y = -20;
            particle.x = (particle.x + width * 0.43) % width;
          }
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(
            particle.x - particle.length * 0.34,
            particle.y + particle.length,
          );
          context.strokeStyle = `rgba(194, 232, 236, ${particle.opacity})`;
          context.stroke();
        });
      } else if (scene === 3) {
        particles.slice(0, 38).forEach((particle, index) => {
          const x = (particle.x + Math.sin(time / 2600 + index) * 18) % width;
          const y = (particle.y + time * particle.speed * 0.006) % height;
          context.beginPath();
          context.arc(x, y, 0.65 + (index % 3) * 0.35, 0, Math.PI * 2);
          context.fillStyle = `rgba(233, 226, 213, ${particle.opacity * 0.65})`;
          context.fill();
        });
      } else {
        const points = [
          [width * 0.13, height * 0.78],
          [width * 0.32, height * 0.37],
          [width * 0.58, height * 0.68],
          [width * 0.78, height * 0.28],
          [width * 0.9, height * 0.56],
        ];
        context.lineWidth = 1;
        context.strokeStyle = "rgba(194, 232, 236, 0.2)";
        context.beginPath();
        points.forEach(([x, y], index) => {
          const offset = Math.sin(time / 1800 + index) * 3;
          if (index === 0) context.moveTo(x, y + offset);
          else context.lineTo(x, y + offset);
        });
        context.stroke();
        points.forEach(([x, y], index) => {
          const pulse = 2.2 + Math.sin(time / 700 + index) * 0.6;
          context.beginPath();
          context.arc(x, y, pulse, 0, Math.PI * 2);
          context.fillStyle = index === 4 ? "rgba(240, 68, 34, .7)" : "rgba(194, 232, 236, .55)";
          context.fill();
        });
      }

      if (!paused && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!paused && frame === 0) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw(0);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [paused, scene]);

  return <canvas ref={canvasRef} className="ambience" aria-hidden="true" />;
}

export function Casebook() {
  const [activeScene, setActiveScene] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [activeEvidence, setActiveEvidence] = useState("telegram");
  const [activeBook, setActiveBook] = useState(BOOKS[0].id);
  const [inspectionLight, setInspectionLight] = useState(false);
  const [conclusionChoice, setConclusionChoice] = useState("");
  const [conclusionRevealed, setConclusionRevealed] = useState(false);
  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const indexDialog = useRef<HTMLDialogElement>(null);
  const notesDialog = useRef<HTMLDialogElement>(null);
  const inquiryDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedMotion = window.localStorage.getItem("cold-ember-motion");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setMotionPaused(storedMotion ? storedMotion === "paused" : reduce);

      try {
        const storedNotes = JSON.parse(
          window.localStorage.getItem("cold-ember-notes") ?? "[]",
        ) as string[];
        setNotes(storedNotes.filter((id) => id in EVIDENCE));
      } catch {
        window.localStorage.removeItem("cold-ember-notes");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scene-index]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveScene(Number((visible.target as HTMLElement).dataset.sceneIndex));
        }
      },
      { rootMargin: "-28% 0px -45%", threshold: [0.1, 0.35, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const recordEvidence = useCallback((id: string) => {
    setActiveEvidence(id);
    setNotes((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      window.localStorage.setItem("cold-ember-notes", JSON.stringify(next));
      return next;
    });
  }, []);

  const scrollToScene = useCallback((index: number) => {
    const safeIndex = Math.max(0, Math.min(SCENES.length - 1, index));
    const scene = SCENES[safeIndex];
    const target = document.getElementById(scene.id);
    if (!target) return;
    const reduceMotion =
      motionPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => {
      document.getElementById(`${scene.id}-title`)?.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 650);
  }, [motionPaused]);

  const openDialog = (ref: { current: HTMLDialogElement | null }) => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  };

  const closeDialog = (ref: { current: HTMLDialogElement | null }) => {
    ref.current?.close();
  };

  const toggleMotion = () => {
    setMotionPaused((current) => {
      const next = !current;
      window.localStorage.setItem(
        "cold-ember-motion",
        next ? "paused" : "playing",
      );
      return next;
    });
  };

  const selectBook = (id: string) => {
    setActiveBook(id);
    recordEvidence("archive");
  };

  const handleBookKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % BOOKS.length;
    if (event.key === "ArrowLeft") next = (index - 1 + BOOKS.length) % BOOKS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = BOOKS.length - 1;
    selectBook(BOOKS[next].id);
    document.getElementById(`book-tab-${BOOKS[next].id}`)?.focus();
  };

  const revealConclusion = () => {
    if (!conclusionChoice) return;
    setConclusionRevealed(true);
    recordEvidence("conclusion");
  };

  const replayCase = () => {
    setTelegramOpen(false);
    setNotes([]);
    setActiveEvidence("telegram");
    setActiveBook(BOOKS[0].id);
    setInspectionLight(false);
    setConclusionChoice("");
    setConclusionRevealed(false);
    window.localStorage.removeItem("cold-ember-notes");
    scrollToScene(0);
  };

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("sending");
    const form = event.currentTarget;
    const data = new FormData(form);
    const encoded = new URLSearchParams();
    data.forEach((value, key) => {
      if (typeof value === "string") encoded.append(key, value);
    });

    try {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      } else {
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encoded.toString(),
        });
        if (!response.ok) throw new Error("The form service did not accept the inquiry.");
      }
      form.reset();
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  };

  const currentEvidence = EVIDENCE[activeEvidence];
  const selectedBook = BOOKS.find((book) => book.id === activeBook) ?? BOOKS[0];

  return (
    <div
      className={`${motionPaused ? "casebook motion-paused" : "casebook"}${inspectionLight ? " inspection-light-on" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to the case
      </a>

      <div className="read-progress" aria-hidden="true">
        <span style={{ width: `${((activeScene + 1) / SCENES.length) * 100}%` }} />
      </div>

      <header className="case-header">
        <button
          className="wordmark"
          type="button"
          onClick={() => scrollToScene(0)}
          aria-label="The Cold Ember, return to the beginning"
        >
          <span className="wordmark-mark" aria-hidden="true">CE</span>
          <span>
            The Cold Ember
            <small>Moving casebook · 1895</small>
          </span>
        </button>
        <div className="header-controls" aria-label="Casebook controls">
          <button
            className="quiet-control"
            type="button"
            aria-label="Index"
            onClick={() => openDialog(indexDialog)}
          >
            <span aria-hidden="true">☷</span> Index
          </button>
          <button
            className="quiet-control motion-control"
            type="button"
            aria-pressed={motionPaused}
            onClick={toggleMotion}
          >
            <span className="motion-signal" aria-hidden="true" />
            {motionPaused ? "Resume motion" : "Pause motion"}
          </button>
          <button className="quiet-control notes-control" type="button" onClick={() => openDialog(notesDialog)}>
            Case notes <span className="count">{notes.length}</span>
          </button>
        </div>
      </header>

      <div className="cinematic-stage" aria-hidden="true">
        {SCENES.map((scene, index) => (
          <div
            className={`stage-frame stage-${scene.image}${activeScene === index ? " is-active" : ""}`}
            key={scene.id}
          >
            <ScenePicture scene={scene} />
          </div>
        ))}
        <div className="stage-frost" />
        <div className="stage-vignette" />
        <div className="stage-grain" />
        <div className="smoke-trace smoke-one" />
        <div className="smoke-trace smoke-two" />
      </div>
      <AmbienceCanvas scene={activeScene} paused={motionPaused} />

      <main id="main-content">
        <section id="summons" className="story-scene hero-scene" data-scene-index="0" aria-labelledby="summons-title">
          <div className="mobile-scene-media">
            <ScenePicture scene={SCENES[0]} mobile />
            <span className="mobile-time">London · Winter 1895</span>
          </div>
          <div className="scene-copy hero-copy">
            <p className="eyebrow">Case file 03 · London · Winter 1895</p>
            <h1 id="summons-title" tabIndex={-1}>
              <span>The cold</span>
              <em>ember</em>
            </h1>
            <p className="hero-deck">
              A dead lamp. A warm carriage. A clue that survived the rain.
            </p>
            <p className="intro-line">
              An original Sherlock Holmes moving casebook in five observations.
              Arrive as Watson. Leave seeing differently.
            </p>
            <div className="hero-actions">
              <button className="primary-action" type="button" onClick={() => scrollToScene(1)}>
                Begin the inquiry <span aria-hidden="true">↘</span>
              </button>
              <button className="text-action" type="button" onClick={() => scrollToScene(2)}>
                Inspect the evidence
              </button>
            </div>
            <p className="motion-hint"><span aria-hidden="true">◇</span> Move slowly. London notices haste.</p>
          </div>
          <div className="telegram-panel">
            <div className="panel-rule"><span>Received by wire</span><span>10:17 PM</span></div>
            <p className="telegram-lead">At Baker Street, the night arrives by wire.</p>
            <button
              className="evidence-reveal"
              type="button"
              aria-expanded={telegramOpen}
              aria-controls="telegram-message"
              onClick={() => {
                setTelegramOpen((value) => !value);
                recordEvidence("telegram");
              }}
            >
              {telegramOpen ? "Fold the telegram" : "Read the telegram"}
              <span aria-hidden="true">{telegramOpen ? "−" : "+"}</span>
            </button>
            <div id="telegram-message" className="telegram-message" hidden={!telegramOpen}>
              <p>MR. HOLMES—</p>
              <p>
                A locked cabinet. One missing folio. No print departing the room.
                Dorset Street, immediately.
              </p>
              <p className="telegram-signature">LESTRADE</p>
            </div>
          </div>
        </section>

        <section id="passage" className="story-scene passage-scene" data-scene-index="1" aria-labelledby="passage-title">
          <div className="mobile-scene-media">
            <ScenePicture scene={SCENES[1]} mobile />
            <span className="mobile-time">South through the rain · 11:47 PM</span>
          </div>
          <div className="scene-copy scene-copy-left">
            <p className="eyebrow">Observation II · The passage</p>
            <h2 id="passage-title" tabIndex={-1}>One wheel<br />keeps time.</h2>
            <p className="scene-statement">One passenger measures it.</p>
            <p>
              Inside the two-wheeled hansom, the city becomes a sequence of lamps.
              Holmes watches the road, not the destination. Smoke leaves the pipe in
              thin questions; rain answers every one.
            </p>
            <button
              className={`evidence-action${notes.includes("route") ? " is-observed" : ""}`}
              type="button"
              aria-pressed={notes.includes("route")}
              onClick={() => recordEvidence("route")}
            >
              <span className="evidence-index">Route clue</span>
              Open the driver’s roof trapdoor
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          <aside className="scene-marginalia" aria-label="Hansom cab observation">
            <span>Vehicle study</span>
            <strong>2 wheels</strong>
            <strong>1 horse</strong>
            <strong>Rear driver</strong>
            <span>Directions passed through the roof</span>
          </aside>
        </section>

        <section id="room" className="story-scene room-scene" data-scene-index="2" aria-labelledby="room-title">
          <div className="mobile-scene-media">
            <ScenePicture scene={SCENES[2]} mobile />
            <span className="mobile-time">Dorset Street bindery · 12:08 AM</span>
          </div>
          <div className="scene-copy scene-copy-right room-heading">
            <p className="eyebrow">Observation III · Four things out of place</p>
            <h2 id="room-title" tabIndex={-1}>Nothing here<br />is silent.</h2>
            <p className="scene-statement">The clay remembers weight. The ash remembers fire.</p>
            <button
              className="inspection-control"
              type="button"
              aria-pressed={inspectionLight}
              onClick={() => setInspectionLight((current) => !current)}
            >
              <span className="inspection-lens" aria-hidden="true" />
              Inspection light
              <small>{inspectionLight ? "On" : "Off"}</small>
            </button>
          </div>
          <div className="evidence-console" aria-label="Crime scene evidence">
            <div className="clue-grid">
              {CRIME_CLUES.map((clue) => (
                <button
                  key={clue.id}
                  type="button"
                  className={notes.includes(clue.id) ? "clue-button is-observed" : "clue-button"}
                  aria-pressed={notes.includes(clue.id)}
                  aria-label={`Inspect ${clue.name}`}
                  onClick={() => recordEvidence(clue.id)}
                >
                  <span>{clue.number}</span>
                  <strong>{clue.name}</strong>
                  <i aria-hidden="true">{notes.includes(clue.id) ? "Observed" : "Inspect"}</i>
                </button>
              ))}
            </div>
            <div className="observation-readout" aria-live="polite">
              <span>{currentEvidence.label}</span>
              <h3>{currentEvidence.title}</h3>
              <p>{currentEvidence.observation}</p>
              <small>Observed. Not yet understood.</small>
            </div>
          </div>
        </section>

        <section id="archive" className="story-scene archive-scene" data-scene-index="3" aria-labelledby="archive-title">
          <div className="mobile-scene-media">
            <ScenePicture scene={SCENES[3]} mobile />
            <span className="mobile-time">Baker Street reference room · 2:32 AM</span>
          </div>
          <div className="scene-copy scene-copy-left archive-heading">
            <p className="eyebrow">Observation IV · The archive</p>
            <h2 id="archive-title" tabIndex={-1}>Five books.<br />Four facts.</h2>
            <p className="scene-statement">One manufactured alibi.</p>
          </div>
          <div className="book-index">
            <div className="book-tabs" role="tablist" aria-label="Holmes’s reference books">
              {BOOKS.map((book, index) => (
                <button
                  key={book.id}
                  id={`book-tab-${book.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeBook === book.id}
                  aria-controls={`book-panel-${book.id}`}
                  tabIndex={activeBook === book.id ? 0 : -1}
                  onClick={() => selectBook(book.id)}
                  onKeyDown={(event) => handleBookKeys(event, index)}
                >
                  <span>{book.number}</span>
                  {book.title}
                </button>
              ))}
            </div>
            <div
              id={`book-panel-${selectedBook.id}`}
              className="book-panel"
              role="tabpanel"
              aria-labelledby={`book-tab-${selectedBook.id}`}
              tabIndex={0}
            >
              <span className="folio-mark">Plate {selectedBook.number}</span>
              <h3>{selectedBook.title}</h3>
              <p>{selectedBook.text}</p>
              <div className="book-diagram" aria-hidden="true">
                <span /><span /><span /><i />
              </div>
              <small>Cross-reference entered in case notes</small>
            </div>
          </div>
        </section>

        <section id="conclusion" className="story-scene conclusion-scene" data-scene-index="4" aria-labelledby="conclusion-title">
          <div className="mobile-scene-media">
            <ScenePicture scene={SCENES[4]} mobile />
            <span className="mobile-time">Cold dawn · 5:41 AM</span>
          </div>
          <div className="scene-copy scene-copy-right conclusion-heading">
            <p className="eyebrow">Observation V · A cold conclusion</p>
            <h2 id="conclusion-title" tabIndex={-1}>Dawn does not<br />solve the case.</h2>
            <p className="scene-statement">Attention does.</p>
          </div>
          <div className="conclusion-console">
            <fieldset>
              <legend>Which chain survives every contradiction?</legend>
              <label className={conclusionChoice === "courtyard" ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="conclusion"
                  value="courtyard"
                  checked={conclusionChoice === "courtyard"}
                  onChange={(event) => {
                    setConclusionChoice(event.target.value);
                    setConclusionRevealed(false);
                  }}
                />
                <span>A thief escaped through the rear courtyard.</span>
              </label>
              <label className={conclusionChoice === "staged" ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="conclusion"
                  value="staged"
                  checked={conclusionChoice === "staged"}
                  onChange={(event) => {
                    setConclusionChoice(event.target.value);
                    setConclusionRevealed(false);
                  }}
                />
                <span>The bookbinder staged the theft and made a second journey.</span>
              </label>
              <label className={conclusionChoice === "driver" ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="conclusion"
                  value="driver"
                  checked={conclusionChoice === "driver"}
                  onChange={(event) => {
                    setConclusionChoice(event.target.value);
                    setConclusionRevealed(false);
                  }}
                />
                <span>The hansom driver entered the bindery.</span>
              </label>
            </fieldset>
            <button className="primary-action reveal-action" type="button" disabled={!conclusionChoice} onClick={revealConclusion}>
              Reveal Holmes’s conclusion
            </button>
            {conclusionRevealed && (
              <div className="final-deduction" role="status">
                <span>{conclusionChoice === "staged" ? "Your chain holds." : "The clay contradicts it."}</span>
                <h3>The intruder never existed.</h3>
                <p>
                  The bookbinder carried the folio to a buyer, returned by hansom,
                  and arranged the room around himself. The warm latch fixes the time;
                  the clay records the journey; his own ash removes the stranger.
                </p>
                <strong>Case closed.</strong>
              </div>
            )}
            <div className="closing-actions">
              <button className="text-action" type="button" onClick={replayCase}>Replay the case</button>
              <button className="primary-action" type="button" onClick={() => openDialog(inquiryDialog)}>
                Commission an immersive mystery <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </section>

        <section className="field-notes" aria-labelledby="field-notes-title">
          <div className="section-intro">
            <p className="eyebrow">Field notes · The world behind the case</p>
            <h2 id="field-notes-title">The city was evidence.</h2>
            <p>
              The Cold Ember uses period-grounded details to make its fiction feel
              lived in—without borrowing any screen adaptation or actor likeness.
            </p>
          </div>
          <div className="field-note-grid">
            <article>
              <span>01 / Transit</span>
              <h3>How a hansom cab worked</h3>
              <p>
                The compact two-wheeled carriage carried two passengers. Its driver
                sat high behind the cabin and exchanged directions through a roof trapdoor.
              </p>
            </article>
            <article>
              <span>02 / Impression</span>
              <h3>Victorian footprint evidence</h3>
              <p>
                Depth, edge, direction, and local soil could turn a muddy print into a
                record of movement—especially when preserved with measurements or plaster.
              </p>
            </article>
            <article>
              <span>03 / Residue</span>
              <h3>Holmes and tobacco ash</h3>
              <p>
                Canonical Holmes catalogued tobacco residues as trace evidence. Here the
                pipe is historical characterization, never a product or reward.
              </p>
            </article>
          </div>
          <div className="faq-list">
            <details>
              <summary>Is this an official Sherlock Holmes adaptation?</summary>
              <p>No. It is an independent, original experience inspired by public-domain literary works.</p>
            </details>
            <details>
              <summary>Are the images and story original?</summary>
              <p>Yes. The writing, case, art direction, illustrations, animation system, and interface were created for this project.</p>
            </details>
            <details>
              <summary>Can the motion be stopped?</summary>
              <p>Yes. Use Pause motion in the header. The preference persists, and reduced-motion system settings are respected automatically.</p>
            </details>
          </div>
        </section>

        <section className="commission-section" aria-labelledby="commission-title">
          <p className="eyebrow">For studios, launches, exhibitions, and remarkable brands</p>
          <h2 id="commission-title">Turn your story into something people investigate.</h2>
          <p>
            We design cinematic, accessible web experiences that reward attention and
            turn passive audiences into active participants.
          </p>
          <button className="primary-action light-action" type="button" onClick={() => openDialog(inquiryDialog)}>
            Commission an immersive mystery <span aria-hidden="true">↗</span>
          </button>
        </section>
      </main>

      <nav className="scene-rail" aria-label="Scene navigation">
        <button type="button" onClick={() => scrollToScene(activeScene - 1)} disabled={activeScene === 0}>
          <span aria-hidden="true">←</span> Previous scene
        </button>
        <span><b>0{activeScene + 1}</b> / 0{SCENES.length} · {SCENES[activeScene].time}</span>
        <button type="button" onClick={() => scrollToScene(activeScene + 1)} disabled={activeScene === SCENES.length - 1}>
          Next scene <span aria-hidden="true">→</span>
        </button>
      </nav>

      <footer className="case-footer">
        <div>
          <strong>The Cold Ember</strong>
          <span>An original moving casebook · London 1895</span>
        </div>
        <p>
          An independent, unofficial adaptation inspired by public-domain literary
          works. Not affiliated with any film, television, museum, or estate.
        </p>
        <p>
          Historical context: tobacco is harmful in every form. This experience does
          not promote smoking or any tobacco brand.
        </p>
        <a href="#summons">Return to the beginning ↑</a>
      </footer>

      <dialog ref={indexDialog} className="case-dialog index-dialog" aria-labelledby="index-dialog-title">
        <div className="dialog-header">
          <div><span>Case directory</span><h2 id="index-dialog-title">Chapter index</h2></div>
          <button type="button" aria-label="Close chapter index" onClick={() => closeDialog(indexDialog)}>×</button>
        </div>
        <ol className="chapter-list">
          {SCENES.map((scene, index) => (
            <li key={scene.id}>
              <button type="button" onClick={() => { closeDialog(indexDialog); scrollToScene(index); }}>
                <span>0{index + 1}</span>
                <strong>{scene.title}</strong>
                <small>{scene.label} · {scene.time}</small>
                <i aria-hidden="true">↘</i>
              </button>
            </li>
          ))}
        </ol>
      </dialog>

      <dialog ref={notesDialog} className="case-dialog notes-dialog" aria-labelledby="notes-dialog-title">
        <div className="dialog-header">
          <div><span>Observations recorded</span><h2 id="notes-dialog-title">Case notes</h2></div>
          <button type="button" aria-label="Close case notes" onClick={() => closeDialog(notesDialog)}>×</button>
        </div>
        {notes.length === 0 ? (
          <div className="empty-notes">
            <span aria-hidden="true">◇</span>
            <h3>No observations yet.</h3>
            <p>Inspect the telegram, route, room, and books. Your notes remain on this device.</p>
          </div>
        ) : (
          <ol className="notes-list">
            {notes.map((id, index) => (
              <li key={id}>
                <span>0{index + 1}</span>
                <div><strong>{EVIDENCE[id].title}</strong><p>{EVIDENCE[id].observation}</p></div>
              </li>
            ))}
          </ol>
        )}
        <div className="dialog-footer">
          <span>{notes.length} of {Object.keys(EVIDENCE).length} observations</span>
          <button
            className="text-action"
            type="button"
            disabled={notes.length === 0}
            onClick={() => {
              setNotes([]);
              window.localStorage.removeItem("cold-ember-notes");
            }}
          >
            Clear case notes
          </button>
        </div>
      </dialog>

      <dialog ref={inquiryDialog} className="case-dialog inquiry-dialog" aria-labelledby="inquiry-dialog-title">
        <div className="dialog-header">
          <div><span>Start a conversation</span><h2 id="inquiry-dialog-title">Commission an immersive mystery</h2></div>
          <button type="button" aria-label="Close inquiry" onClick={() => closeDialog(inquiryDialog)}>×</button>
        </div>
        {formStatus === "success" ? (
          <div className="form-success" role="status">
            <span aria-hidden="true">✓</span>
            <h3>Inquiry received.</h3>
            <p>Your brief has entered the casebook. We’ll use the email you provided to continue the conversation.</p>
            <button className="primary-action" type="button" onClick={() => closeDialog(inquiryDialog)}>Close</button>
          </div>
        ) : (
          <form
            name="consultation"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={submitInquiry}
          >
            <input type="hidden" name="form-name" value="consultation" />
            <p className="honeypot">
              <label>Do not fill this field: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
            </p>
            <div className="form-grid">
              <label>
                <span>Name</span>
                <input name="name" type="text" autoComplete="name" required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label className="full-field">
                <span>Project type</span>
                <select name="project-type" required defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Brand launch</option>
                  <option>Interactive editorial</option>
                  <option>Exhibition or event</option>
                  <option>Portfolio or campaign</option>
                  <option>Something unprecedented</option>
                </select>
              </label>
              <label className="full-field">
                <span>What should people feel, discover, or do?</span>
                <textarea name="brief" rows={5} minLength={20} required />
              </label>
            </div>
            <label className="consent-field">
              <input type="checkbox" name="consent" value="yes" required />
              <span>I agree to be contacted about this project. No mailing list, no resale.</span>
            </label>
            <div className="submit-row">
              <p aria-live="polite">
                {formStatus === "error" ? "The line went quiet. Please try once more." : "Required fields are marked by their labels."}
              </p>
              <button className="primary-action" type="submit" disabled={formStatus === "sending"}>
                {formStatus === "sending" ? "Sending…" : "Send inquiry"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
