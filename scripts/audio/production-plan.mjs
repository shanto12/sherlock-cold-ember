/**
 * Public, auditable maintainer production plan for the Cold Ember soundtrack.
 *
 * Every voice direction is explicitly original and non-celebrity. No actor,
 * adaptation, or living person's vocal likeness is referenced by this plan.
 */

export const production = {
  release: "cold-ember-cinematic-audio-v1",
  ttsModel: "eleven_v3",
  voiceDesignModel: "eleven_multilingual_ttv_v2",
  soundEffectsModel: "eleven_text_to_sound_v2",
  outputFormat: "mp3_44100_192",
  voiceRoles: {
    holmes: {
      character: "Sherlock Holmes",
      publicLabel: "The Consulting Detective",
      voiceName: "Cold Ember - Consulting Detective - Original",
      description:
        "An entirely original British male voice, late thirties, lean low baritone, precise consonants, controlled intensity, dry intelligence, intimate studio clarity, natural breathing, emotionally restrained but never flat. Wholly original and not based on any actor, celebrity, adaptation, or living person.",
      previewText:
        "The rain is useful, if one listens closely. It alters the street, presses clay into a boot, and leaves a small confession on every threshold. Do come nearer. This is not a mystery of locked doors, but of the person who wished us to stare at one.",
      deliveryPrefix: "[quiet, precise, natural British delivery]",
    },
    watson: {
      character: "Dr. Watson",
      publicLabel: "The Doctor and Chronicler",
      voiceName: "Cold Ember - Doctor Chronicler - Original",
      description:
        "An entirely original British male voice, early forties, warm resonant baritone, compassionate physician, observant storyteller, rounded diction, subtle wonder, lived-in humanity, natural pacing and breath. Wholly original and not based on any actor, celebrity, adaptation, or living person.",
      previewText:
        "I had seen my friend draw astonishing answers from very little, yet that wet November evening felt different. The room held its breath with us, and even the fire seemed reluctant to disturb the silence.",
      deliveryPrefix: "[warm, intimate, naturally narrated]",
    },
    lestrade: {
      character: "Inspector Lestrade",
      publicLabel: "The Yard Inspector",
      voiceName: "Cold Ember - Yard Inspector - Original",
      description:
        "An entirely original London male voice, mid forties, compact tenor-baritone, brisk official authority, clipped but natural speech, practical skepticism, faint fatigue beneath professional control. Wholly original and not based on any actor, celebrity, adaptation, or living person.",
      previewText:
        "The window was fastened, the cabinet locked, and two constables watched the only stair. I know how it sounds. That is precisely why I sent for a second opinion before the morning papers arrived.",
      deliveryPrefix: "[brisk, official, quietly frustrated]",
    },
    gregory: {
      character: "Inspector Gregory",
      publicLabel: "The Country Inspector",
      voiceName: "Cold Ember - Country Inspector - Original",
      description:
        "An entirely original British male voice, early fifties, grounded mid baritone, calm provincial constabulary authority, careful diction, dry patience, understated confidence and natural conversational rhythm. Wholly original and not based on any actor, celebrity, adaptation, or living person.",
      previewText:
        "Nothing crossed the yard after midnight. We checked the gate, the stable, and every patch of soft ground. The curious part is not what the witnesses heard, but what the old dog chose to ignore.",
      deliveryPrefix: "[matter-of-fact, measured, natural]",
    },
    irene: {
      character: "Irene Adler",
      publicLabel: "The Contralto",
      voiceName: "Cold Ember - Poised Contralto - Original",
      description:
        "An entirely original British female voice, mid thirties, poised velvet contralto, quick intelligence, elegant self-possession, subtle warmth, emotionally precise, close-microphone realism and unforced confidence. Wholly original and not based on any actor, celebrity, adaptation, or living person.",
      previewText:
        "You mistake composure for surrender. A good disguise changes the eye before it changes the face, and the strongest exit is often the one an observer has already decided not to see.",
      deliveryPrefix: "[soft, poised, quietly resolute]",
    },
    hudson: {
      character: "Mrs. Hudson",
      publicLabel: "The Baker Street Landlady",
      voiceName: "Cold Ember - Baker Street Landlady - Original",
      description:
        "An entirely original mature British female voice, late fifties, warm clear alto, capable household authority, gentle concern, quick practical timing, natural breath and a lightly textured lived-in tone. Wholly original and not based on any actor, celebrity, adaptation, or living person.",
      previewText:
        "There is a messenger at the door, sir, and enough rain on his coat to flood the hall. I have put fresh coal on the fire. Whatever the telegram says, it can at least be read in a warm room.",
      deliveryPrefix: "[hushed but practical, natural]",
    },
    driver: {
      character: "Hansom driver",
      publicLabel: "The Night Driver",
      voiceName: "Cold Ember - London Night Driver - Original",
      description:
        "An entirely original London male voice, late forties, weathered chest voice, energetic working driver, clear street projection without caricature, brisk urgency, good humor and believable breath in cold air. Wholly original and not based on any actor, celebrity, adaptation, or living person.",
      previewText:
        "Road is slick past the bridge, gentlemen. Keep your hands inside and your hats down. The mare knows the stones, but no horse can bargain with a wheel rut deep enough to swallow a boot.",
      deliveryPrefix: "[calling over wind, urgent but natural]",
    },
  },
  ambience: {
    summons: {
      durationSeconds: 30,
      prompt:
        "Seamless loop, interior of a quiet Baker Street sitting room in Victorian London at night, steady rain pattering on a sash window, low coal fireplace crackle, soft distant city carriage rumble outside, occasional wooden room creak, intimate and realistic, no voices, no music, no thunder, cinematic stereo ambience",
    },
    passage: {
      durationSeconds: 30,
      prompt:
        "Seamless loop from inside a moving Victorian hansom cab on a wet London street at night, rhythmic horse hooves on slick cobblestones, leather harness creaks, wooden wheels through shallow puddles, cold wind around the cab, distant city murmur, realistic cinematic stereo, no voices, no music, no modern traffic",
    },
    room: {
      durationSeconds: 30,
      prompt:
        "Seamless loop, cold Victorian records office after midnight, low oil lamp hiss, weak wind against old glass, nearly dead iron stove ticking, distant constable footsteps far down a stone corridor, tense quiet room tone, realistic cinematic stereo, no voices, no music",
    },
    archive: {
      durationSeconds: 30,
      prompt:
        "Seamless loop, shadowed Victorian archive reading room, tall clockwork ticking, faint paper and leather movement, occasional page settling, gentle room resonance, whisper of rain far beyond thick windows, mysterious but realistic cinematic stereo, no intelligible voices, no music",
    },
    conclusion: {
      durationSeconds: 30,
      prompt:
        "Seamless loop, Baker Street sitting room just before dawn, rain easing at the window, settling coal fire, distant first morning carriage and very faint city bell, calm London room tone after a long night, warm realistic cinematic stereo, no voices, no music",
    },
  },
  effects: {
    telegram: {
      durationSeconds: 3.5,
      prompt:
        "Victorian telegram delivered onto a wooden desk: quick door movement in the distance, folded damp paper placed down, paper rustle and a small brass telegraph key click, close realistic Foley, no voices, no music",
    },
    hoofbeat: {
      durationSeconds: 5.5,
      prompt:
        "A single Victorian carriage horse passes very close on wet cobblestones, detailed four-beat hoof rhythm, harness jingle, one wooden hansom wheel splashes through a shallow puddle, cinematic realistic Foley, no voices, no music, no modern sounds",
    },
    carriageTurn: {
      durationSeconds: 6,
      prompt:
        "Victorian hansom cab makes a tight turn on a rainy cobblestone London street, horse slows then pulls, wooden wheels creak and scrape lightly, leather tack and harness shift, realistic close cinematic Foley, no voices, no music",
    },
    glass: {
      durationSeconds: 2.5,
      prompt:
        "Small Victorian magnifying glass lifted from a wooden desk, delicate glass and brass contact, sleeve brushes paper, restrained close-microphone Foley, no voices, no music",
    },
    paper: {
      durationSeconds: 4.5,
      prompt:
        "Old Victorian casebook opened on a reading desk, several dry archival pages turn, leather binding settles, a fingertip stops on one entry, intimate realistic Foley, no voices, no music",
    },
    clock: {
      durationSeconds: 5,
      prompt:
        "Large Victorian wall clock mechanism grows momentarily louder and strikes one soft resonant bell, wooden room reflections, subtle and realistic, no voices, no music",
    },
    reveal: {
      durationSeconds: 4.5,
      prompt:
        "Original restrained mystery revelation accent made only from low bowed metal resonance, a soft glass harmonic and a warm sub pulse, elegant cinematic transition, no melody, no voices, no recognizable theme",
    },
    footsteps: {
      durationSeconds: 5,
      prompt:
        "Measured leather-soled Victorian footsteps approach along a stone corridor, pause outside a wooden office door, realistic perspective and room echo, no voices, no music",
    },
    fireSettle: {
      durationSeconds: 4,
      prompt:
        "Close coal fireplace gives a gentle settling crackle, one coal shifts and a quiet ember sighs, warm intimate realistic Foley, no voices, no music",
    },
    morningBell: {
      durationSeconds: 5.5,
      prompt:
        "Very distant London morning church bell heard through a closed rain-speckled window, two soft resonant tolls with city air, subtle realistic perspective, no voices, no music",
    },
  },
  scenes: {
    summons: {
      title: "The wire at Baker Street",
      atmosphere: "Rain at the sash · low fire · telegram paper",
      preRollMs: 1650,
      gapMs: [600, 620, 720],
      tailMs: 2200,
      effects: [
        { id: "telegram", atMs: 280, gainDb: -7 },
        { id: "reveal", anchorLine: 3, offsetMs: 1250, gainDb: -14 },
      ],
      lines: [
        {
          voice: "hudson",
          speaker: "Mrs. Hudson",
          text: "A telegram, Mr. Holmes. The boy would not wait for a reply.",
          direction: "[hushed, entering from the doorway]",
        },
        {
          voice: "watson",
          speaker: "Dr. Watson",
          text: "There was rain in every fold, yet the paper was warm from the messenger’s hand.",
          direction: "[reflective, intimate narration]",
        },
        {
          voice: "holmes",
          speaker: "Sherlock Holmes",
          text: "You see, but you do not observe. The distinction is clear.",
          direction: "[quietly precise, with a dry edge]",
        },
        {
          voice: "holmes",
          speaker: "Sherlock Holmes",
          text: "The sender describes a locked room. The paper describes a journey. I believe the paper.",
          direction: "[low, certain, a measured revelation]",
        },
      ],
    },
    passage: {
      title: "The southbound hansom",
      atmosphere: "Wet wheels · horse rhythm · London wind",
      preRollMs: 1500,
      gapMs: [650, 700, 650],
      tailMs: 2100,
      effects: [
        { id: "hoofbeat", atMs: 250, gainDb: -9 },
        { id: "carriageTurn", anchorLine: 2, offsetMs: 100, gainDb: -12 },
      ],
      lines: [
        {
          voice: "watson",
          speaker: "Dr. Watson",
          text: "My dear fellow, I would not miss it for anything.",
          direction: "[warmly, over the rhythm of the cab]",
        },
        {
          voice: "driver",
          speaker: "Hansom driver",
          text: "Kennington Road is cut to clay, gentlemen. Hold fast through the works.",
          direction: "[calling back over wind and hoofbeats]",
        },
        {
          voice: "watson",
          speaker: "Dr. Watson",
          text: "The cab slowed twice. Once for traffic—and once where no traffic stood.",
          direction: "[lower, newly suspicious]",
        },
        {
          voice: "holmes",
          speaker: "Sherlock Holmes",
          text: "Listen to the near wheel, Watson. The street has signed its name in mud.",
          direction: "[close and controlled, speaking over the cab]",
        },
      ],
    },
    room: {
      title: "The impossible room",
      atmosphere: "Cold stove · lamp hiss · distant constable",
      preRollMs: 1550,
      gapMs: [650, 650, 720],
      tailMs: 2100,
      effects: [
        { id: "footsteps", atMs: 120, gainDb: -15 },
        { id: "glass", anchorLine: 3, offsetMs: 1150, gainDb: -7 },
      ],
      lines: [
        {
          voice: "lestrade",
          speaker: "Inspector Lestrade",
          text: "Locked cabinet. Missing folio. One senseless binder and no departing print. Make sense of that.",
          direction: "[clipped, official, containing frustration]",
        },
        {
          voice: "watson",
          speaker: "Dr. Watson",
          text: "The facts appear almost too plain.",
          direction: "[carefully, unsettled by the room]",
        },
        {
          voice: "holmes",
          speaker: "Sherlock Holmes",
          text: "There is nothing more deceptive than an obvious fact.",
          direction: "[soft, exact, faintly admonishing]",
        },
        {
          voice: "holmes",
          speaker: "Sherlock Holmes",
          text: "Begin with what the room should have forgotten: warmth, weight, and the owner’s own ash.",
          direction: "[measured deduction, growing certainty]",
        },
      ],
    },
    archive: {
      title: "Echoes in the index",
      atmosphere: "Turning leaves · clockwork · remembered voices",
      preRollMs: 1550,
      gapMs: [650, 600, 760],
      tailMs: 2400,
      effects: [
        { id: "paper", atMs: 180, gainDb: -7 },
        { id: "clock", anchorLine: 2, offsetMs: -300, gainDb: -15 },
      ],
      lines: [
        {
          voice: "watson",
          speaker: "Dr. Watson",
          text: "A clue may be an absence. I remember the dog at King’s Pyland.",
          direction: "[remembering aloud, intimate]",
        },
        {
          voice: "gregory",
          speaker: "Inspector Gregory",
          text: "The dog did nothing in the night-time.",
          direction: "[matter-of-fact, as a remembered voice]",
        },
        {
          voice: "holmes",
          speaker: "Sherlock Holmes",
          text: "That was the curious incident.",
          direction: "[quiet, decisive, as memory resolves]",
        },
        {
          voice: "irene",
          speaker: "Irene Adler",
          text: "I love and am loved by a better man than he.",
          direction: "[poised, soft, utterly resolved]",
        },
      ],
    },
    conclusion: {
      title: "Dawn at Baker Street",
      atmosphere: "Last rain · settling fire · first morning bell",
      preRollMs: 1550,
      gapMs: [650, 650, 780],
      tailMs: 2700,
      effects: [
        { id: "fireSettle", atMs: 250, gainDb: -10 },
        { id: "morningBell", anchorLine: 3, offsetMs: 1200, gainDb: -15 },
        { id: "reveal", anchorLine: 3, offsetMs: 450, gainDb: -16 },
      ],
      lines: [
        {
          voice: "lestrade",
          speaker: "Inspector Lestrade",
          text: "This case will make a stir, sir.",
          direction: "[quiet official respect, tired after the night]",
        },
        {
          voice: "holmes",
          speaker: "Sherlock Holmes",
          text: "The Yard is generous. The clay was less so.",
          direction: "[dry, understated satisfaction]",
        },
        {
          voice: "watson",
          speaker: "Dr. Watson",
          text: "So the room was never breached. It was composed.",
          direction: "[wonder giving way to understanding]",
        },
        {
          voice: "holmes",
          speaker: "Sherlock Holmes",
          text: "Precisely. Four clues, one journey, and an alibi built to collapse at dawn.",
          direction: "[precise, conclusive, then a quiet release]",
        },
      ],
    },
  },
};
