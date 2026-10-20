---
name: church-communications-cms
description: "Trigger: actualizar sitio web iglesia, subir fotos galeria, programa de culto, horarios, liderazgo, calendario, transmisiones en vivo. Manage all 7 public website sections via CMS API."
license: Apache-2.0
metadata:
  author: "javierhuerta"
  version: "1.0"
---

## Activation Contract

Activate when the user asks to read or update content on the Iglesia Adventista Central Osorno public website (`adventistascentralosorno.cl`):
- **Inicio** (`home`): hero text/photos, verse, schedule summary, social links, footer CTA, contact info
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
| Manage Board Leaders or Board Photo | Use `cms-cli.mjs leaders list|create|update|delete|upload-photo|upload-board-photo` |
| Manage Weekly Schedule | Use `cms-cli.mjs schedule get-texts|update-texts|list|create|update|delete` |
| Create/Edit/Publish Calendar Event | Use `cms-cli.mjs calendar list|create|update|publish|upload-cover` |
| Prepare or Publish Sabbath Worship Program | Use `cms-cli.mjs worship templates|hymns|list|get|create|update|update-section|publish` |
| Create Album or Upload Gallery Photos | Use `cms-cli.mjs gallery albums|create-album|upload-image|update-image|publish-album` |
| Manage Live Stream or YouTube Sermons | Use `cms-cli.mjs live get-config|update-config|force-check|sermons|sync-sermons|create-sermon|publish-sermon` |

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
