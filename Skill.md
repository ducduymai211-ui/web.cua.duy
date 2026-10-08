---
name: add-dark-souls-holo-card
description: "Build Dark Souls Holo Card from its verified authored source using Full HTML + Three.js r180 + custom GLSL + embedded models and textures, including the complete renderer, interactions, and required assets. Use when Codex needs to implement, port, or adapt this effect without requiring the ThreeUI package or reconstructing the visual from an approximation."
---

# Build Dark Souls Holo Card

## Description

The Ashen One holographic trading card beside a candlelit sword shrine, with engraved gold borders, layered foil, drifting embers, pointer-reactive lighting, and tactile tilt, rotation, and flip controls.

Recreate the authored behavior from the verified source, not from screenshots or the abbreviated orchestration sample in this skill. The implementation may live directly in the target project and does not require `@designcodeio/threeui`.

## Technologies

- React iframe host
- Byte-exact complete authored HTML document
- Same-project local source URL
- The holographic card, sword shrine, 37 embedded WebP images, five GLB models, two fonts, pinned Three.js r180 imports, custom GLSL, and original tilt, rotation, flip, zoom, and keyboard interactions. Select the free Cindermane companion with variant="cindermane"; its document is /landing-pages/dark-souls-holo-card-cindermane.html

## Verified source material

- `public/landing-pages/dark-souls-holo-card.html — byte-exact complete scene with embedded assets`
- `src/shaders/dark-souls-holo-card/DarkSoulsHoloCard.tsx`

Source revision: `SHA-256 4373734e87a1`

## Implementation steps

1. Open every verified source file listed above and identify the renderer, host lifecycle, styles, and assets before editing.
2. Copy the complete Dark Souls Holo Card HTML file byte-for-byte to /landing-pages/dark-souls-holo-card.html; do not extract, rewrite, shorten, or rebrand any section.
3. Preserve every embedded style, script, media payload, text string, interaction, responsive rule, and document-level lifecycle.
4. Keep every relative local asset at the exact path expected by the original document.
5. Load the local document in a full-size iframe whose permissions retain the authored forms, modals, downloads, popups, scripts, and same-origin resources.
6. Lazy-load only the React host bundle; do not import the complete HTML into the application JavaScript graph.
7. Give the local component a sized, overflow-controlled parent and verify desktop, mobile, reduced-motion, and context-loss behavior.

Asset handling: Copy dark-souls-holo-card.html byte-for-byte to /landing-pages/dark-souls-holo-card.html. All 44 image, model, and font resources are embedded. Preserve the import map: Three.js r180 and its addons load from jsDelivr and require network access. For the free Cindermane variant, also copy dark-souls-holo-card-cindermane.html to /landing-pages/ and set variant="cindermane". The Cindermane document directly loads 13 optimized native-resolution images and one font from Supabase Storage. Keep those immutable URLs; network access is required. The unmodified supplied document is preserved in Git commit f0b606cf.

## Local component example

Import the copied local component rather than a package entrypoint:

```tsx
import { DarkSoulsHoloCard } from "./effects/dark-souls-holo-card/DarkSoulsHoloCard";
import "./effects/dark-souls-holo-card/styles.css";

export function Scene() {
  return <div className="effect-frame"><DarkSoulsHoloCard /></div>;
}
```

## Core renderer pattern

This excerpt documents orchestration only. Copy the exact shader, geometry, pass, and interaction code from the verified source files.

```tsx
<LandingPageFrame title="Dark Souls Holo Card" sourceUrl="/landing-pages/dark-souls-holo-card.html" />
```

## Behavior contract

- Runtime: Full HTML + Three.js r180 + custom GLSL + embedded models and textures
- Passes: Three.js card composer with render, bloom, and finish passes, plus the shrine render pipeline
- Interaction: Pointer tilt and lighting, drag rotation, double-click or F to flip, wheel zoom, arrow keys, R to reset, responsive layout, and reduced motion
- Assets: 44 embedded resources: 37 WebP images, five GLB models, and two WOFF2 fonts; pinned Three.js r180 modules from jsDelivr
- **source** (fixed): Exact owner-selected HTML
- **focus** (host): Effect-only sandbox
- **palette** (optional): Final-frame grade
- **assets** (fixed): No owned binary assets

## Verification

1. Compare the rendered composition, animation timing, pointer behavior, and state transitions with the source implementation.
2. Exercise resize, high-DPI, mobile/coarse-pointer, reduced-motion, tab visibility, and WebGL context-loss paths where applicable.
3. Confirm every animation frame, observer, listener, geometry, buffer, texture, framebuffer, material, and renderer is released on teardown.
4. Check the browser console and confirm the effect renders at native-or-better backing resolution.

## Guardrails

- Do not substitute a visually similar package, demo, shader, or runtime.
- Do not approximate, reconstruct, or simplify the authored GLSL, render passes, geometry, interaction state, or assets.
- Keep exact source and asset hashes under regression tests when the source project provides them.
- Adapt only the surrounding host boundary needed by the target project; keep renderer behavior intact.
