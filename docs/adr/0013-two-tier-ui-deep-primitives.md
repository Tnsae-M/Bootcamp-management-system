# 0013 — Two-Tier UI Architecture with Deep Domain Primitives

Status: accepted

We decided to structure the frontend component layer into a **Two-Tier Deep Module Architecture**:

1. **Tier 1 (Base UI Primitives — `src/components/ui/*`):** Atomic, headless-backed controls (`button`, `input`, `textarea`, `modal`, `card`, `skeleton`, `form-field`, `empty-state`) wrapping Radix UI and Tailwind CSS v4.
2. **Tier 2 (Deep Domain Primitives — `src/components/common/*`):** High-leverage domain abstractions (`PageHeader`, `StatusBadge`, `StatGrid`, `DataTable`) that encapsulate styling, icons, and status mappings.

## Context

The BMS frontend spans ~30 distinct screens across 5 user roles. Without deep domain primitives, pages duplicate verbose layout boilerplate, hardcode inline status color mappings, and violate uniform dark mode styling.

## Considered Options

- **Two-Tier Deep Architecture (Accepted):** Centralizes all domain status mappings (18 statuses from `CONTEXT.md`) inside a single `<StatusBadge status={...} />` component. Page headers, KPI metric grids, and tables expose simple declarative props (`{ title, description, badge, action }`).
- **Utility-First Per-Page Composition:** Pages compose raw Tailwind classes directly. Rejected due to severe JSX duplication and high maintenance cost across 30+ pages.
- **Heavy Third-Party Component Library (MUI/AntD):** Rejected due to excessive bundle size, friction with Tailwind v4, and visual divergence from CSEC-ASTU brand identity.

## Consequences

- Page components remain lean (~100–150 lines) and deal strictly with business data and thunk dispatching.
- Any change to status badge styling or KPI metric card structure is changed in one file and updates globally across the app.

