---
name: loulou-design
description: Use this skill to generate well-branded interfaces and assets for Lou Lou (露露), a pet-care brand shipping on WeChat Mini Program. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# Lou Lou Design Skill

Lou Lou is a **WeChat Mini Program (微信小程序)** for pet owners — grooming
bookings, walk tracking, activity goals. Tone: **chic, modern, approachable**.
The system pairs near-black ink CTAs (`#22282C`) with butter / lavender
pastels on a cool off-white page (`#F8F8FC`).

## Where to look

1. Start with **`README.md`** — full brand context, content tone, visual
   foundations, iconography, and the file index.
2. **`colors_and_type.css`** — all design tokens as CSS custom properties
   (colors, radii, shadows, spacing, type scale). Drop into any HTML output:
   ```html
   <link rel="stylesheet" href="path/to/colors_and_type.css">
   ```
3. **`preview/`** — self-contained card files showing every primitive
   (palette, type, radii, shadows, components). Read these to understand the
   exact look of each token.
4. **`ui_kits/wechat-mini-program/`** — pixel-faithful Mini Program
   prototype with reusable JSX components. Copy components straight out for
   new mocks.
5. **`assets/logo.png`**, **`assets/moodboard.png`** — primary mark + the
   3-screen brand reference.

## Working rules (do this; don't do that)

- **Do** use `#22282C` as the only dark — for CTAs, primary text, dark pills.
- **Do** ground every pet card on a flat pastel stage (`butter #FEE7A6` or
  `lavender #D8CAE8`) with the pet photo overlapping the top edge.
- **Do** use **pill (48rpx) CTAs**, **24rpx radii** on large cards, **8rpx**
  on tags. Keep shadows feather-light.
- **Do** use 2px stroke linear icons; switch to filled for active tabs.
- **Do** keep numerals in SF Pro Text (tabular) even inside Chinese strings.
- **Don't** add gradients to backgrounds, glassmorphism, or coloured shadows.
- **Don't** use emoji in production chrome (only on marketing / push titles).
- **Don't** introduce new saturated colours — the heart red lives only on
  the logo.

## When asked to design

- **Throwaway / mock / prototype** — produce static HTML files that import
  `colors_and_type.css` and reuse the JSX components from
  `ui_kits/wechat-mini-program/`. Copy assets from `assets/` rather than
  linking out of the skill folder.
- **Production code** — read the tokens out of `colors_and_type.css` and
  re-emit them as rpx / Sass / Tailwind config (1rpx ≈ 0.5px on a 375pt
  viewport). The radii / shadow / type spec is canonical.
- If the user is vague, ask: which screen / which surface (mini program,
  marketing site, push card, share image), bilingual or single-locale, and
  whether they have real pet photography to drop in.
