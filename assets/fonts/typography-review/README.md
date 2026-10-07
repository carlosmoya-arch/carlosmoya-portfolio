# Temporary local typography comparison

Unmodified official WOFF2 files, self-hosted for local review only. Both are SIL Open Font License 1.1; the original license files are included alongside the fonts.

| File | Style / weight | Bytes | Official source |
| --- | --- | ---: | --- |
| InstrumentSans-Regular.woff2 | Normal / 400 | 34,628 | [Instrument, pinned source](https://github.com/Instrument/instrument-sans/blob/7fa22308a3d0c94ee2b3cd537a1196b65db34a3e/fonts/webfonts/InstrumentSans-Regular.woff2) |
| Geist-Regular.woff2 | Normal / 400 | 45,228 | [Vercel, pinned source](https://github.com/vercel/geist-font/blob/10dc7658f13c38a474cde201bb09a4617267545b/fonts/Geist/webfonts/Geist-Regular.woff2) |

Only Regular is needed for the site's current normal-weight typography. No italic, bold, condensed or monospace replacements were added. Current mode preserves both existing Times/Georgia and Arial/Helvetica stacks. Alternative modes override only the two family tokens; sizes, weights, tracking, line heights, spacing, margins and component rules remain unchanged. Glyph metrics and natural line wrapping will differ by font.

The selector is enabled only on `file:`, localhost, 127.0.0.1, [::1] and .localhost hosts. It stays absent on GitHub Pages even if localStorage contains a review preference; production requests no review stylesheet or fonts. On local review only, both small files warm into the font cache for instant comparisons. LOG uses its existing resize/rebuild restoration after font loading/switching to update geometry without changing its interaction code.

Local preference: `carlos-moya-type-review`. Remove `scripts/typography-review.js` references from the ten HTML entry points, then remove the script, `styles/typography-review.css`, this directory and `tests/typography-review.cjs` when review ends. The original tokens never change.
