# How it moves, step by step

Every animation and behaviour found on the page, as recipes: what starts it, which element, which property from what to what, for how long, on which curve, in what order. Times are from the moment the trigger happens. Build them one at a time and check each against its film (frames captioned with their time, or with the scroll position).

Measured at 1440 px on www.udemy.com. Values in `code` are exactly as the browser reported them.

## The page's motion language

- **Curves:** `linear` (35×), `cubic-bezier(0.2, 0, 0.38, 0.9)` (2×), `ease-in-out` (2×).
- **Durations:** 100 ms, 400 ms, 1200 ms.

## Moving scenes (filmed)

### 1. Loop: _shine_1glav_21

- **Film:** `reference/motion/films/01-loop-div.jpg` (captions are ms).
- **Element:** `div._banner-content_1tl9y_39 > div._image-section_1tl9y_176:nth-of-type(2) > div._image-skeleton_1tl9y_191 > div._skeleton_1glav_16._wrapper_1kjx5_16 > div._shine_1glav_21:nth-of-type(2)` in section `05-div`.
- **In the code:** `reference/scripts/14-c94224a47f0c5370.js` line 55 (`_skeleton_1glav_16`); `reference/scripts/14-c94224a47f0c5370.js` line 55 (`_shine_1glav_21`).

### 2. Loop: _shine_1glav_21

- **Film:** `reference/motion/films/02-loop-div.jpg` (captions are ms).
- **Element:** `div._content-section_1tl9y_56:nth-of-type(1) > div._text-content_1tl9y_70:nth-of-type(1) > div > div._skeleton_1glav_16.ud-text-skeleton > div._shine_1glav_21` in section `05-div`.
- **In the code:** `reference/scripts/14-c94224a47f0c5370.js` line 55 (`_skeleton_1glav_16`); `reference/scripts/14-c94224a47f0c5370.js` line 55 (`_shine_1glav_21`).

### 3. Loop: _shine_1glav_21

- **Film:** `reference/motion/films/03-loop-section.jpg` (captions are ms).
- **Element:** `section:nth-of-type(6) > div > div > div._gwg-carousel_1iqdf_30._gwg-carousel--loading_1iqdf_60 > div:nth-of-type(1)` in section `11-section`.

### 4. Loop: _shine_1glav_21

- **Film:** `reference/motion/films/04-loop-section.jpg` (captions are ms).
- **Element:** `div > div > div._gwg-carousel_1iqdf_30._gwg-carousel--loading_1iqdf_60 > div._skeleton-course-row_1iqdf_147:nth-of-type(2) > div._skeleton-course-card_1iqdf_152:nth-of-type(1)` in section `11-section`.

## CSS animations (rules and @keyframes in styles.css)

- `header._container_zg0f7_57 > div._nav_zg0f7_262:nth-of-type(3) > div._popper_1fmeq_26 > div#_R_24dqivbH1_ > div._animation-wrapper_1fmeq_45`: `_pop-in_1fmeq_1` 0.1s `cubic-bezier(0.2, 0, 0.38, 0.9)`.
- `header._container_zg0f7_57 > div._udemy-business_zg0f7_122._desktop-only_zg0f7_31:nth-of-type(6) > div._popper_1fmeq_26 > div#_R_44dqivbH1_ > div._animation-wrapper_1fmeq_45`: `_pop-in_1fmeq_1` 0.1s `cubic-bezier(0.2, 0, 0.38, 0.9)`.
- `div._content-section_1tl9y_56:nth-of-type(1) > div._text-content_1tl9y_70:nth-of-type(1) > div > div._skeleton_1glav_16.ud-text-skeleton > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `div._content-section_1tl9y_56:nth-of-type(1) > ul._features-grid_1tl9y_97.ud-unstyled-list > li._feature-item_1tl9y_112:nth-of-type(1) > div._skeleton_1glav_16:nth-of-type(1) > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `ul._features-grid_1tl9y_97.ud-unstyled-list > li._feature-item_1tl9y_112:nth-of-type(1) > div:nth-of-type(2) > div._skeleton_1glav_16 > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `div._content-section_1tl9y_56:nth-of-type(1) > ul._features-grid_1tl9y_97.ud-unstyled-list > li._feature-item_1tl9y_112:nth-of-type(2) > div._skeleton_1glav_16:nth-of-type(1) > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `ul._features-grid_1tl9y_97.ud-unstyled-list > li._feature-item_1tl9y_112:nth-of-type(2) > div:nth-of-type(2) > div._skeleton_1glav_16 > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `div._content-section_1tl9y_56:nth-of-type(1) > ul._features-grid_1tl9y_97.ud-unstyled-list > li._feature-item_1tl9y_112:nth-of-type(3) > div._skeleton_1glav_16:nth-of-type(1) > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `ul._features-grid_1tl9y_97.ud-unstyled-list > li._feature-item_1tl9y_112:nth-of-type(3) > div:nth-of-type(2) > div._skeleton_1glav_16 > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `div._content-section_1tl9y_56:nth-of-type(1) > ul._features-grid_1tl9y_97.ud-unstyled-list > li._feature-item_1tl9y_112:nth-of-type(4) > div._skeleton_1glav_16:nth-of-type(1) > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `ul._features-grid_1tl9y_97.ud-unstyled-list > li._feature-item_1tl9y_112:nth-of-type(4) > div:nth-of-type(2) > div._skeleton_1glav_16 > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.
- `div._banner-content_1tl9y_39 > div._content-section_1tl9y_56:nth-of-type(1) > div._cta-section_1tl9y_143:nth-of-type(2) > div._skeleton_1glav_16:nth-of-type(1) > div._shine_1glav_21`: `_shine_1glav_21` 1.2s `linear` infinite, delay 1.2s.

## The page's own code

The scripts the page ran are in `reference/scripts/` (17 files), so you can read exactly how each effect is made. Don't paste them in whole: rebuild each effect in the project's own code, following the recipe and the source together.
