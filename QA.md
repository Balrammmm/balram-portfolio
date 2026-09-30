# Browser verification — 24 September 2026

Historical results below predate the later ACT 03–08 and Philosophy refinements. As of 1 October 2026, current production builds and deterministic source/geometry checks pass; fresh browser interaction, visual and FPS checks remain pending.

## Passed

- `npm run build`: optimized Next.js production build and TypeScript compilation.
- `npx tsc --noEmit`: no type errors.
- Real installed Chrome (agent-browser), not only the embedded preview.
- 1920×1080, 1536×864, 1440×900, 1366×768, and 390×844 viewport captures.
- Hero/About/orbit composition captures; full Hero hair/forehead remains visible, HTML headings remain sharp.
- Five project starts checked at every desktop width; all five start/detail states traversed at 1536×864 and 390×844.
- Project detail controls reached the intended project, Next advanced in order, Back/Escape returned, and Home worked after return.
- Recorded document/dialog width checks found no horizontal overflow.
- Reduced-motion Chrome session confirmed the actual media query true; navigation, project opening and Escape worked without console errors.
- No browser runtime errors reported during the tested normal/reduced flows.

## Fixes driven by these checks

- Corrected the project timeline's initial position and floating-point section boundaries.
- Avoided simultaneous real NEO photography and assembled procedural model.
- Added explicit SVG crop paths to stop source-poster content leaking into mobile letterboxing.
- Aligned hero backdrop and portrait coordinate systems at non-16:9 widths.
- Restarted Lenis when navigating during a return animation.
- Hid outgoing schema labels as the insight panel appears.
- Projected hardware labels from their actual component positions.

## Artifacts

`../../work/projects-qa` contains screenshots and text measurements. Final evidence includes `*-final.png`, `1440-hero-aligned.png`, `mobile-neo-crop-final.png`, `mobile-neo-explode-final.png`, `project-checks.txt`, and `desktop-project-matrix.txt`. Earlier exploratory screenshots are also retained and may show issues subsequently fixed.

## Limits

Viewport tests are desktop Chrome emulation, not physical phone/GPU testing. No numerical reference-match score or frame-rate guarantee is asserted. Procedural models remain visibly simpler than the supplied cinematic reference renders. Screenshot product interfaces are previews; the working products are reached through the live links.
