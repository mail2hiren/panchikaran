# Panchikarana

A visual, mobile-first guide to Panchikarana: the five elements, the three gunas, the five-fold mixing, the gross and subtle bodies, the inner instrument, the five pranas, the three bodies, the five sheaths, the witness, and the return to the source through Om.

Languages: English, हिन्दी, ગુજરાતી, मराठी.

## How it is built

Plain HTML, CSS and JavaScript with no build step, so GitHub Pages serves it as is and every push is live within a minute or two.

| File | What it holds |
|---|---|
| `data.js` | All content: terms, tables, chapter text in four languages |
| `i18n.js` | Interface text in four languages, Devanagari → Gujarati script conversion |
| `app.js` | Router, interactive diagrams, flashcards, quiz, glossary |
| `style.css` | Layout, light and dark themes |
| `sw.js` | Network-first offline cache (always shows the latest deploy when online) |

## Correcting content

Everything a reader sees comes from `data.js`. Each text is an array in the order `[English, Hindi, Gujarati, Marathi]`. Sanskrit terms are written once in Devanagari; the Gujarati script is generated.

Content follows Shankara's Panchikaranam, Tattvabodha and Vedantasara. Where a particular book differs (for example the order within the 25-tattva table), edit `data.js` to match.

## Publishing

Settings → Pages → Deploy from a branch → `main` / root.
