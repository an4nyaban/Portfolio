# Portfolio Project Context

## Status
- Homepage/hero section (index.html) — DONE, matches Figma
- About page (about.html) — DONE, matches Figma
- Placeful case study page (placeful.html) — all content sections built (Background
through Reflection), plus the shared site footer and a working sticky/scroll-spy
secondary nav. Treat as essentially complete; confirm with the user before adding
new sections.
- coming-soon.html — DONE. Reusable "in progress" placeholder page (see below).

## Working style
- Build ONE section/feature at a time, only what's explicitly asked for in the
current message — do not build ahead or add anything not requested.
- Always check the Figma MCP tool for the currently selected frame before styling
anything — match it precisely (layout, spacing, colors, text) rather than approximating.
- **The Figma frame is the source of truth, always, no exceptions.** Everything in the
Figma is exactly what the user wants — match it to the letter (layout, spacing, colors,
typography, copy). If an asset referenced in the frame isn't available in the repo,
STOP and ask the user for it — don't substitute a placeholder or guess.
- Read the creative brief before working on anything — it covers general site typography/
motifs/tone (accessible, not "creative" for its own sake). NOTE: the brief is not a single
PDF — it's `docs/Portfolio Creative Brief.zip`, containing `Letter - 1.pdf` through
`Letter - 4.pdf`. Unzip and read all four before starting design work.
- **Color palette exception for case studies:** the brief's color palette is a GENERAL
default (used for homepage/about/etc.), but each case study follows the color palette
of the actual product/company being showcased, as shown in that case study's Figma —
NOT the brief's palette. Always pull colors from the Figma frame for case study pages.
- Plain HTML, CSS, and JavaScript only — no frameworks.
- Use `filter: drop-shadow()` (not `box-shadow`) for any shadow behind images/stickers
with transparent backgrounds, so shadows follow the actual shape, not a rectangular box.

## Known project conventions
- Colors, fonts, motifs: see the creative brief (docs/Portfolio Creative Brief.zip)
- Sticker shadow values: "home page items left" = `drop-shadow(-4px 0px 3px rgba(0,0,0,0.67))`,
"home page right" = `drop-shadow(4px 0px 3px rgba(0,0,0,0.67))`
- Text sticker outline effect: use `-webkit-text-stroke` with `paint-order: stroke fill`
(not stacked text-shadow, which looks jagged)

## Placeful case study — current state
- Main site nav + secondary case-study nav (Background/Research/Wireframes/Testing/
Final/Reflection) exist in placeful.html, and all six content sections are built.
- Page background is white (`.cs-body { background: var(--white); }`), overriding the
sitewide cream `body` default — only `.site-nav` and the footer stay cream (each sets
its own `background: var(--cream)` explicitly).
- Shared "contact me!" footer (`.site-footer`, identical markup/CSS to index.html/
about.html) is included at the bottom, wrapped in `.cs-footer-band` (full-width cream
band) > `.cs-footer-anchor` (the fixed 1440×495 positioned box `.site-footer` expects,
since this page is fluid-width, unlike index/about's fixed 1440 canvas).
- Secondary case-study nav (`#cs-subnav-wrap`) is `position: sticky; top: 0`, and floats
as a standalone pill: the wrap itself has no background/pointer-events (so page content
stays visible + clickable at the sides), and only the pill (`#cs-subnav`, opaque white,
keeps its border-radius) sits over content. The main `.site-nav` above it is NOT sticky —
it scrolls away normally.
- Scroll-spy is implemented via IntersectionObserver (script at the end of placeful.html):
  - Clicking a subnav button smooth-scrolls to that section, offset by the sticky nav's
  height.
  - The "active" highlight uses a thin detection band just below the sticky nav
  (`rootMargin: -navHeight px top, -90% bottom`) so a section only activates once it
  actually reaches the nav — not while it's still well below on screen.
  - Research and Reflection are special-cased: they light up at specific inner headings
  rather than their section boundary — `#research-trigger` ("Initial Research" heading,
  which is physically inside `#background`) and `#reflection-trigger` ("Key Takeaways"
  heading, physically inside `#final`). See `spyOverrides` in the script. Clicking those
  buttons still scrolls to the real `#research`/`#reflection` section starts; only the
  highlight timing is overridden. If new sections are added, don't assume nav-id ==
  scroll-spy target without checking `spyOverrides`.

## coming-soon.html — reusable placeholder page
- Single template for any unfinished project, driven by a `?project=Name` query param
(read client-side via `URLSearchParams`; falls back to "This project" if omitted).
Sets both the visible heading and `document.title`.
- Uses the general creative-brief design tokens (not a case-study palette) — Tillana
display font with the site's white-stroke "sticker text" treatment, cream page
background, two small motif stickers (tape + gems), and the same "~view my other
projects!" link/style used at the bottom of placeful.html.
- Keeps the plain `.site-nav` header (same as case-study pages) so users can navigate
away.
- Currently linked from: the Finergy and GT Buzzwalk project cards on index.html
(`coming-soon.html?project=Finergy` / `?project=GT%20Buzzwalk`), and the "collage" nav
link sitewide (index.html, about.html, placeful.html all point to
`coming-soon.html?project=Collage`).
- If Finergy, GT Buzzwalk, or Collage get real pages later, remove their link(s) to
coming-soon.html and point them at the real page instead.
