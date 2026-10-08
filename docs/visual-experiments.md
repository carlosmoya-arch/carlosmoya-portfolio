# Reverting the visual experiments independently

These experiments do not change the original styles/tokens.css font stacks, dimensions, content or interaction modules. No automatic commit or push was performed.

## ORIGINAL / IBM PLEX SANS / INTER selector

The temporary selector in scripts/plex-experiment.js changes only the family tokens, without reloading. It persists under localStorage key `carlos-moya-font-comparison`. IBM Plex Sans remains the default unless ORIGINAL or INTER was selected. All three options retain the current 400 body / 500 navigation-and-title weights, sizes, line heights and spacing; ORIGINAL restores the family stacks, not the previous 400-only title weights. Plex and Inter warm their self-hosted WOFF2 faces for immediate switching. Inter sources and the SIL OFL license are in assets/fonts/inter; no cursor files were changed when adding Inter.

Git HEAD:styles/tokens.css confirms the original stacks: `--serif: "Times New Roman", Times, Georgia, serif` and `--sans: Arial, Helvetica, sans-serif`. Main menu uses the sans token; most content/controls use the serif token. Intentional system monospace remains unchanged. The selector stays usable inside native modal dialogs by moving into the open dialog's top layer.

When a final font is chosen, remove the selector creation/storage/change-handler/modal-observer block from scripts/plex-experiment.js (everything before the font-loading Promise.all), and remove the .font-comparison CSS rules. Keep the font-loading geometry-restoration block when retaining Plex. For IBM Plex Sans, keep the existing :root Plex tokens and remove the ORIGINAL override; for ORIGINAL, set :root to the two original stacks above. No HTML, content or cursor changes are required to remove just the selector. Clear `carlos-moya-font-comparison` when retiring it.

Cursor sizes are now 8px / 16px with a 150ms size-only transition. The exact-position, theme, touch, keyboard and reduced-motion handlers remain intact.

For a final Inter selection, set the permanent :root family tokens to `"Inter", Arial, Helvetica, sans-serif` and remove both comparison overrides when retiring the selector. Keep Inter's @font-face declarations and its geometry-restoration loading; Plex-specific font assets can then be removed independently.

## Restore the original typography

Remove the link to styles/plex-experiment.css and the script scripts/plex-experiment.js from index.html and their ../ equivalents from all nine pages/*.html entry points. This restores the original Times/Georgia and Arial/Helvetica tokens and previous title/navigation weights. You can keep or remove the unused stylesheet, script and assets/fonts/ibm-plex-sans files. No cursor change is required. The script restores LOG geometry after webfont loading using its existing resize path, after the entrance animations finish.

## Restore the native cursor

Remove both the cursor-experiment.css link and cursor-experiment.js script from the ten HTML entry points, then reload. You can keep or remove those unused files. No typography change is required. Removing only the script also restores the native cursor after reload.

The old CURRENT/INSTRUMENT/GEIST/EVERETT selector and its dedicated assets/tests were removed. No TWK Everett font files were ever added. Native cursor remains the fallback without JavaScript, on touch/no-hover devices and until a real mouse event enables the custom cursor. Keyboard Tab restores the native cursor; focus outlines and shortcuts remain intact.

## Exact file inventory

Modified HTML entry points (experiment links/scripts only):

- index.html
- pages/about.html
- pages/contact.html
- pages/current.html
- pages/log.html
- pages/project.html
- pages/projects.html
- pages/tools.html
- pages/wolf-besucherzentrum.html
- pages/work.html

Modified regression test:

- tests/log-field.cjs — sampling window now starts at its first animation frame; the old deadline also failed without either experiment.

Created:

- styles/plex-experiment.css
- scripts/plex-experiment.js
- styles/cursor-experiment.css
- scripts/cursor-experiment.js
- tests/visual-experiments.cjs
- docs/visual-experiments.md
- assets/fonts/ibm-plex-sans/IBMPlexSans-Latin.woff2
- assets/fonts/ibm-plex-sans/IBMPlexSans-LatinExt.woff2
- assets/fonts/ibm-plex-sans/OFL.txt
- assets/fonts/ibm-plex-sans/README.md

Removed obsolete review files:

- scripts/typography-review.js
- styles/typography-review.css
- tests/typography-review.cjs
- assets/fonts/typography-review/Geist-Regular.woff2
- assets/fonts/typography-review/Geist-LICENSE.txt
- assets/fonts/typography-review/InstrumentSans-Regular.woff2
- assets/fonts/typography-review/InstrumentSans-OFL.txt
- assets/fonts/typography-review/README.md
- tests/everett-local.cjs (uncommitted previous experiment)
- docs/local-everett-review.md (uncommitted previous experiment)

Existing content files, base typography tokens, layout/component CSS and production interaction modules remain unchanged. No additional spacing adjustments were required.
