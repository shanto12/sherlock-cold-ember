/**
 * Fingerprinted, self-hosted cinematic audio inventory.
 *
 * Generated offline from scripts/audio/production-plan.mjs. It contains no
 * API key or runtime provider dependency. Voice IDs are intentionally omitted.
 */
export const CINEMATIC_AUDIO_MANIFEST = Object.freeze({
  "schemaVersion": 1,
  "release": "cold-ember-cinematic-audio-v1",
  "mix": {
    "dialogueTargetLufs": -16,
    "dialogueStemTargetLufs": -17,
    "masterTargetLufs": -18,
    "masterTruePeakCeilingDbfs": -1,
    "ambienceDucking": {
      "ratio": 9,
      "attackMs": 25,
      "releaseMs": 650
    }
  },
  "provenance": {
    "speechProvider": "ElevenLabs",
    "speechModel": "eleven_v3",
    "voiceOrigin": "Original Voice Design",
    "soundEffectsProvider": "ElevenLabs",
    "soundEffectsModel": "eleven_text_to_sound_v2",
    "masteringTool": "FFmpeg loudnorm + sidechain compression",
    "runtimeApiRequired": false,
    "containsSecrets": false,
    "celebrityOrActorVoiceLikenesses": false,
    "measuredTextCharactersUsed": 6063
  },
  "cast": {
    "holmes": {
      "character": "Sherlock Holmes",
      "publicLabel": "The Consulting Detective",
      "origin": "ElevenLabs Voice Design",
      "originalNonCelebrityVoice": true,
      "likenessReferences": []
    },
    "watson": {
      "character": "Dr. Watson",
      "publicLabel": "The Doctor and Chronicler",
      "origin": "ElevenLabs Voice Design",
      "originalNonCelebrityVoice": true,
      "likenessReferences": []
    },
    "lestrade": {
      "character": "Inspector Lestrade",
      "publicLabel": "The Yard Inspector",
      "origin": "ElevenLabs Voice Design",
      "originalNonCelebrityVoice": true,
      "likenessReferences": []
    },
    "gregory": {
      "character": "Inspector Gregory",
      "publicLabel": "The Country Inspector",
      "origin": "ElevenLabs Voice Design",
      "originalNonCelebrityVoice": true,
      "likenessReferences": []
    },
    "irene": {
      "character": "Irene Adler",
      "publicLabel": "The Contralto",
      "origin": "ElevenLabs Voice Design",
      "originalNonCelebrityVoice": true,
      "likenessReferences": []
    },
    "hudson": {
      "character": "Mrs. Hudson",
      "publicLabel": "The Baker Street Landlady",
      "origin": "ElevenLabs Voice Design",
      "originalNonCelebrityVoice": true,
      "likenessReferences": []
    },
    "driver": {
      "character": "Hansom driver",
      "publicLabel": "The Night Driver",
      "origin": "ElevenLabs Voice Design",
      "originalNonCelebrityVoice": true,
      "likenessReferences": []
    }
  },
  "scenes": {
    "summons": {
      "title": "The wire at Baker Street",
      "atmosphere": "Rain at the sash · low fire · telegram paper",
      "durationMs": 26590,
      "dialogueStem": {
        "url": "/audio/cinematic/scenes/summons-dialogue.876bd0f09efb.mp3",
        "sha256": "876bd0f09efb7e3ebf7f7f6754849c25b24e255eb7f3509b6c7ad5dd44671e96",
        "durationSeconds": 26.59,
        "durationMs": 26590,
        "sizeBytes": 639521,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "dialogueStemLoudness": {
        "integratedLufs": -17.2,
        "truePeakDbfs": -2.2
      },
      "ambienceLoop": {
        "url": "/audio/cinematic/ambience/summons.fd30b2ebec47.mp3",
        "sha256": "fd30b2ebec47490c67380859acda31b7cf9c88de6c3d03e2bad98d218d3e492e",
        "durationSeconds": 30,
        "durationMs": 30000,
        "sizeBytes": 721650,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "master": {
        "url": "/audio/cinematic/scenes/summons.bb3d3b996fe1.mp3",
        "sha256": "bb3d3b996fe171b4da940127836ea0694651d4b454c5d642566bf109cff43555",
        "durationSeconds": 26.59,
        "durationMs": 26590,
        "sizeBytes": 639521,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "masterLoudness": {
        "integratedLufs": -19.1,
        "truePeakDbfs": -2.2
      },
      "lines": [
        {
          "index": 0,
          "speaker": "Mrs. Hudson",
          "text": "A telegram, Mr. Holmes. The boy would not wait for a reply.",
          "voiceRole": "hudson",
          "startMs": 1650,
          "endMs": 5490,
          "stem": {
            "url": "/audio/cinematic/dialogue/summons/01-mrs-hudson.528387f6a446.mp3",
            "sha256": "528387f6a446e090309153cbbe028afdc28fb1cc36239965e567dbc25ee56ce1",
            "durationSeconds": 3.84,
            "durationMs": 3840,
            "sizeBytes": 93457,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 127,
            "authoredTextMatched": true
          }
        },
        {
          "index": 1,
          "speaker": "Dr. Watson",
          "text": "There was rain in every fold, yet the paper was warm from the messenger’s hand.",
          "voiceRole": "watson",
          "startMs": 6090,
          "endMs": 11930,
          "stem": {
            "url": "/audio/cinematic/dialogue/summons/02-dr-watson.41075acf096d.mp3",
            "sha256": "41075acf096d1c7649afbd7fff5d85d426c61a8d4be11be3bb8754c9dd3bc016",
            "durationSeconds": 5.84,
            "durationMs": 5840,
            "sizeBytes": 141732,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 149,
            "authoredTextMatched": true
          }
        },
        {
          "index": 2,
          "speaker": "Sherlock Holmes",
          "text": "You see, but you do not observe. The distinction is clear.",
          "voiceRole": "holmes",
          "startMs": 12550,
          "endMs": 17110,
          "stem": {
            "url": "/audio/cinematic/dialogue/summons/03-sherlock-holmes.4fe8af2cb02c.mp3",
            "sha256": "4fe8af2cb02cadf4509970fe7cb4cfd83137b1946fb3f55d761d85652774ecfc",
            "durationSeconds": 4.56,
            "durationMs": 4560,
            "sizeBytes": 111012,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 136,
            "authoredTextMatched": true
          }
        },
        {
          "index": 3,
          "speaker": "Sherlock Holmes",
          "text": "The sender describes a locked room. The paper describes a journey. I believe the paper.",
          "voiceRole": "holmes",
          "startMs": 17830,
          "endMs": 24390,
          "stem": {
            "url": "/audio/cinematic/dialogue/summons/04-sherlock-holmes.154d2678e93e.mp3",
            "sha256": "154d2678e93e99eb13fa7b9160aa9b479b567174b8f52b9f23c98541ec70097c",
            "durationSeconds": 6.56,
            "durationMs": 6560,
            "sizeBytes": 159286,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 168,
            "authoredTextMatched": true
          }
        }
      ],
      "effects": [
        {
          "id": "telegram",
          "startMs": 280,
          "gainDb": -7,
          "asset": {
            "url": "/audio/cinematic/foley/telegram.99949bf6c5dd.mp3",
            "sha256": "99949bf6c5dd384ee369c380bf703651ee49b2881f9b9f2c6bcca02123015529",
            "durationSeconds": 3.48,
            "durationMs": 3480,
            "sizeBytes": 85307,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        },
        {
          "id": "reveal",
          "startMs": 19080,
          "gainDb": -14,
          "asset": {
            "url": "/audio/cinematic/foley/reveal.d51867fd0bb2.mp3",
            "sha256": "d51867fd0bb20521caf54a25fc23348f7f24cc3ed532bbb3caf01f7020064577",
            "durationSeconds": 4.48,
            "durationMs": 4480,
            "sizeBytes": 109131,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        }
      ],
      "forcedAlignment": {
        "provider": "ElevenLabs Forced Alignment",
        "loss": 0.033199,
        "wordsAligned": 105,
        "transcriptCharacters": 286,
        "firstWordStartSeconds": 1.779,
        "lastWordEndSeconds": 24.219,
        "monotonicWordTiming": true
      }
    },
    "passage": {
      "title": "The southbound hansom",
      "atmosphere": "Wet wheels · horse rhythm · London wind",
      "durationMs": 25520,
      "dialogueStem": {
        "url": "/audio/cinematic/scenes/passage-dialogue.5f84db0e5dde.mp3",
        "sha256": "5f84db0e5ddefdc3cf550abab17115f2fabf34c59b583bc45b77e1c08d3ac56f",
        "durationSeconds": 25.52,
        "durationMs": 25520,
        "sizeBytes": 613817,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "dialogueStemLoudness": {
        "integratedLufs": -17.4,
        "truePeakDbfs": -2.2
      },
      "ambienceLoop": {
        "url": "/audio/cinematic/ambience/passage.06bb04769234.mp3",
        "sha256": "06bb04769234993e2e9c057a4026f9dc94697acde3fa91a23116045b84183906",
        "durationSeconds": 30,
        "durationMs": 30000,
        "sizeBytes": 721650,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "master": {
        "url": "/audio/cinematic/scenes/passage.ea99e129003a.mp3",
        "sha256": "ea99e129003a2b255cee20c87884afc7888e38470b4c9d48d5d7ee50066fb74f",
        "durationSeconds": 25.52,
        "durationMs": 25520,
        "sizeBytes": 613817,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "masterLoudness": {
        "integratedLufs": -19.1,
        "truePeakDbfs": -2.2
      },
      "lines": [
        {
          "index": 0,
          "speaker": "Dr. Watson",
          "text": "My dear fellow, I would not miss it for anything.",
          "voiceRole": "watson",
          "startMs": 1500,
          "endMs": 5100,
          "stem": {
            "url": "/audio/cinematic/dialogue/passage/01-dr-watson.426dcc5b0c94.mp3",
            "sha256": "426dcc5b0c947b8094d789e9a47a2c897e17713006cb3c69c6c34ef5d260adb7",
            "durationSeconds": 3.6,
            "durationMs": 3600,
            "sizeBytes": 87815,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 123,
            "authoredTextMatched": true
          }
        },
        {
          "index": 1,
          "speaker": "Hansom driver",
          "text": "Kennington Road is cut to clay, gentlemen. Hold fast through the works.",
          "voiceRole": "driver",
          "startMs": 5750,
          "endMs": 10150,
          "stem": {
            "url": "/audio/cinematic/dialogue/passage/02-hansom-driver.143d6b5c95e0.mp3",
            "sha256": "143d6b5c95e0f043e2066c4dedc69921879815c52bf39d04dec9b46c8396c392",
            "durationSeconds": 4.4,
            "durationMs": 4400,
            "sizeBytes": 107250,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 150,
            "authoredTextMatched": true
          }
        },
        {
          "index": 2,
          "speaker": "Dr. Watson",
          "text": "The cab slowed twice. Once for traffic—and once where no traffic stood.",
          "voiceRole": "watson",
          "startMs": 10850,
          "endMs": 17010,
          "stem": {
            "url": "/audio/cinematic/dialogue/passage/03-dr-watson.7a53b971af7a.mp3",
            "sha256": "7a53b971af7a2b7a7225714f9e04c7c984bbda79a50d3a308e055a6ae84cd06b",
            "durationSeconds": 6.16,
            "durationMs": 6160,
            "sizeBytes": 149255,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 134,
            "authoredTextMatched": true
          }
        },
        {
          "index": 3,
          "speaker": "Sherlock Holmes",
          "text": "Listen to the near wheel, Watson. The street has signed its name in mud.",
          "voiceRole": "holmes",
          "startMs": 17660,
          "endMs": 23420,
          "stem": {
            "url": "/audio/cinematic/dialogue/passage/04-sherlock-holmes.72a1cdd515cb.mp3",
            "sha256": "72a1cdd515cb38d944837384902a1ba3d9c9bf3b133a98f6abb5c58b0ce01d7b",
            "durationSeconds": 5.76,
            "durationMs": 5760,
            "sizeBytes": 139851,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 161,
            "authoredTextMatched": true
          }
        }
      ],
      "effects": [
        {
          "id": "hoofbeat",
          "startMs": 250,
          "gainDb": -9,
          "asset": {
            "url": "/audio/cinematic/foley/hoofbeat.7c3eff3a2dc1.mp3",
            "sha256": "7c3eff3a2dc1d705092477ee2f2286f1e128854286a8812c4499de09f880db95",
            "durationSeconds": 5.48,
            "durationMs": 5480,
            "sizeBytes": 132955,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        },
        {
          "id": "carriageTurn",
          "startMs": 10950,
          "gainDb": -12,
          "asset": {
            "url": "/audio/cinematic/foley/carriageturn.19a2cd02a668.mp3",
            "sha256": "19a2cd02a66861777af5fc33cec6d427a35b7f1bc51501b98a5becf6217e95d8",
            "durationSeconds": 6,
            "durationMs": 6000,
            "sizeBytes": 145493,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        }
      ],
      "forcedAlignment": {
        "provider": "ElevenLabs Forced Alignment",
        "loss": 0.06532,
        "wordsAligned": 95,
        "transcriptCharacters": 266,
        "firstWordStartSeconds": 1.759,
        "lastWordEndSeconds": 23.419,
        "monotonicWordTiming": true
      }
    },
    "room": {
      "title": "The impossible room",
      "atmosphere": "Cold stove · lamp hiss · distant constable",
      "durationMs": 27510,
      "dialogueStem": {
        "url": "/audio/cinematic/scenes/room-dialogue.9d13baedc423.mp3",
        "sha256": "9d13baedc42338b42107756969c60effec0711f7355fb04a2237aeb814b44437",
        "durationSeconds": 27.51,
        "durationMs": 27510,
        "sizeBytes": 662091,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "dialogueStemLoudness": {
        "integratedLufs": -17,
        "truePeakDbfs": -2.2
      },
      "ambienceLoop": {
        "url": "/audio/cinematic/ambience/room.8234ba09ffb9.mp3",
        "sha256": "8234ba09ffb9e751b6818706e8ec27ffd52e046fb5d6f675fa87b30678dff1f2",
        "durationSeconds": 30,
        "durationMs": 30000,
        "sizeBytes": 721650,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "master": {
        "url": "/audio/cinematic/scenes/room.b695501fc3a5.mp3",
        "sha256": "b695501fc3a5e912c73e101cc435ef066acd27d1ceb2822bb2addef695edf01f",
        "durationSeconds": 27.51,
        "durationMs": 27510,
        "sizeBytes": 662091,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "masterLoudness": {
        "integratedLufs": -18.4,
        "truePeakDbfs": -2.1
      },
      "lines": [
        {
          "index": 0,
          "speaker": "Inspector Lestrade",
          "text": "Locked cabinet. Missing folio. One senseless binder and no departing print. Make sense of that.",
          "voiceRole": "lestrade",
          "startMs": 1550,
          "endMs": 8830,
          "stem": {
            "url": "/audio/cinematic/dialogue/room/01-inspector-lestrade.09cb4e805d27.mp3",
            "sha256": "09cb4e805d27f140577631a2f51741dee20c26099eb3e3cde50b054b9664c60e",
            "durationSeconds": 7.28,
            "durationMs": 7280,
            "sizeBytes": 176213,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 177,
            "authoredTextMatched": true
          }
        },
        {
          "index": 1,
          "speaker": "Dr. Watson",
          "text": "The facts appear almost too plain.",
          "voiceRole": "watson",
          "startMs": 9480,
          "endMs": 12840,
          "stem": {
            "url": "/audio/cinematic/dialogue/room/02-dr-watson.7cc064db8cd3.mp3",
            "sha256": "7cc064db8cd340bc57d5bb68b0e8bbffac4ed076062f0ca1beb86f9105649d8e",
            "durationSeconds": 3.36,
            "durationMs": 3360,
            "sizeBytes": 82173,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 106,
            "authoredTextMatched": true
          }
        },
        {
          "index": 2,
          "speaker": "Sherlock Holmes",
          "text": "There is nothing more deceptive than an obvious fact.",
          "voiceRole": "holmes",
          "startMs": 13490,
          "endMs": 16930,
          "stem": {
            "url": "/audio/cinematic/dialogue/room/03-sherlock-holmes.d20a827b3f30.mp3",
            "sha256": "d20a827b3f304b3479b46318bbbd139c0189be4e2ff3d19ed0f7c13fcec53899",
            "durationSeconds": 3.44,
            "durationMs": 3440,
            "sizeBytes": 84053,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 131,
            "authoredTextMatched": true
          }
        },
        {
          "index": 3,
          "speaker": "Sherlock Holmes",
          "text": "Begin with what the room should have forgotten: warmth, weight, and the owner’s own ash.",
          "voiceRole": "holmes",
          "startMs": 17650,
          "endMs": 25410,
          "stem": {
            "url": "/audio/cinematic/dialogue/room/04-sherlock-holmes.dd836248e98c.mp3",
            "sha256": "dd836248e98c1307fe89649e7a031f941c521be32eb041c0ffbee0af2b2ce3c2",
            "durationSeconds": 7.76,
            "durationMs": 7760,
            "sizeBytes": 188125,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 171,
            "authoredTextMatched": true
          }
        }
      ],
      "effects": [
        {
          "id": "footsteps",
          "startMs": 120,
          "gainDb": -15,
          "asset": {
            "url": "/audio/cinematic/foley/footsteps.ca32e499719b.mp3",
            "sha256": "ca32e499719bac55701d7a31527a2f5d12ae316470ec14906db638e25604dcac",
            "durationSeconds": 5,
            "durationMs": 5000,
            "sizeBytes": 121670,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        },
        {
          "id": "glass",
          "startMs": 18800,
          "gainDb": -7,
          "asset": {
            "url": "/audio/cinematic/foley/glass.52181865d14b.mp3",
            "sha256": "52181865d14b31ed6ec64f1d8252d651a0316a34fe00dcbaa1d30322086fd3f1",
            "durationSeconds": 2.48,
            "durationMs": 2480,
            "sizeBytes": 60857,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        }
      ],
      "forcedAlignment": {
        "provider": "ElevenLabs Forced Alignment",
        "loss": 0.03999,
        "wordsAligned": 89,
        "transcriptCharacters": 273,
        "firstWordStartSeconds": 1.779,
        "lastWordEndSeconds": 25.26,
        "monotonicWordTiming": true
      }
    },
    "archive": {
      "title": "Echoes in the index",
      "atmosphere": "Turning leaves · clockwork · remembered voices",
      "durationMs": 20200,
      "dialogueStem": {
        "url": "/audio/cinematic/scenes/archive-dialogue.f58eb48c4125.mp3",
        "sha256": "f58eb48c4125531e77e6a9af461f46ddafbf95528f0eeec374a8e25e0985379a",
        "durationSeconds": 20.2,
        "durationMs": 20200,
        "sizeBytes": 486548,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "dialogueStemLoudness": {
        "integratedLufs": -18.4,
        "truePeakDbfs": -3.8
      },
      "ambienceLoop": {
        "url": "/audio/cinematic/ambience/archive.104ba1d08864.mp3",
        "sha256": "104ba1d08864572a67e1d206ad65df00cdf0bde61d713ef200219091122a745b",
        "durationSeconds": 30,
        "durationMs": 30000,
        "sizeBytes": 721650,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "master": {
        "url": "/audio/cinematic/scenes/archive.7e3452bc4700.mp3",
        "sha256": "7e3452bc4700bae943f6cb338b127ff72098745a061057b39c89edef05d329ac",
        "durationSeconds": 20.2,
        "durationMs": 20200,
        "sizeBytes": 486548,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "masterLoudness": {
        "integratedLufs": -19.2,
        "truePeakDbfs": -3.2
      },
      "lines": [
        {
          "index": 0,
          "speaker": "Dr. Watson",
          "text": "A clue may be an absence. I remember the dog at King’s Pyland.",
          "voiceRole": "watson",
          "startMs": 1550,
          "endMs": 7310,
          "stem": {
            "url": "/audio/cinematic/dialogue/archive/01-dr-watson.70f8d156c935.mp3",
            "sha256": "70f8d156c93556fca43ce44909fd14e41dc64fbb4bca8ea9ff1a31592d2707d6",
            "durationSeconds": 5.76,
            "durationMs": 5760,
            "sizeBytes": 139851,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 129,
            "authoredTextMatched": true
          }
        },
        {
          "index": 1,
          "speaker": "Inspector Gregory",
          "text": "The dog did nothing in the night-time.",
          "voiceRole": "gregory",
          "startMs": 7960,
          "endMs": 10280,
          "stem": {
            "url": "/audio/cinematic/dialogue/archive/02-inspector-gregory.881b168025dc.mp3",
            "sha256": "881b168025dc6cb733c0dc84a65ddee3c40ee7d13a542597bca93831e444b4d8",
            "durationSeconds": 2.32,
            "durationMs": 2320,
            "sizeBytes": 57095,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 114,
            "authoredTextMatched": true
          }
        },
        {
          "index": 2,
          "speaker": "Sherlock Holmes",
          "text": "That was the curious incident.",
          "voiceRole": "holmes",
          "startMs": 10880,
          "endMs": 13120,
          "stem": {
            "url": "/audio/cinematic/dialogue/archive/03-sherlock-holmes.122800f71035.mp3",
            "sha256": "122800f7103538c86b9d1d21ff06219ac52242d1706d8f131ac3344a3ccda2a5",
            "durationSeconds": 2.24,
            "durationMs": 2240,
            "sizeBytes": 55214,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 111,
            "authoredTextMatched": true
          }
        },
        {
          "index": 3,
          "speaker": "Irene Adler",
          "text": "I love and am loved by a better man than he.",
          "voiceRole": "irene",
          "startMs": 13880,
          "endMs": 17800,
          "stem": {
            "url": "/audio/cinematic/dialogue/archive/04-irene-adler.9f0e636604c7.mp3",
            "sha256": "9f0e636604c7644bdb77feed47434c4594bd269a423c431fec877ca70184d0e0",
            "durationSeconds": 3.92,
            "durationMs": 3920,
            "sizeBytes": 95965,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 110,
            "authoredTextMatched": true
          }
        }
      ],
      "effects": [
        {
          "id": "paper",
          "startMs": 180,
          "gainDb": -7,
          "asset": {
            "url": "/audio/cinematic/foley/paper.a6d2ec3ba2b2.mp3",
            "sha256": "a6d2ec3ba2b28e06ddc0b441c3ef4a23fcb1e54dae213c73d1011fda81ffb3f0",
            "durationSeconds": 4.48,
            "durationMs": 4480,
            "sizeBytes": 109131,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        },
        {
          "id": "clock",
          "startMs": 10580,
          "gainDb": -15,
          "asset": {
            "url": "/audio/cinematic/foley/clock.58750486cc5a.mp3",
            "sha256": "58750486cc5a77f1d828c624ddac3ac1f1d0be6a283f0c6a4b5620edbbf8e4a7",
            "durationSeconds": 5,
            "durationMs": 5000,
            "sizeBytes": 121670,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        }
      ],
      "forcedAlignment": {
        "provider": "ElevenLabs Forced Alignment",
        "loss": 0.097674,
        "wordsAligned": 71,
        "transcriptCharacters": 177,
        "firstWordStartSeconds": 1.74,
        "lastWordEndSeconds": 17.859,
        "monotonicWordTiming": true
      }
    },
    "conclusion": {
      "title": "Dawn at Baker Street",
      "atmosphere": "Last rain · settling fire · first morning bell",
      "durationMs": 22650,
      "dialogueStem": {
        "url": "/audio/cinematic/scenes/conclusion-dialogue.5bc1d605c815.mp3",
        "sha256": "5bc1d605c815b2271c7ccda5dd6b4c70fbc3a5150c74bf660f8d238125a627d3",
        "durationSeconds": 22.65,
        "durationMs": 22650,
        "sizeBytes": 545480,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "dialogueStemLoudness": {
        "integratedLufs": -16.7,
        "truePeakDbfs": -2.2
      },
      "ambienceLoop": {
        "url": "/audio/cinematic/ambience/conclusion.604735c8a5a5.mp3",
        "sha256": "604735c8a5a5305e197508a1af737351addb27df94a857304898f57ef857e6f7",
        "durationSeconds": 30,
        "durationMs": 30000,
        "sizeBytes": 721650,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "master": {
        "url": "/audio/cinematic/scenes/conclusion.5a74cf0df2fe.mp3",
        "sha256": "5a74cf0df2fe1aedc8f6dfd5d6aaff22ea5fc9fb500f43dbe51770a229870710",
        "durationSeconds": 22.65,
        "durationMs": 22650,
        "sizeBytes": 545480,
        "codec": "mp3",
        "sampleRateHz": 44100,
        "channels": 2,
        "bitRate": 192000
      },
      "masterLoudness": {
        "integratedLufs": -18.2,
        "truePeakDbfs": -2.2
      },
      "lines": [
        {
          "index": 0,
          "speaker": "Inspector Lestrade",
          "text": "This case will make a stir, sir.",
          "voiceRole": "lestrade",
          "startMs": 1550,
          "endMs": 3630,
          "stem": {
            "url": "/audio/cinematic/dialogue/conclusion/01-inspector-lestrade.e331cdf8965b.mp3",
            "sha256": "e331cdf8965b2ab23042579e8da9bdbcb0cf496374b1bf1b7dda539d08a5c293",
            "durationSeconds": 2.08,
            "durationMs": 2080,
            "sizeBytes": 51453,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 118,
            "authoredTextMatched": true
          }
        },
        {
          "index": 1,
          "speaker": "Sherlock Holmes",
          "text": "The Yard is generous. The clay was less so.",
          "voiceRole": "holmes",
          "startMs": 4280,
          "endMs": 7480,
          "stem": {
            "url": "/audio/cinematic/dialogue/conclusion/02-sherlock-holmes.eb928506283a.mp3",
            "sha256": "eb928506283a36697639d159ee37b4690af8737180036952ebd730a1bd94bd82",
            "durationSeconds": 3.2,
            "durationMs": 3200,
            "sizeBytes": 78411,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 118,
            "authoredTextMatched": true
          }
        },
        {
          "index": 2,
          "speaker": "Dr. Watson",
          "text": "So the room was never breached. It was composed.",
          "voiceRole": "watson",
          "startMs": 8130,
          "endMs": 11810,
          "stem": {
            "url": "/audio/cinematic/dialogue/conclusion/03-dr-watson.fb1266f8210f.mp3",
            "sha256": "fb1266f8210fd5bae4990e2fce0d4a2e7f08ca8fa3da165375943c9026dd96fb",
            "durationSeconds": 3.68,
            "durationMs": 3680,
            "sizeBytes": 89696,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 122,
            "authoredTextMatched": true
          }
        },
        {
          "index": 3,
          "speaker": "Sherlock Holmes",
          "text": "Precisely. Four clues, one journey, and an alibi built to collapse at dawn.",
          "voiceRole": "holmes",
          "startMs": 12590,
          "endMs": 19950,
          "stem": {
            "url": "/audio/cinematic/dialogue/conclusion/04-sherlock-holmes.011d4e558666.mp3",
            "sha256": "011d4e55866679b36bd27dfb639c2ef1464102e8c15513551cddf1d8ff49184c",
            "durationSeconds": 7.36,
            "durationMs": 7360,
            "sizeBytes": 178094,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          },
          "alignment": {
            "api": "ElevenLabs TTS with timestamps",
            "characterCount": 162,
            "authoredTextMatched": true
          }
        }
      ],
      "effects": [
        {
          "id": "fireSettle",
          "startMs": 250,
          "gainDb": -10,
          "asset": {
            "url": "/audio/cinematic/foley/firesettle.a411bc110ca4.mp3",
            "sha256": "a411bc110ca429e37555c510724a2867927f2f2a5e5afbc8ab468f8b05c57b8b",
            "durationSeconds": 4,
            "durationMs": 4000,
            "sizeBytes": 97846,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        },
        {
          "id": "morningBell",
          "startMs": 13790,
          "gainDb": -15,
          "asset": {
            "url": "/audio/cinematic/foley/morningbell.bd9730ce838b.mp3",
            "sha256": "bd9730ce838b619bbcc249cf5498cef631f0dbd946af34118cf95f615bfff23e",
            "durationSeconds": 5.48,
            "durationMs": 5480,
            "sizeBytes": 132955,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        },
        {
          "id": "reveal",
          "startMs": 13040,
          "gainDb": -16,
          "asset": {
            "url": "/audio/cinematic/foley/reveal.d51867fd0bb2.mp3",
            "sha256": "d51867fd0bb20521caf54a25fc23348f7f24cc3ed532bbb3caf01f7020064577",
            "durationSeconds": 4.48,
            "durationMs": 4480,
            "sizeBytes": 109131,
            "codec": "mp3",
            "sampleRateHz": 44100,
            "channels": 2,
            "bitRate": 192000
          }
        }
      ],
      "forcedAlignment": {
        "provider": "ElevenLabs Forced Alignment",
        "loss": 0.065221,
        "wordsAligned": 75,
        "transcriptCharacters": 201,
        "firstWordStartSeconds": 1.779,
        "lastWordEndSeconds": 19.879,
        "monotonicWordTiming": true
      }
    }
  }
} as const);

export type CinematicAudioManifest = typeof CINEMATIC_AUDIO_MANIFEST;
export type CinematicAudioManifestSceneId = keyof typeof CINEMATIC_AUDIO_MANIFEST.scenes;
