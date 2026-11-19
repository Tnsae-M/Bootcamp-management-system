# Walkthrough: how the page is built and how it moves

One part per top-level section, top to bottom, as measured at 1440 px. Sizes are CSS pixels; colours are as computed. Every file named here is in this folder. How things move and behave (scrolling, page changes, the menu, hovers), step by step, is in `reference/motion/README.md`.

## 01 · div

- **Box:** 1440×48 px, starting 0 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** flex row of 2, gap normal, normal/normal.
- **Type:** Udemy Sans 300 16px/25.6px · Udemy Sans 700 16px/25.6px (family weight size/line-height, most text first).
- **Inside:** 1 button, 1 drawing.
- **Look:** `reference/sections/01-div.jpg` and its anatomy `reference/sections/01-div.anatomy.jpg`.
- **Markup:** `reference/sections/01-div.html`.
- **Drawings:** `reference/assets/svg/001-icon-close.svg` (icon, 20×20).
- **Motion:**
  - scripts add `._content-text_1e0he_102`, `.undefined` to 3 elements as the page scrolls (first at scrollY 0)

## 02 · header

- **Box:** 1440×72 px, starting 48 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** grid, 12 columns (91px 79.4688px 86.9062px 611.516px 128.25px 127.281px 0px 40px 80px 84px 50px 0px), gap 1.248px.
- **Type:** Udemy Sans 300 14px/22.4px · Udemy Sans 500 18px/21.6px · Udemy Sans 400 14px/16.8px · Udemy Sans 700 14px/16.8px · Udemy Sans 300 16px/25.6px (family weight size/line-height, most text first).
- **Inside:** 18 buttons, 15 links, 1 picture, 8 drawings, 1 field.
- **Look:** `reference/sections/02-header.jpg` and its anatomy `reference/sections/02-header.anatomy.jpg`.
- **Markup:** `reference/sections/02-header.html`.
- **Drawings:** `reference/assets/svg/002-icon-header.svg` (icon, 24×24), `reference/assets/svg/003-icon-header.svg` (icon, 20×20), `reference/assets/svg/004-icon-header.svg` (icon, 20×20).
- **Pictures:** `reference/assets/images/010-logo-udemy.svg`.
- **Motion:**
  - CSS `_pop-in_1fmeq_1` 0.1s cubic-bezier(0.2, 0, 0.38, 0.9) ×1 on 2 elements (e.g. `header._container_zg0f7_57 > div._nav_zg0f7_262:nth-of-type(3) > div._popper_1fmeq_26 > div#_R_24dqivbH1_ > div._animation-wrapper_1fmeq_45`)
- **Control states:** `reference/components/01-button.jpg` (button button#_R_24dqivb_: rest, hover, focus).
- **Control states:** `reference/components/02-nav-link.jpg` (nav-link a.ud-btn.ud-btn-medium: rest, hover, focus).
- **Control states:** `reference/components/03-nav-link.jpg` (nav-link a#_R_44dqivb_: rest, hover, focus).
- **Control states:** `reference/components/04-button.jpg` (button a.ud-btn.ud-btn-medium: rest, hover, focus).

## 03 · div

- **Box:** 1440×386 px, starting 120 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** stacked blocks.
- **Type:** Udemy Sans 300 16px/25.6px · Udemy Sans 700 16px/19.2px · Udemy Sans 500 32px/35.1999px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 1 paragraph, 1 button, 1 link, 2 pictures.
- **Look:** `reference/sections/03-div.jpg` and its anatomy `reference/sections/03-div.anatomy.jpg`.
- **Markup:** `reference/sections/03-div.html`.
- **Pictures:** `reference/assets/images/011-career-academies-banner.webp` (1090×400).

## 04 · section

- **Box:** 1440×536 px, starting 554 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** grid, 12 columns (93px 93px 93px 93px 93px 93px 93px 93px 93px 93px 93px 93px), gap 16px.
- **Type:** Udemy Sans 400 18px/27px · Udemy Sans 300 16px/25.6px · Udemy Sans 500 32px/38.3999px · Udemy Sans 400 18px/28.8px · Udemy Sans 700 32px/38.3999px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 1 paragraph, 2 buttons, 9 links, 9 pictures, 2 drawings.
- **Look:** `reference/sections/04-section.jpg` and its anatomy `reference/sections/04-section.anatomy.jpg`.
- **Markup:** `reference/sections/04-section.html`.
- **Drawings:** `reference/assets/svg/005-icon-previous.svg` (icon, 16×16), `reference/assets/svg/006-icon-next.svg` (icon, 16×16).
- **Pictures:** `reference/assets/images/012-generative-ai.webp` (1024×1024), `reference/assets/images/013-certifications.webp` (1024×1024), `reference/assets/images/014-data-science.webp` (1024×1024), `reference/assets/images/015-chat-gpt.webp` (1024×1024), `reference/assets/images/016-prompt-engineering.webp` (1024×1024), `reference/assets/images/017-microsoft-excel.webp` (1024×1024), `reference/assets/images/018-llms.webp` (1024×1024), `reference/assets/images/019-machine-learning.webp` (1024×1024), `reference/assets/images/020-ai-agents.webp` (1024×1024).
- **Control states:** `reference/components/05-card.jpg` (card div:nth-of-type(2): rest, hover, focus).

## 05 · div

- **Box:** 1440×609 px, starting 1138 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** flex row of 2, gap 24px, space-between/center.
- **Inside:** 2 paragraphs, 1 drawing.
- **Look:** `reference/sections/05-div.jpg` and its anatomy `reference/sections/05-div.anatomy.jpg`.
- **Markup:** `reference/sections/05-div.html`.
- **Drawings:** `reference/assets/svg/007-decoration-div.svg` (decoration, 112×112).
- **Motion:**
  - CSS `_shine_1glav_21` 1.2s linear infinite on 12 elements (e.g. `div._content-section_1tl9y_56:nth-of-type(1) > div._text-content_1tl9y_70:nth-of-type(1) > div > div._skeleton_1glav_16.ud-text-skeleton > div._shine_1glav_21`)
- **Film:** `reference/motion/films/01-loop-div.jpg` (Loop: _shine_1glav_21; it is `div._banner-content_1tl9y_39 > div._image-section_1tl9y_176:nth-of-type(2) > div._image-skeleton_1tl9y_191 > div._skeleton_1glav_16._wrapper_1kjx5_16 > div._shine_1glav_21:nth-of-type(2)` in the markup; frames captioned with ms).
- **Film:** `reference/motion/films/02-loop-div.jpg` (Loop: _shine_1glav_21; it is `div._content-section_1tl9y_56:nth-of-type(1) > div._text-content_1tl9y_70:nth-of-type(1) > div > div._skeleton_1glav_16.ud-text-skeleton > div._shine_1glav_21` in the markup; frames captioned with ms).

## 06 · section

- **Box:** 1440×291 px, starting 1795 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** flex row of 6, gap 16px, normal/normal.
- **Type:** Udemy Sans 300 18px/27px · Udemy Sans 400 16px/19.2px · Udemy Sans 700 14px/16.8px · Udemy Sans 500 32px/35.1999px · Udemy Sans 500 16px/19.2px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 1 paragraph, 6 buttons, 1 link, 1 drawing.
- **Look:** `reference/sections/06-section.jpg` and its anatomy `reference/sections/06-section.anatomy.jpg`.
- **Markup:** `reference/sections/06-section.html`.
- **Drawings:** `reference/assets/svg/008-icon-section.svg` (icon, 16×16, ×2).

## 07 · div

- **Box:** 1440×222 px, starting 2086 px from the top. Background oklch(0.9759 0.0029 264.54), text oklch(0.2974 0.0362 281.74).
- **Layout:** flex row of 2, gap normal, center/center.
- **Type:** Udemy Sans 400 18px/21.6px · Udemy Sans 700 16px/19.2px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 1 button, 1 link, 8 pictures, 1 drawing.
- **Look:** `reference/sections/07-div.jpg` and its anatomy `reference/sections/07-div.anatomy.jpg`.
- **Markup:** `reference/sections/07-div.html`.
- **Drawings:** `reference/assets/svg/009-icon-div.svg` (icon, 16×16, ×2).
- **Pictures:** `reference/assets/images/021-volkswagen-logo.svg`, `reference/assets/images/022-samsung-logo.svg`, `reference/assets/images/023-cisco-logo.svg`, `reference/assets/images/024-vimeo-logo-resized-2.svg`, `reference/assets/images/025-procter-gamble-logo.svg`, `reference/assets/images/026-hewlett-packard-enterprise-logo.svg`, `reference/assets/images/027-citi-logo.svg`, `reference/assets/images/028-ericsson-logo.svg`.

## 08 · testimonials

- **Box:** 1440×740 px, starting 2307 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** flex row of 4, gap normal, normal/normal.
- **Type:** Udemy Sans 300 18px/27px · Udemy Sans 400 12px/16.8px · Udemy Sans 300 14px/16.8px · Udemy Sans 500 24px/26.4px · Udemy Sans 400 18px/27px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 16 paragraphs, 1 button, 5 links, 4 pictures, 9 drawings.
- **Look:** `reference/sections/08-testimonials.jpg` and its anatomy `reference/sections/08-testimonials.anatomy.jpg`.
- **Markup:** `reference/sections/08-testimonials.html`.
- **Drawings:** `reference/assets/svg/010-icon-testimonials.svg` (icon, 48×48, ×4), `reference/assets/svg/011-icon-testimonials.svg` (icon, 16×16, ×4).
- **Pictures:** `reference/assets/images/029-cris-m.webp` (240×240), `reference/assets/images/030-alvin-lim.webp` (900×900), `reference/assets/images/031-william-a-wachlin.webp` (450×450), `reference/assets/images/032-ben-c.webp` (240×240).
- **Control states:** `reference/components/06-card.jpg` (card article._card_1p116_16._gray_1p116_69: rest, hover, focus).

## 09 · section

- **Box:** 1440×402 px, starting 3071 px from the top. Background oklch(0.2565 0.0265 278.04), text oklch(0.2974 0.0362 281.74).
- **Layout:** flex row of 2, gap 64px, normal/normal.
- **Type:** Udemy Sans 300 16px/25.6px · Udemy Sans 400 12px/16.8px · Udemy Sans 500 32px/35.1999px · Udemy Sans 700 16px/19.2px · Udemy Sans 500 18px/21.6px (family weight size/line-height, most text first).
- **Inside:** 4 headings, 4 paragraphs, 1 button, 4 links, 3 pictures, 1 drawing.
- **Look:** `reference/sections/09-section.jpg` and its anatomy `reference/sections/09-section.anatomy.jpg`.
- **Markup:** `reference/sections/09-section.html`.
- **Drawings:** `reference/assets/svg/012-icon-section.svg` (icon, 20×20).
- **Pictures:** `reference/assets/images/033-comptia-thumbnail.webp` (1000×562), `reference/assets/images/034-aws-thumbnail.webp` (1000×562), `reference/assets/images/035-pmi-thumbnail.webp` (1000×562).

## 10 · section

- **Box:** 1440×597 px, starting 3497 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** grid, 3 columns (414.656px 414.672px 414.656px), gap 24px.
- **Type:** Udemy Sans 400 12px/16.8px · Udemy Sans 300 12px/19.2px · Udemy Sans 300 18px/28.8px · Udemy Sans 400 12px/19.2px · Udemy Sans 500 18px/21.6px (family weight size/line-height, most text first).
- **Inside:** 4 headings, 1 button, 4 links, 3 pictures, 4 drawings.
- **Look:** `reference/sections/10-section.jpg` and its anatomy `reference/sections/10-section.anatomy.jpg`.
- **Markup:** `reference/sections/10-section.html`.
- **Drawings:** `reference/assets/svg/013-icon-section.svg` (icon, 14×14), `reference/assets/svg/014-icon-section.svg` (icon, 14×14), `reference/assets/svg/015-icon-section.svg` (icon, 14×14).
- **Pictures:** `reference/assets/images/036-career-card-cloud-engineer.webp` (776×437), `reference/assets/images/037-career-card-data-scientist.webp` (776×437), `reference/assets/images/038-career-card-digitalmarketer.webp` (776×437).

## 11 · section

- **Box:** 1440×507 px, starting 4093 px from the top. Background oklch(1 0 0), text oklch(0.2974 0.0362 281.74).
- **Layout:** grid, 2 columns (310.5px 907.5px), gap 24px.
- **Type:** Udemy Sans 500 32px/35.1999px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 5 paragraphs, 4 drawings.
- **Look:** `reference/sections/11-section.jpg` and its anatomy `reference/sections/11-section.anatomy.jpg`.
- **Markup:** `reference/sections/11-section.html`.
- **Drawings:** `reference/assets/svg/016-icon-section.svg` (icon, 64×64, ×4).
- **Motion:**
  - CSS `_shine_1glav_21` 1.2s linear infinite on 23 elements (e.g. `div > div._gwg-carousel_1iqdf_30._gwg-carousel--loading_1iqdf_60 > div:nth-of-type(1) > div._skeleton_1glav_16:nth-of-type(1) > div._shine_1glav_21`)
- **Film:** `reference/motion/films/03-loop-section.jpg` (Loop: _shine_1glav_21; it is `section:nth-of-type(6) > div > div > div._gwg-carousel_1iqdf_30._gwg-carousel--loading_1iqdf_60 > div:nth-of-type(1)` in the markup; frames captioned with ms).
- **Film:** `reference/motion/films/04-loop-section.jpg` (Loop: _shine_1glav_21; it is `div > div > div._gwg-carousel_1iqdf_30._gwg-carousel--loading_1iqdf_60 > div._skeleton-course-row_1iqdf_147:nth-of-type(2) > div._skeleton-course-card_1iqdf_152:nth-of-type(1)` in the markup; frames captioned with ms).
