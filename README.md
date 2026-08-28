# CircuitKit

CircuitKit is a collection of practical electronics engineering calculators for students, beginners, and makers. Each tool accepts familiar engineering units, performs its math in SI units, and shows the formula, substituted calculation, and concise engineering context behind the result.

## Live demo

[https://circuitkit.netlify.app/](https://circuitkit.netlify.app/)

## Screenshot

The primary project screenshot will show the CircuitKit homepage and its five-tool directory. After the production URL is live, store the final capture at `docs/images/circuitkit-home.png` and embed it in this section.

## Features

- Unit-aware inputs with automatic SI conversion
- Results formatted with practical engineering prefixes
- Visible formulas and dynamic calculation steps
- Friendly validation for physically invalid or incomplete inputs
- Responsive layouts for phone, tablet, and desktop
- Keyboard-accessible forms, focus states, and navigation
- Pure, tested calculation modules separated from React UI

## Calculators

All five MVP calculators are complete and available in the live application.

1. **Voltage Divider** — Complete — output voltage and divider current
2. **LED Resistor** — Complete — theoretical resistance, E12/E24 recommendation, actual current, deviation, and power
3. **RC Filter** — Complete — first-order low-pass/high-pass cutoff frequency and time constant
4. **Op-Amp Gain** — Complete — ideal inverting and non-inverting closed-loop gain
5. **RLC Resonance** — Complete — ideal LC resonant and angular resonant frequency

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui-compatible local primitives
- Vitest
- Lucide icons

## Local development

Node.js 20.9 or newer is required. The repository includes an `.nvmrc` that selects Node.js 24 for a reproducible local and Netlify build environment.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

## Testing and production checks

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

`npm run test` covers unit conversion, engineering formatting, standard resistor recommendations, input validation, and the pure math used by all five calculators.

## Project structure

```text
src/
  app/                    # App Router pages, metadata, error routes, and global styles
  components/             # Shared UI and calculator React components
    calculators/          # Interactive calculator interfaces and circuit diagrams
    ui/                   # Project-owned shadcn-style primitives
  lib/
    calculators/          # Pure calculator math and validation
    electronics/          # Electronics-domain helpers such as E12/E24 series
    units/                 # Typed unit definitions, SI conversion, and formatting
```

`DESIGN.md` records the visual system, while `UX-CONTRACT.md` records shared interaction and accessibility behavior.

## Netlify

Netlify can detect this Next.js project automatically. Use `npm run build` as the build command and `.next` as the publish directory if manual values are requested. No Netlify-specific runtime package is required.

## Roadmap

- Add a production screenshot from the live deployment
- Add source references for calculator formulas and engineering assumptions
- Add optional E-series guidance to more component calculators
- Explore localization after the English MVP is stable
- Consider an API or mobile client backed by the existing pure calculation modules

## License

No open-source license has been selected yet. Until a license file is added, the code is publicly viewable but reuse rights are not granted by default. MIT is a common choice for a portfolio utility project, but the repository owner should make that decision before inviting external reuse or contributions.
