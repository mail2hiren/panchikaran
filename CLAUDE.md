# Panchikaran — notes for Claude

Visual, multilingual (English, हिन्दी, ગુજરાતી, मराठी) mobile learning site for the Vedanta text Pañcīkaraṇa.
Owner: Hiren Bhatt. Repo: `mail2hiren/panchikaran` (public).

## Hosting
- GitHub Pages, deployed from branch `main`, folder `/` (root). No build step: every push to `main` is live in a minute or two.
- Live URL (GitHub Pages default, to confirm): https://mail2hiren.github.io/panchikaran/
- No database. Budget $0/month. If one is ever needed it goes in Supabase under mail2hiren@gmail.com — ask Hiren first (free plan: 2 active projects).

## How we work
1. Work on a branch, never directly on `main`.
2. Show Hiren what changed and wait for his "go" before merging.
3. Tag every release (`v1.2.3`) and add it to `CHANGELOG.md`.
4. Verify the live site before saying "done".

## Files
| File | Holds |
|---|---|
| `data.js` | All reading content: terms, tables, chapters (title, intro, remember, verse, story) in 4 languages |
| `narr.js` | Spoken narration, one entry per animation step, per chapter and per story |
| `scenes.js` | Seated figure + animated scenes for the original 11 chapters |
| `scenes2.js` | Scenes for the seeker, Sat-Chit-Ānanda, Om Tat Sat, and the 10 stories |
| `app.js` | Router, player (explanation / story tabs), tables, flashcards, quiz, glossary |
| `i18n.js` | Interface text, Devanagari → Gujarati script conversion |
| `audio/` | Recorded narration MP3s + `cues.json` (step timings). Keys without audio fall back to the device voice |
| `tools/make_audio.py` | Generates MP3s + cues for narration keys that have no audio yet (edge-tts, Indian male voices) |

## Content rules
- Every text is `[en, hi, gu, mr]`. Sanskrit terms are stored once in Devanagari; Gujarati script is generated.
- Hiren's book wins over the standard texts where they differ.
- Hiren wants it 80%+ visual, with examples and stories, voice narration, zoomable pictures.
- In SVG scenes, any `<g transform=…>` must carry `class="o0"` (otherwise the CSS transform-origin breaks its position), and animation classes go on an inner element, never on the one with the transform attribute.

## Open questions for Hiren
- Which edition/commentary his guru teaches from (deity table varies, e.g. buddhi → Brahmā or Bṛhaspati).
- Uparati definition: Tattvabodha (own duty) vs Vivekacūḍāmaṇi (mind not leaning outward). Both shown for now.
