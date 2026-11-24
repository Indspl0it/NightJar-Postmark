# NightJar website

The documentation website for NightJar, built with [Astro](https://astro.build/) and
[Starlight](https://starlight.astro.build/). GitHub Pages publishes it at https://indspl0it.github.io/NightJar-Postmark/.

## Requirements

- Node.js 22 or newer
- [D2](https://d2lang.com/) 0.9.0 on `PATH`, for the diagrams

## Commands

Run these commands in this folder:

| Command | Action |
|---|---|
| `npm ci` | Installs the dependencies |
| `npm run dev` | Starts a local server at `http://localhost:4321/NightJar-Postmark/` |
| `npm run build` | Builds the site to `dist/`. The build stops when a page has a broken internal link. |
| `npm run preview` | Serves the built site |

## Content

- Pages: `src/content/docs/`. The sidebar is in `astro.config.mjs`.
- Diagrams: D2 code blocks in the pages. The build makes an SVG file from each block.
- Screenshots: `src/assets/screens/`. To make them again, see `scripts/copy_screenshots.py` and the
  [building](https://indspl0it.github.io/NightJar-Postmark/dev/building/#screenshots) page.

All text follows the writing rules on the
[contributing](https://indspl0it.github.io/NightJar-Postmark/dev/contributing/#writing-rules) page.
