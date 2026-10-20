---
name: church-communications-cms
description: "Trigger: actualizar sitio web iglesia, campaña destacada en el inicio, semana de evangelismo, subir fotos galeria, programa de culto, horarios, liderazgo, calendario, transmisiones en vivo. Manage all 7 public website sections via CMS API, including the home campaign block with 2 layouts (hero / band)."
license: Apache-2.0
metadata:
  author: "javierhuerta"
  version: "1.2"
---

## Activation Contract

Activate when the user asks to read or update content on the Iglesia Adventista Central Osorno public website (`adventistascentralosorno.cl`):
- **Inicio** (`home`): hero text/photos, verse, schedule summary, social links, footer CTA, contact info, and the **Campaña destacada** block (evangelism week, special event, campaign site link, invitation video, photos, countdown)
- **Liderazgo** (`leaders`): board members (`principal_leaders`), leader portraits, board group photo, ministries
- **Horarios** (`schedule`): page texts (`kicker`, `title`, `paragraph`) and weekly service items
- **Calendario** (`calendar`): create, update, publish, archive events, and upload event covers/attachments
- **Programa de Culto** (`programs`): create Sabbath program from template, edit sections/hymns/preacher/theme/scripture, and publish
- **Galería** (`gallery`): create/publish photo albums, upload/caption/reorder/publish images
- **En Vivo / Transmisiones** (`transmisiones`): toggle live status, sync YouTube sermons, create/edit/publish sermons

## Hard Rules

- Require `CHURCH_API_KEY` (`ch_cms_...`) and optional `CHURCH_API_URL` (defaults to `https://adventistascentralosorno.cl`). Never hardcode or commit the API key.
- Prefer running `node <skill-dir>/assets/cms-cli.mjs` over ad-hoc `curl` commands; it handles `X-API-Key` headers, JSON serialization, and `multipart/form-data` image uploads.
- Read current state before mutating (`get` / `list` first) so partial updates do not clobber existing fields.
- Before publishing a worship program or event, confirm key details (date, preacher, title, or album name) if the user's prompt was ambiguous.
- Consult `references/api-endpoints.md` for exact DTO fields and payload shapes.

## Decision Gates

| User Intent | Action |
|---|---|
| Update Hero, Verse, Contact, or Home images | Use `cms-cli.mjs home get` / `home update` / `home upload-image <slot> <file>` |
| Feature a campaign/event on the home page | Follow **Campaña destacada** below; `home campaign-set '<json>'`, `home campaign-on`, `home campaign-off` |
| Choose the home "Momentos" album | `gallery update-config '{"homeAlbumId":"<uuid>"}'` (albums have no `showOnHome` field) |
| Manage Board Leaders or Board Photo | Use `cms-cli.mjs leaders list|create|update|delete|upload-photo|upload-board-photo` |
| Manage Weekly Schedule | Use `cms-cli.mjs schedule get-texts|update-texts|list|create|update|delete` |
| Create/Edit/Publish Calendar Event | Use `cms-cli.mjs calendar list|create|update|publish|upload-cover`; see **Calendario** rules below |
| Suspend / cancel a calendar event | `calendar archive <id>` (reversible; never `delete` unless the user asks to erase it) |
| Prepare or Publish Sabbath Worship Program | Use `cms-cli.mjs worship templates|hymns|list|get|create|update|update-section|publish` |
| Create Album or Upload Gallery Photos | Use `cms-cli.mjs gallery albums|create-album|upload-image|update-image|publish-album|reorder`; see **Fotos** rules below |
| Manage Live Stream or YouTube Sermons | Use `cms-cli.mjs live get-config|update-config|force-check|sermons|sync-sermons|create-sermon|publish-sermon` |

## Campaña destacada (Inicio con 2 diseños)

The home page has an optional featured campaign block. When it is off (or outside its dates) the home page looks as usual. It has **two layouts**:

| | `hero` — "La campaña ocupa el inicio" (diseño B) | `band` — "Banda bajo el hero" (diseño A) |
|---|---|---|
| Where | First block of the page; the regular hero ("Central Osorno") moves below | Right below the regular hero |
| Title | Big h1 + 4-box countdown (días/horas/min/seg) | h2 + one-line countdown |
| Media | Video on the right (vertical 9:16 files keep their shape) | Same |
| Photos | With video: mosaic 1 large + 4 (first 5 photos). Without video: photo 1 replaces the video, then a strip of the next 4 | Without video: photo 1 replaces the video + 2 more. With video: strip of 3 |
| Use when | THE event of the week (evangelism week, baptism, special Sabbath), happening now or within days, with a short end date and a video or strong photos | Relevant but not the main message (registrations, campaign running for weeks, event still weeks away), or the regular hero must stay first |

Ask the user only when the intent is unclear; otherwise recommend one layout and say why.

Workflow:
1. `home get` and keep the current `campaign*` values (partial updates are safe; `campaign-set` rejects non-campaign fields).
2. Photos: create or reuse a gallery album (`gallery create-album`, `gallery upload-image <albumId> <file>`), set a caption and publish each image with `gallery update-image <imageId> '{"caption":"...","isPublished":true}'` — uploads start unpublished. The album may stay unpublished (campaign only) or be published to also appear in Galería.
3. Choose which photos appear on the home page by **order**, not by unpublishing: the block uses the first published images by `sortOrder` (5 for `hero`, 3 for `band`). Use `gallery reorder <albumId> '{"images":[{"id":"...","sortOrder":0}, ...]}'` or `update-image <id> '{"sortOrder":N}'`.
4. `home campaign-set '<json>'` with layout, texts, CTA URLs (absolute `https://`), video, `campaignAlbumId`, countdown and the visibility window (`campaignEndsAt` = end of the last day, so it hides itself). Video: a YouTube link, or a public `.mp4`/`.webm` file plus `campaignVideoPosterUrl` (e.g. a HyperFrames render). When the file is replaced under the same name, bump a `?v=<date>` query on both URLs so browsers fetch the new version.
5. Confirm the visible copy with the user before `home campaign-on` if it was not stated explicitly.
6. Verify `GET /api/public/home` → `campaign` is not `null` and has the expected `layout`, `videoEmbedUrl` or `videoFileUrl`, and the first `photos`.

## Fotos

- Strip metadata (EXIF/GPS) before uploading phone or WhatsApp photos; re-save as JPEG at most 1600 px on the long side.
- Do not put the same scene twice; prefer variety (group, delivery, people with the book, prayer).
- People and minors: when the user says a person or family should not be featured, keep them out of the home page by order and ask before publishing them in Galería. Never name people in captions or event texts without being told to.
- Galería shows every photo uncropped with its own proportions, so no manual cropping is needed.

## Calendario

- Suspended or cancelled events: `calendar archive <id>` (it disappears from the public site and can be republished). Rescheduled events: `calendar update` the dates and description, then `calendar publish`.
- The public calendar shows an event only on its **start day**. For a series (evangelism week, nightly seminar) create one event per day, each with its own theme, instead of one multi-day event.
- Times are ISO 8601 UTC. Chile (Osorno) is UTC-3 from September to April and UTC-4 otherwise; 19:30 local in October = `22:30:00.000Z`.
- Covers are 16:9 (`calendar upload-cover`). For portrait flyers, center them on a 1600×900 canvas with the flyer background color instead of cropping.
- From a Junta Directiva acta, publish only public activities (events, date changes, suspensions); member transfers, removals, reports and resignations are internal.

## Execution Steps

1. Verify `CHURCH_API_KEY` is set in the environment (or `.env` in working directory). If missing, ask the user for their API key generated from `/admin/mantenedores/usuarios`.
2. Read `references/api-endpoints.md` when constructing JSON payloads for `create` or `update` subcommands.
3. Run `node <skill-dir>/assets/cms-cli.mjs <section> <action> [args]` to inspect current state and apply changes.
4. Verify the change against the returned JSON or public endpoint (`GET /api/public/*`).

## Output Contract

Return:
- Section and item updated (including IDs, titles, and publication status).
- Public visibility status (`published` vs `draft`).
- Direct summary of fields or images modified.

## References

- `references/api-endpoints.md` — Complete endpoint map, DTO schemas, and examples for all 7 website sections.
- `assets/cms-cli.mjs` — Zero-dependency Node.js 18+ CLI for JSON and multipart/form-data requests.
