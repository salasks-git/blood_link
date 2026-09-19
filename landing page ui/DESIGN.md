---
name: LifeLink Clinical Portal
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#5c403c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#916f6b'
  outline-variant: '#e6bdb8'
  surface-tint: '#bf0715'
  primary: '#b70011'
  on-primary: '#ffffff'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#ffb4ab'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#4b5a70'
  on-tertiary: '#ffffff'
  tertiary-container: '#63738a'
  on-tertiary-container: '#f6f8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.03em
  data-metric:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

The design system embodies utilitarian minimalism engineered specifically for clinical workflows, emergency ward oversight, and hospital operational management. It rejects decorative trends, skeuomorphic noise, ambient blurs, and heavy drop shadows in favor of extreme clarity, absolute precision, and rapid visual parsing under high-stress conditions.

The target audience includes triage nurses, attending physicians, surgical directors, and ward administrators who need immediate situational awareness. The emotional response must be calm authority, instantaneous comprehension, and unyielding reliability.

The design movement is an intersection of **Utilitarian Wireframe Architecture** and **Swiss Grid Precision**:
- High-contrast typography optimized for rapid scanning across clinical monitors and mobile tablets.
- Architectural borders and hairline dividers providing clear compartmentalization without visual clutter.
- A monochromatic canvas where every pixel serves data delivery, punctuated solely by a sharp clinical red to indicate critical urgency, active states, and essential interventions.

## Colors

The system relies on a stark clinical light mode to maximize legibility in harshly lit hospital environments. The color hierarchy is deliberately constrained to eliminate cognitive load:

- **Primary (`#dc2626` / `#ef4444`)**: Reserved strictly for critical telemetry, code-red alerts, emergency escalations, primary calls to action, and active telemetry toggles. It is never used decoratively.
- **Secondary (`#0f172a`)**: Deep slate/charcoal used for primary headings, quantitative clinical data, patient identifiers, and high-priority labels.
- **Tertiary (`#64748b`)**: Mid-tone slate for supporting metadata, table column headers, units of measurement, and inactive tabs.
- **Neutral (`#f8fafc` / `#f1f5f9` / `#ffffff`)**: Pure white (`#ffffff`) serves as the base surface canvas. Slate-50 (`#f8fafc`) defines subtle structural fills, hover surfaces, and alternating data-table rows. Hairline borders use Slate-200 (`#e2e8f0`).

### Semantic Color Rules
- **Normal / Baseline**: `#0f172a` text against `#ffffff` with `#e2e8f0` border.
- **Critical / Urgent**: `#dc2626` text or solid fill with high-contrast `#ffffff` text.
- **Warning / Pending**: Monochrome badge using `#475569` text with `#f1f5f9` fill to maintain the stark wireframe discipline without creating a rainbow of status colors.
- **Success / Cleared**: Slate-900 border with minimal green dot indicator (`#16a34a`) or pure textual indicator `[RESOLVED]`.

## Typography

The typographic strategy pairs **Geist** for crisp, neutral reading with **JetBrains Mono** for patient identifiers, clinical telemetry, time-stamps, and vital metrics.

- **Geist** handles interface navigation, clinical notes, patient diagnostics, and system dialogues. Its geometric purity and neutral grotesque balance ensure zero emotional distortion.
- **JetBrains Mono** is enforced across all tabular figures, medical chart metrics, bed codes, and timestamps. It guarantees vertical alignment across tables, ensuring numbers don't jitter during live streaming telemetry.
- **Hierarchy & Case**: All labels, table headers, status tags, and metadata units utilize uppercase `label-sm` or `label-md` with tracking (+0.04em to +0.06em) to establish immediate structural separation from patient names and diagnoses.

## Layout & Spacing

The layout model is anchored on an uncompromising 4px baseline sub-grid configured as a 12-column fluid grid. Density is biased toward information efficiency without compromising clinical legibility.

### Screen Adaptations
- **Desktop / Clinical Station (1280px+)**: 12-column grid, fixed vertical collapsed utility rail (64px), persistent 280px left triage sidebar, full multi-panel dynamic workspace with 16px (`1rem`) gutters and 24px outer padding.
- **Tablet / Mobile Cart (768px - 1279px)**: 8-column grid, collapsible drawer navigation, 16px outer margins, unified split-pane view (master list left, detail panel right).
- **Handheld / Mobile Device (< 768px)**: 4-column single-stack view with full-bleed data cards, edge-pinned primary actions, and 12px margins.

### Vertical Rhythm & Density
- Component internal paddings follow strict mathematical multiples: `space-xs` (4px) for micro-badges; `space-sm` (8px) for table cells and button compact padding; `space-md` (12px) for form inputs; `space-lg` (16px) for card internal gutters.
- Visual boundaries are established using 1px borders rather than empty whitespace margins to preserve maximum viewport real estate for patient data.

## Elevation & Depth

This design system deliberately excludes drop shadows, ambient blur, and pseudo-skeuomorphic layering. Elevation is communicated strictly through **structural borders, hairline dividers, and tonal surface stepping**.

### Tonal Hierarchy
- **Base Canvas (Level 0)**: `#ffffff` pure white. Main application background and underlying workspace.
- **Section & Panel Inset (Level 1)**: Bordered containers with a 1px solid `#e2e8f0` stroke. Header bars and table alternating rows transition between `#ffffff` and `#f8fafc`.
- **Active / Focused Containers (Level 2)**: Crisp 1px outline of `#0f172a` (or `#dc2626` when representing an alert or active critical triage card).
- **Modals, Drawers & Overlays**: Absolute white `#ffffff` canvas with a solid 2px outline in `#0f172a`. The backdrop scrim is a non-blurred, 40% alpha wash (`rgba(15, 23, 42, 0.4)`), forcing total focus onto the modal. No box-shadows are permitted.

## Shapes

The design system adopts a **Sharp (`0`)** shape language with hard 0px corners across all inputs, buttons, tables, badges, and structural containers.

- **0px Corner Philosophy**: Sharp geometry reinforces the wireframe aesthetic, references physical medical instrumentation and clipboards, and eliminates blurred edge pixels on low-resolution or high-density clinical monitors.
- **Consistency**: Buttons, badge tags, form controls, dropdown lists, modal dialogs, and alert banners all share absolute 90-degree squared corners. Rounding is completely forbidden except for circular status indicator pips (e.g., live telemetry pulse indicators: 6px x 6px circles).

## Components

### Buttons
- **Primary / Emergency**: Solid `#dc2626` background, crisp `#ffffff` text, 0px radius, 1px border of `#dc2626`. Hover state shifts to `#b91c1c`. Active state triggers invert with high-contrast `#0f172a` border.
- **Secondary / Standard**: Pure `#ffffff` background, `#0f172a` text, 1px `#0f172a` outline. Hover shifts background to `#f8fafc`.
- **Tertiary / Wireframe**: `#ffffff` background, `#64748b` text, 1px `#e2e8f0` outline. Hover text darkens to `#0f172a` with `#cbd5e1` outline.
- **Danger / Destructive**: Red hairline border (`1px solid #dc2626`), white background, `#dc2626` text. Hover shifts to `#dc2626` fill with white text.
- **Sizing**: 32px height for dense data views, 40px height for primary desktop controls. All text rendered in uppercase `JetBrains Mono` at `label-md`.

### Tables & Data Grids
- **Header**: 32px height, `#f8fafc` background, 1px bottom border `#0f172a`, column headers set in `label-sm` JetBrains Mono, text color `#64748b`.
- **Rows**: 40px standard height, alternating subtle zebra stripe (`#ffffff` and `#fafafa`), 1px bottom border `#e2e8f0`. Hover row displays an explicit left indicator border (`2px solid #0f172a`).
- **Telemetry Cells**: Numbers aligned right in monospace font. Values exceeding critical thresholds flash or render in `#dc2626` bold with a `!` prefix.

### Form Inputs & Selectors
- **Input Text / Number**: Height 36px, `#ffffff` background, 1px `#cbd5e1` border, 0px radius, font `Geist` 14px. Focus state triggers a rigid 1px solid `#0f172a` outline with 0px outline-offset (no halo/glow).
- **Error State**: 1px solid `#dc2626` outline with inline monospace error hint below in `#dc2626`.
- **Checkboxes & Radios**: 16px x 16px square boxes with 1px solid `#0f172a`. Checked state displays a solid inner black square (checkbox) or solid center red square (vital alert toggles).

### Status Badges & Chips
- **Structural Framing**: 20px height, 0px radius, 1px outline. Text set in uppercase `label-sm` JetBrains Mono.
- **Critical / Stat**: `#dc2626` border, `#ffffff` background, `#dc2626` text. Includes an optional leading filled red dot.
- **Normal / Routine**: `#e2e8f0` border, `#ffffff` background, `#475569` text.
- **Code Event / Priority**: Inverted solid `#0f172a` background with `#ffffff` monospace text.

### Clinical Metric Cards
- White `#ffffff` card surface bound by 1px `#e2e8f0` border.
- Header contains patient room/identifier in `JetBrains Mono` uppercase left-aligned, and triage tag right-aligned.
- Primary metric (e.g., HR, SpO2, MAP) displayed in `data-display` (28px bold monospace) with supporting metadata units aligned directly below.
- Alerting cards swap the standard border for an explicit `2px solid #dc2626` outline with an off-white `#fef2f2` header strip.