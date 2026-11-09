# Panchikarana

A visual, mobile-first guide to Panchikarana: the qualifications of the seeker, the five elements, the three gunas, the five-fold mixing, the gross and subtle bodies, the inner instrument, the five pranas, the three bodies, the five sheaths, Sat-Chit-Ānanda, the witness, the return to the source through Om, and Om Tat Sat with the great sayings. Most chapters also have an animated, narrated story from the Upanishads.

Languages: English, हिन्दी, ગુજરાતી, मराठी.

## How it is built

Plain HTML, CSS and JavaScript with no build step, so GitHub Pages serves it as is and every push is live within a minute or two.

| File | What it holds |
|---|---|
| `data.js` | All content: terms, tables, chapter text in four languages |
| `i18n.js` | Interface text in four languages, Devanagari → Gujarati script conversion |
| `narr.js` | Spoken narration per animation step (chapters and stories) |
| `scenes.js`, `scenes2.js` | Animated scenes and stories |
| `app.js` | Router, player with explanation and story tabs, interactive diagrams, flashcards, quiz, glossary |
| `tools/make_audio.py` | Generates recorded narration for new text |
| `style.css` | Layout, light and dark themes |
| `sw.js` | Network-first offline cache (always shows the latest deploy when online) |

## Correcting content

Everything a reader sees comes from `data.js`. Each text is an array in the order `[English, Hindi, Gujarati, Marathi]`. Sanskrit terms are written once in Devanagari; the Gujarati script is generated.

Content follows Shankara's Panchikaranam, Tattvabodha and Vedantasara. Where a particular book differs (for example the order within the 25-tattva table), edit `data.js` to match.

## Publishing

Settings → Pages → Deploy from a branch → `main` / root.
