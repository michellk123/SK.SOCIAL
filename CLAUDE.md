# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SK.SOCIAL** is a single-page Angular 19 portfolio website for Sarai Krotovich, a social media manager and content creator. It showcases video reels, stories, posts, and brand collaborations.

## Commands

```bash
npm start                # Dev server at http://localhost:4200
npm run build            # Production build → dist/sk-social/
npm run watch            # Incremental rebuild on file changes
npm test                 # Karma + Jasmine tests

# Video poster generation (requires FFmpeg installed)
npm run generate:reels   # Generate poster thumbnails for reels
npm run generate:stories # Generate poster thumbnails for stories
npm run generate:all     # Generate all posters
```

## Architecture

**Multi-component SPA** — logic is distributed across standalone components. No routing; all sections are anchor-linked on one page. `AppComponent` is a thin layout shell with no logic.

### Component map

```
src/app/
  app.component.ts/html/scss       — layout shell only
  services/
    video-lightbox.service.ts      — registration bridge for VideoLightboxComponent
  model/
    video-meta.ts                  — VideoMeta { src: string; poster: string }
  components/
    header/                        — fixed nav, scroll-aware frosted glass, centered logo + nav
    hero/                          — full-viewport video hero, mobile/desktop src switching
    reels-marquee/                 — infinite-scroll marquee, opens lightbox on click
    stories/                       — poster-card grid (no inline video), opens lightbox on click
    posts/                         — static image grid with featured wide cards
    brands/                        — logo strip, grayscale → color on hover
    about/                         — Hebrew body text (dir="rtl"), English section head
    video-lightbox/                — unified fullscreen video player for reels + stories
    reel-modal/                    — UNUSED, superseded by video-lightbox
```

### Video lightbox pattern

`VideoLightboxService` holds a reference to the singleton `VideoLightboxComponent` via `register()`. Both `ReelsMarqueeComponent` and `StoriesComponent` inject the service and call `lightbox.open(playlist, index)` directly — no EventEmitters or parent coordination needed.

- Reels: keeps `private reels[]` (original) separate from `items[]` (doubled for marquee). Finds index via `findIndex` on click.
- Stories: poster `<img>` cards at rest — no `<video>` elements until the lightbox opens.
- Lightbox: keyboard nav (← →, ESC), dot indicators, prev/next arrows, body scroll lock, close-animation delay before DOM removal.

### Data flow

1. `ReelsMarqueeComponent` fetches `assets/reels/reels.json` → doubles array for infinite CSS marquee animation
2. `StoriesComponent` fetches `assets/stories/stories.json` → renders poster cards
3. `PostsComponent` and `BrandsComponent` use hardcoded static arrays
4. On click → `VideoLightboxService.open(playlist, index)` → `VideoLightboxComponent.open()`

### Styling system

Dark luxury editorial theme. CSS variables in `src/styles.scss`:

| Variable | Value | Use |
|---|---|---|
| `--bg` | `#080808` | Page background |
| `--surface` | `#111111` | Alternate section background |
| `--ink` | `#ede8e2` | Primary text (warm white) |
| `--muted` | `#7a7570` | Secondary text |
| `--accent` | `#ff4d6d` | Pink — section labels, hover states, active dots |
| `--card` | `#161616` | Card backgrounds |
| `--border` | `rgba(255,255,255,0.07)` | Subtle dividers |
| `--font-display` | `'EB Garamond'` | Section titles, hero (serif italic) |
| `--font-mono` | `'DM Mono'` | Labels, nav, body text |

Shared section classes defined globally in `styles.scss` (do not redefine in components):
- `.section-head` — consistent top spacing/margin for every section
- `.section-label` — `01 / REELS` style labels in accent pink
- `.section-title` — EB Garamond italic display title

### Language / direction rules

- All UI text is **English** (nav, section labels, section titles, hero overlay)
- **Exception**: `AboutComponent` body text is Hebrew — `dir="rtl"` is scoped to `.about-body` only, not the section or any other element
- Do not add `dir="rtl"` anywhere outside `.about-body`

### Notable details

- Header: CSS `grid-template-columns: 1fr auto 1fr` centers logo; nav stacks below on mobile (hidden)
- Scroll threshold: `window.scrollY > 60` triggers frosted-glass header
- Mobile breakpoint: `<= 768px` — hero switches video src, stories switch to CSS grid, lightbox hides nav arrows (dots only)
- Marquee pauses on `window.blur`, resumes on `window.focus`
- Hero video autoplay uses `canplay` event listener with `safePlay` guard
