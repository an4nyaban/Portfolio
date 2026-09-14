# Portfolio Project Context

## Status
- Homepage/hero section (index.html) — DONE, matches Figma
- About page (about.html) — DONE, matches Figma
- Placeful case study page (placeful.html) — IN PROGRESS, building section by section

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
Final/Reflection) already exist in placeful.html
- Content sections were deleted and are being rebuilt one at a time
- Nav highlighting / scroll-spy behavior is NOT implemented yet — deliberately deferred
until all content sections exist. Don't add it unless explicitly asked.
- Section boundaries and full nav/scroll-highlighting behavior: see chat for details
once each section is rebuilt
