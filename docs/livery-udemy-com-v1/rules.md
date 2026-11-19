# udemy.com: design rules

A dark interface on a near-black neutral background where a dark violet accent marks the next step. Type is Udemy Sans, corners are 8px, and depth comes from soft neutral shadows.

## Principles

### Soft, neutral depth

Lift raised elements with the measured shadow (oklch(0.6295 0.0204 306.5 / 0.08) 0px 2px 8px 0px, oklch(0.6295 0.0204 306.5 /…).

_Why:_ Shadows appear on about 3% of elements; they mark what floats above the page and are never tinted.

### Even, compact hierarchy

Keep type sizes close together, anchored on 16px body text.

_Why:_ The largest measured size is only 2.0× the body size; hierarchy comes from weight and spacing instead.

### A steady rhythm

Space everything on the 4px grid: 4, 8, 12, 16, 24, 32px.

_Why:_ 98% of measured spacing values fall on this grid, which is what makes the layout feel ordered.

### Consistent corners

Use 8px corners as the default radius.

_Why:_ It is the most common measured radius; one radius family is what makes separate components feel like one product.

## Never

- **Never tint shadows with colour.** Every measured shadow is neutral; a coloured glow would read as a different product.
- **Never introduce a second accent colour.** Only one saturated colour (#6d28d2) carries weight in the measured palette.
- **Never animate longer than 300ms.** Every measured transition finishes within 300ms; slower motion would feel heavy here.
- **Never set button labels in all capitals.** No measured button uses uppercase text.
- **Never mix in a second display typeface.** Headings and body share Udemy Sans; a second family would split the voice.
- **Never use spacing off the 4px grid.** 98% of measured spacing sits on it.

## Colour

- Dark theme: near-black neutral background (#00000000).
- Body text #ffffff on the background reads at 21.0:1; secondary text uses #71758e.
- Accent #6d28d2 (dark violet) with #ffffff text on top of it.

## Typography

- Udemy Sans throughout.
- Scale: h1 32px, h2 27.5px, h3 24px, h4 21.5px, h5 20px, h6 18px, size-17.5 17.5px.
- Weights in use: 300, 400, 500, 700.

## Shape and depth

- Radii: 4px (25%), 8px (52%), 16px (12%), 24px (3%), pill (8%).
- Borders: 1px in #3d4055.
- Shadows: oklch(0.6295 0.0204 306.5 / 0.08) 0px 2px 8px 0px, oklch(0.6295 0.020….
