# Translucent story surfaces — v1.3 design contract

Status: implementation and release verification in progress

## Intent

The fixed cinematic tableaux should remain part of the reading experience, not
disappear behind opaque interface blocks. Version 1.3 replaces the heaviest
ink backplates with restrained translucent surfaces while keeping every text
glyph, control, border, and focus indicator fully opaque.

## Surface hierarchy

| Surface | Desktop treatment | Safety boundary |
| --- | --- | --- |
| Chapter copy | Directional ink glass, 68% at the reading edge and progressively clearer away from text | Full-opacity type, brighter muted copy, subtle text shadow |
| Telegram and marginalia | 54–72% ink | The physical telegram paper remains opaque |
| Evidence, books, and deduction | 72–80% ink glass | Stronger than narrative copy because controls and small labels need stable contrast |
| Field notes and footer | 72–88% sectional veil | Keeps the final scene visible without competing with long-form copy |
| Commission section | Layered 72–86% Prussian/ember veil | Preserves the existing branded colour transition |
| Scene rail | 72% ink with restrained blur | Navigation labels and focus states remain unchanged |

## Responsive and accessibility contract

- At 860px and below, the cinematic stage remains replaced by five inline 4:5
  images. Copy stays below each image with a denser 84–90% background and no
  blur; it does not overlap or obscure the artwork.
- Reduced-motion mode raises the glass density, removes backdrop blur, stops
  animated transitions, and keeps instant scene navigation.
- Increased-contrast mode raises narrative and interactive surfaces to 92–98%
  and removes backdrop blur.
- The treatment never applies `opacity` to a copy container or its text.
- Existing keyboard, touch, caption, mixer, form, and responsive-safe-area
  behaviour remains unchanged.

## Verification contract

- Source regression asserts the semantic glass tokens, no faded copy opacity,
  mobile fallback, reduced-motion fallback, and increased-contrast fallback.
- Browser regression asserts all five desktop copy panels use translucent
  gradients with fully opaque content and bounded widths.
- Mobile browser regression asserts all five inline images decode, every copy
  panel follows its image without overlap, and text opacity remains one.
- The full release gate and production verification remain required before the
  v1.3.0 tag is published.
