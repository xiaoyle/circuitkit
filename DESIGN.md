---
version: alpha
name: "CircuitKit"
description: "A precise, approachable electronics workbench for students and early-career engineers."
colors:
  primary: "#087F73"
  ink: "#17211F"
  muted-ink: "#5C6965"
  paper: "#F5F7F4"
  surface: "#FFFFFF"
  line: "#D9E0DC"
  accent: "#087F73"
  accent-strong: "#07665E"
  accent-soft: "#DCEFEA"
  caution: "#A35C00"
typography:
  display:
    fontFamily: "Manrope Variable, Segoe UI, sans-serif"
    lineHeight: "1.05"
  body:
    fontFamily: "Manrope Variable, Segoe UI, sans-serif"
    lineHeight: "1.6"
  data:
    fontFamily: "JetBrains Mono Variable, Consolas, monospace"
    lineHeight: "1.45"
rounded:
  DEFAULT: "0.375rem"
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.875rem"
spacing:
  control: "0.75rem"
  section: "6rem"
  page-gutter: "1.5rem"
  page-max: "76rem"
components:
  button:
    rounded: "0.375rem"
    height: "2.75rem"
  input:
    rounded: "0.375rem"
    height: "2.75rem"
  tool-link:
    rounded: "0.5rem"
  calculator-shell:
    rounded: "0.875rem"
---

# CircuitKit Design System

## Overview

### Creative North Star

CircuitKit should feel like a well-kept electronics bench: pale anti-static work surface, dark instrument labels, hairline measurement rules, and one restrained oscilloscope-teal signal. It is precise without feeling clinical and educational without resembling a school portal.

### Product context and register

- **Audience and primary job:** Electronics, microelectronics, and embedded-systems beginners who need a trustworthy calculation and enough explanation to learn from it.
- **Target markets and evidence:** Global, English-first MVP, based on the project brief. No country-specific engineering or regulatory behavior is assumed.
- **Locales and language policy:** English UI for the MVP. Mathematical notation, symbols, and SI units remain internationally recognizable. Future localization must not change formula semantics.
- **Usage scene:** Quick calculations at a desk, lab bench, or phone; medium information density with high numeric legibility.
- **Register:** Hybrid. The homepage communicates product scope first; calculator routes prioritize stable product utility.
- **Memorable signature:** A compact, fully worked engineering calculation turns the homepage thesis into verifiable product evidence.
- **Restraint:** Calculator forms, validation, results, formulas, and notes stay quiet, flat, and highly readable.
- **Anti-references:** No admin-dashboard chrome, glassmorphism, neon cyberpunk, dense laboratory portal, excessive rounded cards, or decorative gradients.
- **Token ownership/runtime mapping:** `DESIGN.md` is the approved design source. Its semantic values are mirrored one-to-one in `src/app/globals.css`; Tailwind 4 exposes those variables through `@theme inline`. Shared components consume semantic utilities rather than raw colors.

## Colors

`paper` is the page ground and `surface` is reserved for interactive or explanatory surfaces. `ink` and `muted-ink` create the text hierarchy. `line` carries most structure instead of shadows. `accent` is the only expressive color and represents active signal flow, links, focus, and primary actions. `caution` is reserved for warnings and validation; it is not decorative.

The first release is light-theme only. Forced-colors mode returns control of focus and scrollbars to the operating system. A dark theme may remap semantic roles later without changing component hierarchy.

## Typography

Manrope Variable is used for display and body text because its open construction reads cleanly at both headline and control sizes. JetBrains Mono Variable is reserved for formulas, units, values, route labels, and small engineering metadata. Numeric displays use tabular figures. Sentence case is the default; uppercase is reserved for short utility labels with generous tracking.

## Layout

The content width is capped at 76rem. Desktop calculator pages use a stable two-column workbench: inputs on the left, result and explanation on the right. Mobile collapses to one natural-flow column with no nested page scroll. Section spacing is generous but keeps the product headline, worked example, and current tool status close to the first viewport. Calculator workflows remain tighter. Persistent header geometry is reserved to avoid route shift.

## Elevation & Depth

Hierarchy comes from tonal surfaces, rules, and spacing. Static content does not use drop shadows. A subtle shadow is allowed only for a temporary overlay in future phases. The header uses a translucent paper surface and bottom rule, not a floating glass card.

## Shapes

Controls use a precise 6px radius. Larger work surfaces may use 14px. Pills are limited to compact status labels and must not become the default container language. Dividers are 1px and use the shared line token.

## Components

### Foundational visual states

Interactive elements have a visible teal focus ring, a quiet tonal hover, a darker pressed state, and a non-interactive disabled cursor. Disabled and error meaning never relies on color alone. Busy states preserve component geometry. The default loader is a small, labeled indicator in a reserved region; skeletons are not part of the MVP.

### Buttons and actions

Buttons combine emphasis (`solid`, `outline`, `ghost`) with intent (`brand`, `neutral`). There is one solid brand action per decision area. Labels use specific verbs. Icon-only actions require accessible names.

### Navigation and data display

The header provides direct Home and Calculators navigation without a desktop sidebar. Tool collections are semantic lists separated by rules rather than a wall of floating cards. Formula and data output use the mono face and tabular numerals.

### Forms and overlays

Calculator forms use real labels, visible unit controls, inline help/error regions, `noValidate`, and first-error focus. Unit selects use the shared native selector because the fixed engineering-unit lists are short and platform popup behavior is acceptable. No dialog, toast, or destructive flow is required in the first release.

### Iconography

Lucide is the canonical icon family at 1.75px stroke. Icons clarify tool categories and navigation; labels remain visible for primary actions.

### Motion

Motion communicates hover, focus, and route orientation only. Color and transform transitions use 160–220ms ease-out. The homepage calculation example is static product evidence, not an animated decoration; `prefers-reduced-motion` removes nonessential transitions.

### Content and data visualization

Copy is concise, calm, and explanatory. Results name the physical quantity before showing the value. Formula, substituted calculation, and engineering note are separate sections. Formatting preserves significant meaning while avoiding false precision.

## Do's and Don'ts

- **Do:** Use rules, alignment, mono labels, and measurement-like spacing to express engineering precision.
- **Do:** Keep formula logic and unit conversion outside React components.
- **Don't:** Place every paragraph inside an elevated rounded card.
- **Don't:** Use gradients, glowing effects, or animation as substitutes for information hierarchy.
