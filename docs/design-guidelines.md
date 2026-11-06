# x-kom-inspired design guidelines

Extracted from the public x-kom homepage on 2026-11-05 with Playwright in desktop Chrome. Treat this as a visual reference, not permission to copy protected brand assets.

## Assets

| Asset | Repository path | Purpose |
|---|---|---|
| Design tokens | [`../assets/design-tokens.json`](../assets/design-tokens.json) | Machine-readable colors, type, spacing and components |
| Homepage reference | [`../assets/homepage.png`](../assets/homepage.png) | Full-page desktop reference without overlays |
| x-kom wordmark | [`../assets/logo.svg`](../assets/logo.svg) | Header/brand reference |
| Favicon | [`../assets/favicon.ico`](../assets/favicon.ico) | Browser icon reference |
| Instrument Sans | [`../assets/fonts/instrument-sans/InstrumentSans-VariableFont_wdth,wght.woff2`](../assets/fonts/instrument-sans/InstrumentSans-VariableFont_wdth,wght.woff2) | Local variable font, weights 400-700 |

## Colors

| Token | Value | Usage |
|---|---:|---|
| `brand.primary` | `#0082fa` | Brand blue, active accents |
| `brand.primaryHover` | `#0070cc` | Strong/hover blue |
| `brand.accent` | `#fa0064` | Promotional accent and logo |
| `brand.violet` | `#8250fa` | Secondary promotional accent and logo |
| `brand.cyan` | `#0fd2ff` | Supporting logo accent |
| `brand.error` | `#b4031c` | Error feedback |
| `brand.success` | `#119e00` | Success feedback; product savings use darker `#007d00` |
| `background.default` | `#ffffff` | Cards, header and controls |
| `background.light` | `#f7f7f7` | Page canvas and section separation |
| `background.subtle` | `#f2f2f2` | Tags and subdued surfaces |
| `background.dark` | `#222222` | Promo bars and primary CTAs |
| `text.primary` | `#1a1a1a` | Headings and body text |
| `text.secondary` | `#444444` | Secondary controls and labels |
| `text.muted` | `#6e6e6e` | Metadata and supporting text |
| `text.link` | `#1c73e7` | Links |
| `border.default` | `#cccccc` | Form and secondary button outlines |

Use white cards on a very light gray canvas. Reserve the saturated logo palette for brand moments, promotions and state emphasis; the main commerce UI is deliberately neutral.

## Typography

Primary family: `Instrument Sans`, falling back to `sans-serif`. The page serves one variable font with normal style, weight range 400-700 and `font-display: swap`.

```css
@font-face {
  font-family: "Instrument Sans";
  src: url("../assets/fonts/instrument-sans/InstrumentSans-VariableFont_wdth,wght.woff2") format("woff2");
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
}
```

Downloaded font file: `assets/fonts/instrument-sans/InstrumentSans-VariableFont_wdth,wght.woff2`. Verify its license before use or redistribution.

| Role | Size / line height | Weight |
|---|---:|---:|
| Fine print | 12px / 16px | 400 |
| Compact label | 13px / 16px | 400-600 |
| Body | 14px / 20px | 400 |
| Control | 16px / 22px | 400-600 |
| Section heading | 20-26px / 26-32px | 600 |
| Display | 31px / 38px | 600-700 |

## Spacing

Use a 4px base unit. Common values are 4, 8, 12, 16, 20, 24, 28 and 32px. Dense labels may use asymmetric half-step padding, but new layouts should stay on the 4px scale.

## Border radius

| Radius | Usage |
|---:|---|
| 2px | Very small decorative details |
| 4px | Tags and badges |
| 8px | Default buttons, controls, cards and images |
| 12-16px | Larger promotional surfaces |
| 512px | Pills |
| 100% | Circular icon controls |

## Components

- Header: white surface, 14px base text, black wordmark, compact utility controls.
- Promo bar: 40px tall, `#222222` background, white 14/20px text.
- Navigation/category control: white background, `#cccccc` border, 8px radius, compact 13px label.
- Primary button: `#222222` background, white 16/22px text, 12px 24px padding, 8px radius.
- Inputs: white container with an 8px radius; inner text uses 14/20px and a neutral border/focus treatment.
- Cards: white on `#f7f7f7`, usually 8px radius, shallow separation rather than heavy shadows.
- Product status: green text and pale-green surfaces; keep prices highly legible and metadata muted.

## Logo usage

Use `assets/logo.svg` at its native 118:32 aspect ratio with clear space around it. The saved SVG includes standalone fallbacks for all extracted colors. On light surfaces use the default black wordmark. No separate inverted source asset was exposed; when embedding inline on dark surfaces, override `--color-full: #fff` while retaining the colored mark. Do not recolor the multicolor mark arbitrarily.

## Visual style

The visual language is practical, dense and commerce-first. Neutral whites and grays carry most of the interface, while saturated blue, pink, violet and cyan provide recognizable brand energy. Rounded 8px controls and cards soften a content-heavy layout without making it playful. Typography is compact, direct and optimized for scanning products, prices and promotions.
