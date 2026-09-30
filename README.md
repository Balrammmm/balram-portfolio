# Balram Portfolio

Balram Maurya's cinematic portfolio, built with Next.js, TypeScript, React, GSAP/ScrollTrigger, Lenis and Three.js. Self-hosted fonts, near-black/ivory styling and restrained champagne accents.

## Run locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For production, run `npm run build`, then `npm start`.

## Journey

- Hero → About → Inside the Head.
- Venture Autopsy, ProductPulse, RetailPulse, NEO and ESP32 Quadcopter.
- Beyond the Build: IIC responsibility → Writing → Finance/Philosophy → Proof of Work → Résumés → Contact.
- Shared navigation provides direct résumé and contact access. Both résumé PDFs are bundled under `public/resume`.

## Structure

- `components/Film.tsx`: opening sequence, routing and return navigation.
- `components/ProjectJourney.tsx` / `ProjectStage.tsx`: project storytelling and hardware breakdowns.
- `components/Continuation.tsx`: ACT 03–08 and reversible scroll transitions.
- `components/ThinkingStage.tsx`: Finance geometry and the layered Philosophy orbit.
- `lib/story-flow.ts`: deterministic transition and orbit geometry.
- `app/`: shared layout, typography and scoped styles.
- `public/`: supplied photographs, fonts, screenshots, statue cutout and résumé PDFs.

## Deployment

Import this repository into Vercel using the **Next.js** framework preset and repository root as the project directory. Build command: `npm run build`. No application environment variables are required.

## Verification

```sh
npm run build
node scripts/verify-story-flow.mjs
```

Flow checks cover forward/reverse timeline determinism, mutually exclusive text reveals and responsive orbit bounds. Other local verification scripts may reference original supplied files on the author's workstation.

Recent production builds and source/geometry checks pass. `QA.md` contains historical browser results; those captures predate the latest ACT and orbit refinements. Current full-flow browser, interaction and FPS acceptance remains pending and is not implied by successful compilation.

## Assets

Portraits, prototype imagery and résumé content are supplied by Balram. Product screenshots link to their working products. The Philosophy cutout preserves the supplied image's RGB pixels and changes only alpha. Financial geometry is illustrative, not live market data. Quadcopter content describes an experimental first-year hardware project without invented flight-performance claims.
