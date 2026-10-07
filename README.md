# Carlos Moya — personal archive

Open `index.html` directly in a browser. No installation, build step or server is required. JavaScript must be enabled.

## Content and languages

Edit `scripts/content-data.js`. It contains:
- `navigation`: shared destinations and keyboard keys;
- `ui.en`, `ui.de`, `ui.es`: interface text;
- `work` and `education`: CV chronology;
- `projects`: project records;
- `tools`: practice, training and exploration;
- `images`: image metadata.

Translated values use `{ en: '…', de: '…', es: '…' }`. Proper project names stay unchanged. `scripts/i18n.js` stores the selected language locally; English is the initial default. The HTML language, page title and accessibility labels follow the selection.

The professional source is Carlos Moya_CV DE_A4_2607_s.pdf. Individual project dates are omitted where the CV does not supply them. Wolf's 2021–2026 period and completed status come from previously supplied information. Its description is explicitly marked `descriptionProvisional: true`. No personal contact details from the CV are published.

## Add a project

Add a record to the `projects` array in the final part of `content-data.js`. Use a unique `id`, `name`, translated `location`, `type` and `role`. Optional fields: `period`, `lph`, `area` (number), `areaKey` (`gfa`, `livingArea`, `complexArea` or `area`), `value` (EUR number), `valueGreaterThan` (optional), `valueKey`, `statusKey`, `descriptionKey`, `descriptionProvisional`, `images` and `previewImage`.

Leave unknown fields out. The order of the array determines the archive and next-project navigation. Each record automatically opens `pages/project.html?id=YOUR-ID`. An optional `url` selects a dedicated page; Wolf retains `pages/wolf-besucherzentrum.html`.

## Add a real image

Export three WebP files preserving the original proportion, for example:

```
assets/images/projects/wolf-besucherzentrum/project-01-800.webp
assets/images/projects/wolf-besucherzentrum/project-01-1600.webp
assets/images/projects/wolf-besucherzentrum/project-01-2400.webp
```

The suffix is the exported width in pixels. Do not upscale small originals: adapt both the available widths and the `srcset` in `content.js` if necessary.

In `images`, assign a unique image key, the `base` path without size suffix or extension, real `width` and `height` (same aspect ratio as all exports), descriptive `alt` in all three languages, and `available: true`. Add that key to the project's ordered `images` array. The first image becomes the eager-loaded hero; subsequent images load lazily. No layout change is required for more images or different proportions.

Before photographs exist, `available: false` renders a clearly identified placeholder without attempting missing files. Replace the provisional image dimensions when uploading the actual exports. No artificial images are included.

## Assign a hover photograph

Set a project's `previewImage` to one image key from `images`. The preview shows just that image when hovering over the project name on devices with a precise pointer. Without an available image it shows a placeholder. Touch navigation works without hover.

## Shared behavior and styling

`site-shell.js`: header, language selector and keyboard help.
`shortcuts.js`: 1–6, C, M, ?, Escape; ignores typing fields and modified keystrokes.
`theme.js`: system theme until a manual preference is saved.
`project-gallery.js`: native-dialog lightbox, focus return, X/outside/Escape.
`project-preview.js`: fixed floating preview clamped inside the viewport.
`content.js`: shared page renderer and responsive image markup.

`styles/tokens.css` contains the monochrome palette, fonts, text sizes, spacing and opacity transition durations. Media-query breakpoints repeat the documented values because CSS custom properties cannot be used as media conditions. Reduced-motion sets transition durations to zero.

## Backup

The original 19-file site was copied to `backups/pre-content-redesign/site/` in the workspace before edits, with identical file hashes checked. It has been preserved. No Git repository or permissions were modified.

## Review limitations

Code checks cover the shared destinations, language dictionaries, rendering, keyboard handlers, theme persistence, responsive-image markup and dialog behavior using a simulated DOM. Final visual review and a real browser console check must be done in your browser: the current automated browser does not permit opening this local site. Simulated checks do not establish visual correctness.


## Files in this revision

New: `README.md`, `pages/project.html`, `scripts/content-data.js`, `scripts/content.js`, `scripts/i18n.js`, `scripts/project-preview.js`.

Modified:
- `index.html`
- `pages/current.html`, `pages/work.html`, `pages/projects.html`, `pages/about.html`, `pages/log.html`, `pages/tools.html`, `pages/contact.html`, `pages/wolf-besucherzentrum.html`
- `scripts/theme.js`, `scripts/site-shell.js`, `scripts/shortcuts.js`, `scripts/project-gallery.js`
- `styles/tokens.css`, `styles/base.css`, `styles/layout.css`, `styles/components.css`
- `assets/images/projects/wolf-besucherzentrum/README.txt`

The original empty `assets/images/site/.gitkeep` is unchanged. Scratch checks and a backup manifest are in `work/`, outside the delivered site.

## Interior visual revision — 7 October 2026

Section headings are small number/title interface labels. Interior text is approximately 12.5 px, with a narrow column aligned beneath the section label. Work and Projects remain chronological text lists. The home menu's size, spacing and placement are unchanged. Corner utilities use the same small muted treatment throughout; interior pages now also display the practice line and copyright persistently.

Current contains three factual rows. About keeps a short profile, languages (Spanish Native, German C2, English C1), education and experience; software remains in Tools.

### Add an observation to LOG

The final temporary Pexels block in `scripts/content-data.js` currently supplies nine clearly labelled layout samples. Remove that block to restore the empty LOG before adding real observations. Sources, credits and removal instructions are in [assets/images/placeholders/README.md](assets/images/placeholders/README.md). Add a real record with:

```
{
  number: '001',
  title: { en: '…', de: '…', es: '…' },
  location: { en: '…', de: '…', es: '…' }, // optional
  date: '2026',
  category: 'SITE',
  images: ['your-image-key'],
  text: { en: '…', de: '…', es: '…' } // optional
}
```

Use one of SITE, ARCHITECTURE, DETAIL, MATERIAL, DESIGN, OBJECT, PROCESS, REFERENCE. Category names translate automatically. Keep the number stable when reordering entries. Images use the same WebP metadata and lightbox as project images, with natural proportions and lazy loading. Entries need no article, teaser or Read more link.

Files changed in this visual revision: `styles/layout.css`, `styles/components.css`, `scripts/content.js`, `scripts/content-data.js`, `README.md`. No new pages or dependencies.

## Overlay interaction revision

Navigation is now controlled by `scripts/view-controller.js`, using `body[data-view]`. `content.js` retains the existing content renderer and image helpers, exposing markup to the controller. No sections are fetched or loaded as new documents during normal navigation. Legacy HTML entry points remain directly usable and initialize the same app with the appropriate section open.

Home and sections cross-fade for 500 ms. Content text has a 400 ms / 50 ms stagger; architectural images remain still. Visibility is delayed until fades finish, and inert states prevent hidden controls receiving input. On first initialization only, the page fades for 400 ms after a 100 ms delay. Reduced-motion removes movement, delays and fades.

Close, Escape and the top-left section identifier use the same `closeSection()` function. Close is fixed at the bottom right of the viewport-sized view. The modal section traps keyboard focus, remembers the opener and restores focus after the close fade. Language changes retain the current section and its scroll position; ES / DE / EN are directly visible buttons with active state. Shared utilities live inside the active modal and return to the header when closing.

The bottom-left identity is always exactly `Independent Practice · Valencia · Munich`. Home copyright is exactly `© 2026 Carlos Moya`. Numeric shortcuts are disabled while a section is active; M retains the existing theme toggle; Escape dismisses a lightbox/help first, then the section. Hash navigation supports history and direct view links without document reloads.

Desktop locks the outer viewport and scrolls only the view's content pane. Mobile supports touch scrolling in the content pane and document scrolling for a short home viewport. The optional `.featured-reveal` / `.is-revealed` clip-path class is defined but not assigned to any current image.

Files changed: `index.html`; every existing `pages/*.html` entry point; `scripts/content.js`, `scripts/site-shell.js`, `scripts/shortcuts.js`, `scripts/theme.js`, `scripts/project-preview.js`; all four `styles/*.css`; this README. New file: `scripts/view-controller.js`.

Validation: `work/check-overlays.cjs` checks script syntax, all index destinations, all three section close methods, language retention, fixed identity, Escape priority, M, help, disabled numeric navigation, modified/typing keystrokes, focus restoration and trapping, interrupted transitions, legacy direct entries, links, responsive scroll declarations, and reduced-motion timing in a simulated DOM. Real browser visual, scroll and assistive-technology verification remain unavailable in this session due to the local-browser access restriction. These simulated checks are not a substitute for that review. The original backup remains untouched.
