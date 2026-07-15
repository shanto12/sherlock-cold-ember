export type DialogueSceneId =
  | "summons"
  | "passage"
  | "room"
  | "archive"
  | "conclusion";

export type DialogueCharacter =
  | "Sherlock Holmes"
  | "Dr. Watson"
  | "Inspector Lestrade"
  | "Inspector Gregory"
  | "Irene Adler"
  | "Mrs. Hudson"
  | "Hansom driver";

export type DialogueSource = {
  story: string;
  collection: string;
  url: string;
};

export type DialogueLine = {
  speaker: DialogueCharacter;
  text: string;
  delivery: "measured" | "warm" | "urgent" | "official" | "hushed";
  source?: DialogueSource;
  cue?: "telegram" | "hoofbeat" | "glass" | "paper" | "reveal";
};

export type SceneDialogue = {
  title: string;
  atmosphere: string;
  lines: DialogueLine[];
};

const SCANDAL_SOURCE: DialogueSource = {
  story: "A Scandal in Bohemia",
  collection: "The Adventures of Sherlock Holmes",
  url: "https://en.wikisource.org/wiki/The_Adventures_of_Sherlock_Holmes_(1892,_US)/A_Scandal_in_Bohemia",
};

const BOSCOMBE_SOURCE: DialogueSource = {
  story: "The Boscombe Valley Mystery",
  collection: "The Adventures of Sherlock Holmes",
  url: "https://en.wikisource.org/wiki/The_Adventures_of_Sherlock_Holmes_(1892,_US)/The_Boscombe_Valley_Mystery",
};

const SPECKLED_BAND_SOURCE: DialogueSource = {
  story: "The Adventure of the Speckled Band",
  collection: "The Strand Magazine, Volume 3",
  url: "https://en.wikisource.org/wiki/The_Strand_Magazine/Volume_3/Issue_14/The_Adventure_of_the_Speckled_Band",
};

const MEMOIRS_SOURCE: DialogueSource = {
  story: "Silver Blaze",
  collection: "The Memoirs of Sherlock Holmes",
  url: "https://en.wikisource.org/wiki/The_Strand_Magazine/Volume_4/Issue_24/The_Adventure_of_Silver_Blaze",
};

const STUDY_SOURCE: DialogueSource = {
  story: "A Study in Scarlet, Part I, Chapter 3",
  collection: "A Study in Scarlet",
  url: "https://en.wikisource.org/wiki/A_Study_in_Scarlet/Part_1/Chapter_3",
};

export const DIALOGUES: Record<DialogueSceneId, SceneDialogue> = {
  summons: {
    title: "The wire at Baker Street",
    atmosphere: "Rain at the sash · low fire · telegram key",
    lines: [
      {
        speaker: "Mrs. Hudson",
        text: "A telegram, Mr. Holmes. The boy would not wait for a reply.",
        delivery: "hushed",
        cue: "telegram",
      },
      {
        speaker: "Dr. Watson",
        text: "There was rain in every fold, yet the paper was warm from the messenger’s hand.",
        delivery: "warm",
      },
      {
        speaker: "Sherlock Holmes",
        text: "You see, but you do not observe. The distinction is clear.",
        delivery: "measured",
        source: SCANDAL_SOURCE,
      },
      {
        speaker: "Sherlock Holmes",
        text: "The sender describes a locked room. The paper describes a journey. I believe the paper.",
        delivery: "measured",
        cue: "reveal",
      },
    ],
  },
  passage: {
    title: "The southbound hansom",
    atmosphere: "Wet wheels · horse rhythm · London wind",
    lines: [
      {
        speaker: "Dr. Watson",
        text: "My dear fellow, I would not miss it for anything.",
        delivery: "warm",
        source: SPECKLED_BAND_SOURCE,
      },
      {
        speaker: "Hansom driver",
        text: "Kennington Road is cut to clay, gentlemen. Hold fast through the works.",
        delivery: "urgent",
        cue: "hoofbeat",
      },
      {
        speaker: "Dr. Watson",
        text: "The cab slowed twice. Once for traffic—and once where no traffic stood.",
        delivery: "warm",
      },
      {
        speaker: "Sherlock Holmes",
        text: "Listen to the near wheel, Watson. The street has signed its name in mud.",
        delivery: "measured",
      },
    ],
  },
  room: {
    title: "The impossible room",
    atmosphere: "Cold stove · lamp hiss · distant constable",
    lines: [
      {
        speaker: "Inspector Lestrade",
        text: "Locked cabinet. Missing folio. One senseless binder and no departing print. Make sense of that.",
        delivery: "official",
      },
      {
        speaker: "Dr. Watson",
        text: "The facts appear almost too plain.",
        delivery: "warm",
      },
      {
        speaker: "Sherlock Holmes",
        text: "There is nothing more deceptive than an obvious fact.",
        delivery: "measured",
        source: BOSCOMBE_SOURCE,
      },
      {
        speaker: "Sherlock Holmes",
        text: "Begin with what the room should have forgotten: warmth, weight, and the owner’s own ash.",
        delivery: "measured",
        cue: "glass",
      },
    ],
  },
  archive: {
    title: "Echoes in the index",
    atmosphere: "Turning leaves · clockwork · remembered voices",
    lines: [
      {
        speaker: "Dr. Watson",
        text: "A clue may be an absence. I remember the dog at King’s Pyland.",
        delivery: "warm",
        cue: "paper",
      },
      {
        speaker: "Inspector Gregory",
        text: "The dog did nothing in the night-time.",
        delivery: "official",
        source: MEMOIRS_SOURCE,
      },
      {
        speaker: "Sherlock Holmes",
        text: "That was the curious incident.",
        delivery: "measured",
        source: MEMOIRS_SOURCE,
      },
      {
        speaker: "Irene Adler",
        text: "I love and am loved by a better man than he.",
        delivery: "hushed",
        source: SCANDAL_SOURCE,
      },
    ],
  },
  conclusion: {
    title: "Dawn at Baker Street",
    atmosphere: "Last rain · settling fire · first morning bell",
    lines: [
      {
        speaker: "Inspector Lestrade",
        text: "This case will make a stir, sir.",
        delivery: "official",
        source: STUDY_SOURCE,
      },
      {
        speaker: "Sherlock Holmes",
        text: "The Yard is generous. The clay was less so.",
        delivery: "measured",
      },
      {
        speaker: "Dr. Watson",
        text: "So the room was never breached. It was composed.",
        delivery: "warm",
      },
      {
        speaker: "Sherlock Holmes",
        text: "Precisely. Four clues, one journey, and an alibi built to collapse at dawn.",
        delivery: "measured",
        cue: "reveal",
      },
    ],
  },
};

export const DIALOGUE_SOURCES = [
  SCANDAL_SOURCE,
  BOSCOMBE_SOURCE,
  SPECKLED_BAND_SOURCE,
  MEMOIRS_SOURCE,
  STUDY_SOURCE,
] as const;
