# Editorial content

These files contain data only. They are JavaScript assignments with JSON-shaped records so the existing site works both on GitHub Pages and when `index.html` is opened directly (`file://`). No fetch, build step, generated duplicate or server is required. The HTML entry points load them before the existing renderer.

- `projects.js`: the complete project database. Array order is editorial display order; only `selected: true` records appear publicly. IDs preserve existing links; slugs can describe the preferred project name. Promote an archive candidate by setting `selected: true`, then move its record to the desired position.
- `log.js`: observation records. `published: false` reserves an entry without displaying it. The 51 published Pexels plates remain temporary layout samples; record 052 reserves Umspannwerk Schwabing with no image path.
- `images.js`: existing local image metadata and per-image source/credit. No images were downloaded in this pass.
- `work.js`: professional chronology, including Independent Practice and the current Telluride collaboration. Older internships remain.
- `about.js`: collaborator names and drawing sources to curate later.
- `texts.js`: short EN/DE/ES labels for the new metadata. Existing interface translations, biography, education, CURRENT and TOOLS remain in `scripts/content-data.js`.

## Project schema

`period` is Carlos's verified involvement period, not a completion date. Unknown periods remain `null`. `scope` contains Carlos's role, LPH and, when documented, earlier-phase area. `projectData` holds building areas, units, project-wide LPH, value, completion and project chronology. Each area retains its literal `term` (`GF`, `BGF`, `WF`), optional label and approximation marker; no area conversions are made.

The ten selected records follow the supplied provisional order. The repository establishes studio chronology but no exact intra-studio dates/order for all ten projects. Completion years are never used to sort the selection. The retained Wolf 2021–2026 period is explicitly project chronology, not asserted as Carlos's personal involvement period. Dinardpark retains the legacy `starnberg` ID.

Public metadata has a maximum of six rows, in this order: Type, Office, Role, LPH, Area, Year. Empty fields disappear. `publicMetadata` stores concise editorial overrides without deleting any richer data: short role/type, approved office attribution, optional LPH wording and area-term display. Carlos's own LPH takes precedence over project LPH. Area displays only the principal figure (earlier scope area when supplied, otherwise the first building area). Year uses documented completion only; ambiguous project/participation ranges remain internal. Wolf's public area is 4,500 m² and its confirmed office attribution is Märzo → Independent Practice. Units, secondary areas, value, status, detailed scope and sources stay internal for future pages.

`assets` supports `cover`, `photo`, `drawing`, `detail`, `process` and `before`, with `src`, `source`, `credit`, multilingual `alt`, `width`, `height`, optional `available` and `placeholder`. One `cover` supplies the existing floating hover. Temporary covers have `usage: "hover-only"` and never become project gallery photographs. Existing empty Wolf gallery slots remain marked unavailable. For a real asset, supply its local path, source, credit and dimensions and remove the placeholder flag. An `imageId` is optional for future assets; the renderer assigns one when absent. Source/credit belongs to each asset, not to the project globally.

`sources` records repository/approved content provenance; named official sources awaiting curation deliberately have no guessed URL. `notes` holds editorial caveats and future photo/drawing credits and is not displayed publicly. Final photography from Hild und K, zillerplus, Märzo or Borja Solórzano still needs asset selection and permission/credit confirmation per image. No speculative descriptions were added; the existing Wolf description remains explicitly provisional.

## LOG

Each entry supports `number`, `published`, translated or neutral `title`/`location`, `date` or `year`, `category`, `images`, direct `src`/dimensions, `credit`, `sourceUrl` and optional `text`/`notes`. Captions use `PLACE · YEAR / CATEGORY`; categories keep the site's existing language translations. Add real image metadata to `images.js` and reference its ID in `images`, or use a direct local `src` with width/height. Keep numbers stable. Publish reserved entry 052 only after its actual photograph exists.

## Validation

Run `node tests/content.cjs` and `node tests/log-field.cjs` with Playwright available through `NODE_PATH` and installed Edge. Content tests serve the repository locally and also check direct file entry points. The LOG suite covers the existing mouse, touch, zoom, wheel, rail, language rebuild and reduced-motion behavior.
