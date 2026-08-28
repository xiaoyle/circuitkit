# CircuitKit UX Contract

## Product context

- Audience: electronics and embedded-systems beginners, especially university students.
- Primary jobs: choose a calculator, enter values with familiar engineering units, get a reliable result, and understand the formula and calculation.
- Target markets: global, with no country-specific behavior in the MVP.
- Active locales: English (`en`) for the MVP.
- Language/content register: concise and educational; formulas and symbols remain language-neutral where possible.
- Timezone/calendar policy: not applicable to calculator workflows.
- Accessibility target: WCAG 2.2 AA.

## Business-context sources

The current user brief is the sole product source for the MVP. The product has no permissions, personal data, billing, deletion, or regulated workflows.

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Calculator scope and behavior | Current CircuitKit project brief | Product brief | 2026-08-26 |
| Formula and unit correctness | Calculator source modules and automated unit tests | Implementation evidence | 2026-08-28 |

## Visual contract

- Project design source: `DESIGN.md`.
- Token ownership: `DESIGN.md` is approved source; `src/app/globals.css` is the hand-maintained runtime mapping.
- Runtime design-system source: CSS custom properties and Tailwind 4 `@theme inline`.
- Drift gate: DESIGN.md lint, CSS token review, strict UI audit, browser screenshots.
- Supported themes: light; forced-colors remains system-owned.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | `src/components/calculators/unit-input.tsx` | DESIGN.md + this contract | native; platform popup accepted | keyboard + supported units |
| Form | `CalculatorShell` + shared calculator unit field | this contract | calculator | validation + keyboard |
| Scrollbar | `src/app/globals.css` | DESIGN.md | stable-gutter exception | computed style |

## Component behavior

| Component | Default | Hover | Focus | Active | Disabled | Busy | Error |
|---|---|---|---|---|---|---|---|
| Button/link | clear label | tonal accent | 2px visible ring | darker tone | dim, inert | stable geometry | inline status |
| Input | labeled value + unit | stronger border | accent ring | n/a | dim, inert | n/a | text + `aria-invalid` |
| Tool link | title + job summary | signal line advances | accent outline | subtle inset | n/a | n/a | n/a |

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome | Source ref |
|---|---|---|---|---|---|---|---|
| Open calculator | Tool name link | route indicator when needed | calculator route | page title and tool heading | app-owned not-found/error route | main heading | Product brief |
| Calculate | `Calculate` | stable button state | same route | named result + formula + calculation | inline errors preserve values | result heading or first invalid field | Product brief; phase 2 formula reference |
| Reset | `Reset values` | none | same route | inputs and result return to initial state | n/a | first input | Product brief |

## Navigation and responsive behavior

- Route titles use `{Tool} — CircuitKit`; homepage uses `CircuitKit — Electronics calculators that explain the math`.
- Calculator pages have an accessible breadcrumb back to Calculators.
- Header navigation stays compact; mobile uses the same visible destinations without a hidden drawer.
- Calculator workbench collapses from two columns to one natural-flow column below 768px.
- Focused controls use scroll margin so the sticky header does not obscure them.
- App-owned 404 and route error pages retain the shared header and a path home.

## Validation

- Calculator forms use `noValidate` and app-owned numeric validation.
- Unit selectors use native selects because the small fixed option sets do not require app-owned popup geometry; the shared field owns labels, focus, and visual states.
- Validate on calculate, then revalidate invalid fields as values change.
- Errors name the problem and correction, are linked with `aria-describedby`, and never rely on color alone.
- Inputs are preserved after errors; zero and negative constraints follow the physical meaning of each parameter.
- Invalid submission focuses the first invalid field. Calculation is synchronous, so duplicate-submit and network recovery are not applicable.

## Verification

- Required commands: `npm run lint`, `npm run typecheck`, `npm run build`, strict premium UI audit.
- Browser matrix for MVP: Chromium desktop and a narrow 390px viewport; keyboard navigation and reduced-motion mode.
- Unit tests and formula checks are required for every released calculator.
