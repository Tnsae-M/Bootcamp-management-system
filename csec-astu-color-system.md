# CSEC ASTU Bootcamp Management System — Color & Design Token Specification

**Purpose of this document:** This file defines the target color system for refining the existing UI (v1, already built). Use it as the source of truth when auditing current screens, proposing color/token replacements, and generating updated components. The goal is consistency, accessibility, and brand alignment — not a visual overhaul of layout or structure.

---

## 1. Project Context

- **Project:** Bootcamp Management System
- **Organization:** CSEC ASTU (Computer Science & Engineering Club, Adama Science and Technology University) — Development Division
- **Users:** Students (ages 19–24) in roles: Admin, Instructor, Student
- **Brand identity source:** Deep navy-indigo background with cyan/violet/green code-editor accent energy (from group's primary Telegram/brand asset). White wordmark logo "CSEC ASTU" is the official mark and works on dark or light surfaces.
- **Desired feel:** Calm, focused, technical-but-not-cold, minimal but premium. Avoid anything bright/neon (pink, hot red, pure yellow) — these read as "alarming" rather than "calm."
- **Theme strategy:** Dark mode is the default and primary target. Light mode is planned for a later phase — tokens below include light-mode equivalents so the system is forward-compatible, but dark mode should be implemented and audited first.
- **Stack assumptions:** React, Tailwind CSS, ShadCN UI, CSS custom properties (design tokens) for theming.
- **Inspiration references:** Canvas LMS, Google Classroom (structure: calm neutral chrome, color reserved strictly for meaning/status — not decoration).

---

## 2. Design Principles (apply during refinement)

1. **Color encodes meaning, not decoration.** Outside of the brand accent on primary actions/active states, color should only appear to communicate status (success/warning/error/info/etc.). If an existing screen uses color purely decoratively, flag it for simplification.
2. **One cool hue family dominates.** Indigo (primary), cyan (secondary), violet (accent) are all cool and adjacent — this is intentional for the "calm" requirement. Warm colors (amber, red, coral) should appear ONLY as semantic state indicators, never as structural/branding elements.
3. **No pure black, no pure white.** Backgrounds use near-black with a blue undertone (#0D0E16, not #000000). Text uses off-white (#ECEDF3, not #FFFFFF) to reduce contrast harshness during long sessions.
4. **Semantic colors are desaturated, not neon.** All success/warning/error/info colors are muted ~15-20% from pure saturation. If the current build uses bright red (#FF0000-style) or pure yellow, flag for replacement.
5. **Badges/status pills use a 3-part formula:** background fill (very low opacity tint) + 1px border (mid tint) + text (bright semantic color from same family). Never plain colored text on the default surface, and never solid bright fill with white text (too loud for a calm system).
6. **Sentence case everywhere**, including badges and labels — no ALL CAPS (reads as shouting/urgent).

---

## 3. Core Color Tokens — Dark Mode (Default/Primary Target)

### 3.1 Brand Core

| Token name | Hex | Usage |
|---|---|---|
| `--color-primary` | `#5B6EF5` | Primary buttons, active nav items, links, focus rings, primary chart series |
| `--color-primary-hover` | `#4C5EE6` | Hover/active state for primary elements |
| `--color-secondary` | `#38BDF8` | Secondary buttons, secondary chart series, info accents |
| `--color-accent` | `#A78BFA` | Sparingly used: premium/featured highlights, "Graduated" status, special callouts |

### 3.2 Backgrounds & Surfaces

| Token name | Hex | Usage |
|---|---|---|
| `--color-bg-app` | `#0D0E16` | Root app background |
| `--color-bg-sidebar` | `#12141F` | Sidebar, top navbar |
| `--color-bg-surface` | `#181B29` | Cards, table containers, panels |
| `--color-bg-elevated` | `#20232F` | Modals, dropdowns, popovers, tooltips |
| `--color-bg-hover` | `#242837` | Hover state for cards/list items/table rows |

### 3.3 Borders

| Token name | Hex | Usage |
|---|---|---|
| `--color-border-subtle` | `#262A3A` | Default card/table/divider borders |
| `--color-border-default` | `#323748` | Input borders, stronger separators |
| `--color-border-focus` | `#5B6EF5` | Focus ring/border on inputs (= primary) |

### 3.4 Text Hierarchy

| Token name | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#ECEDF3` | Headings, primary body text, table values |
| `--color-text-secondary` | `#A3A8BD` | Metadata, labels, descriptions |
| `--color-text-muted` | `#6E7387` | Placeholder text, timestamps, chart axis labels |
| `--color-text-disabled` | `#4B4F61` | Disabled inputs/buttons text |

### 3.5 Semantic States

Each semantic color has three parts: **text/icon color** (bright), **background fill** (low-opacity tint, for badges/toasts), **border** (mid tint).

| Semantic | Text/Icon | Background fill | Border |
|---|---|---|---|
| Success | `#4ADE80` | `#16291E` | `#2B4A38` |
| Warning | `#FBBF24` | `#332710` | `#5A4519` |
| Error / Danger | `#F87171` | `#2E1819` | `#54292B` |
| Info | `#60A5FA` | `#16232F` | `#2A3F58` |
| Secondary accent (purple) | `#C4B5FD` | `#221E38` | `#3C3460` |
| Neutral / Archive / Disabled | `#9499AD` | `#1E2129` | `#323748` |

---

## 4. Core Color Tokens — Light Mode (Future Phase)

| Token name | Hex |
|---|---|
| `--color-bg-app` | `#F7F8FB` |
| `--color-bg-sidebar` | `#EFF1F6` |
| `--color-bg-surface` | `#FFFFFF` |
| `--color-border-subtle` | `#E2E4EB` |
| `--color-border-default` | `#CBD0DC` |
| `--color-text-primary` | `#1A1C26` |
| `--color-text-secondary` | `#5C6072` |
| `--color-text-muted` | `#8A8FA3` |
| `--color-primary` | `#4C5EE6` |
| `--color-primary-hover` | `#3D4ECC` |
| `--color-secondary` | `#0EA5E9` |
| `--color-accent` | `#8B5CF6` |
| `--color-success` | `#16A34A` |
| `--color-warning` | `#D97706` |
| `--color-error` | `#DC2626` |
| `--color-info` | `#2563EB` |

---

## 5. Status / Badge Mapping

The system has ~15–20 distinct status states across modules (attendance, sessions, tasks, submissions, notifications). Map each to one of the 6 semantic groups below. When auditing v1, check every status badge against this table — flag any badge whose color doesn't match its assigned group.

| Status | Semantic group | Token set used |
|---|---|---|
| Present | Success | success text/bg/border |
| Active | Success | success |
| Ongoing | Success | success |
| Completed | Success | success |
| Submitted | Success | success |
| Graded | Success | success |
| Approved | Success | success |
| Absent | Error | error text/bg/border |
| Suspended | Error | error |
| Overdue | Error | error |
| Missing | Error | error |
| Cancelled | Error | error |
| Late | Warning | warning text/bg/border |
| Due Soon | Warning | warning |
| Pending | Warning | warning |
| Pending Review | Warning | warning |
| Excused | Info | info text/bg/border |
| Returned | Info | info |
| Upcoming | Primary | primary text + low-opacity primary bg |
| In Progress (if distinct from Ongoing) | Primary | primary |
| Graduated | Secondary accent | accent (purple) text/bg/border |
| Closed | Neutral/Archive | neutral text/bg/border |
| Archived / Inactive | Neutral/Archive | neutral |

**Badge styling formula (apply uniformly):**
- Background: semantic background-fill color
- Border: 1px solid semantic border color
- Text/icon: semantic text color
- Border radius: pill or `--border-radius-md` (consistent across all badges)
- Font: 12px, sentence case, medium weight
- No solid bright fill + white text combinations

---

## 6. Component Mapping Reference

Use this as a checklist when auditing each component type in v1.

| Component | Background | Border | Text | Notes |
|---|---|---|---|---|
| Navbar / top bar | `--color-bg-sidebar` | `--color-border-subtle` (bottom) | `--color-text-primary` | White logo sits here as-is |
| Sidebar | `--color-bg-sidebar` | `--color-border-subtle` (right) | nav items: `--color-text-secondary`; active: `--color-text-primary` + primary-tinted bg + 2px primary left border |
| Cards | `--color-bg-surface` | `--color-border-subtle` | title: primary text; meta: secondary text | Hover → `--color-bg-hover` |
| Primary button | `--color-primary` | none | white/`--color-text-primary` | Hover → `--color-primary-hover` |
| Secondary/ghost button | transparent | `--color-border-default` | `--color-text-secondary` | Hover bg → `--color-bg-hover` |
| Destructive button | transparent or outline | error border | error text | Avoid solid error fill for non-confirmed destructive actions |
| Table header row | `--color-bg-sidebar` | `--color-border-subtle` | `--color-text-secondary` | |
| Table row | `--color-bg-surface` | `--color-border-subtle` | `--color-text-primary` | Hover → `--color-bg-hover` |
| Form inputs | `--color-bg-surface` | `--color-border-default`; focus → `--color-border-focus` | `--color-text-primary`; placeholder → `--color-text-muted` | Validation error text uses error semantic color |
| Charts (bar/line) | n/a | n/a | series 1: primary; series 2: secondary; series 3: accent; axis/grid: `--color-text-muted` | Avoid semantic (red/green) colors in charts unless chart explicitly shows pass/fail |
| Toasts/notifications | semantic background-fill | semantic border | semantic text | One semantic group per toast type |
| Status badges | semantic background-fill | semantic border | semantic text | See Section 5 |

---

## 7. Refinement / Audit Instructions for AI Analysis

When analyzing the existing v1 UI against this specification, for each screen/component identify:

1. **Color mismatches** — any hex value used that doesn't correspond to a token in Section 3 (or its light-mode equivalent in Section 4). Propose the nearest correct token.
2. **Semantic misuse** — any status/badge/state that uses a color outside its assigned semantic group (Section 5), or any badge using the wrong styling formula (solid fill, all-caps, wrong border treatment).
3. **Decorative color usage** — any element using primary/secondary/accent colors purely for visual variety rather than to indicate action/state/navigation. Flag for simplification toward neutral tones.
4. **Contrast issues** — verify text-on-background combinations meet WCAG AA (4.5:1 for body text, 3:1 for large text/icons) using the token pairs defined above. Flag any pairing that fails.
5. **Inconsistent neutrals** — multiple near-black or near-white values used for what should be a single background/text token; consolidate to the defined token set.
6. **Hardcoded values** — any inline hex colors that should be replaced with CSS variable references to support future light-mode toggle.
7. **Brand alignment** — confirm the white "CSEC ASTU" wordmark logo is used on `--color-bg-sidebar` or `--color-bg-app` only (both dark enough for sufficient contrast); flag any placement on lighter surfaces (e.g. cards, modals) where contrast may suffer.

---

## 8. Non-Goals for This Refinement Pass

- No layout, spacing, or component-structure changes — color/token alignment only.
- No introduction of new hues beyond what's defined here (indigo, cyan, violet, plus the 6 semantic groups) unless a genuinely new semantic category is required (escalate before adding).
- No pure black (#000000), pure white (#FFFFFF), or saturated/neon colors (e.g. #FF0000, #FFFF00, hot pink) anywhere in the system.
