# Motion and Interactions

Quick, quiet transitions (250ms), with signature motion that carries the personality: float.

- Default to 250ms transitions (53% of measured ones).
- Ease with ease.
- Animate background-color, inline-size, transform, background-size; avoid animating layout.
- Respect prefers-reduced-motion.

## Signature motion

The animations that make this site feel like itself. Recreate the behaviour with your own elements and content; the keyframes are the measured reference.

### Float

Drifts gently up and down every 1.2s. It runs on its own, on blocks.

```css
@keyframes _shine_1glav_21 { 0% { transform: translate(-80px); } 40% { transform: translate(100%); } 100% { transform: translate(100%); } }
.shine1glav21 { animation: _shine_1glav_21 1200ms linear infinite; }
```

## Interactions

- **Hover** changes text colour (29% of hover rules), background colour (25% of hover rules), underline (21% of hover rules), opacity (18% of hover rules), border (7% of hover rules), background (7% of hover rules). Things rarely move on hover; they change colour.

## Measurements

- Durations: 250ms (53%), 150ms (41%), 300ms (6%)
- Easings: `ease`, `cubic-bezier(0.2, 0, 0.38, 0.9)`, `linear`, `cubic-bezier(0.2, 0, 1, 0.9)`
- Animated properties: background-color, inline-size, transform, background-size, all, box-shadow

Always respect `prefers-reduced-motion: reduce`.
