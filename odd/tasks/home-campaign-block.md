# Home campaign block ("Campaña destacada")

Objective: configurable featured-campaign block on the public home page with two layouts (A band below hero, B campaign takes the hero), manageable from the admin and the CMS skill. Branch: `feat/home-campaign-block` (from `development`). Delivery: work-unit commits, PR to `development`. Runners: `backend` Jest (`npx jest src/modules/site-config`), `node website/scripts/verify-integration.mjs`, frontend `tsc`.

## Specs

- S1 — Home block linking the campaign site: "me gustaria en el inicio hacer algo al respecto para enlazar el sitio regresiva.adventistascentralosorno.cl ya que estamos en la semana de evangelismo pero seria bueno que eso apareciera al inicio del sitio de la iglesia quizas poner el video de invitacion algunas fotos de los globos o lo que fue repartir los libros". Block has: kicker, title, title accent, text, primary CTA (text + URL), optional secondary CTA, invitation video (YouTube link or direct .mp4/.webm file with optional poster — L8), photos (from a gallery album), optional countdown (target datetime + label), visibility window (start/end), enabled flag.
- S2 — Two layouts supported by the site: "yo creo que podemos trabajar con a y b que el sitio soporte esta combinacion". A = `band` (band right below the regular hero, prototype board "A · Banda de campaña bajo el hero"); B = `hero` (campaign replaces the top of the page, regular hero moves below, prototype board "B · La campaña toma el hero"). Prototype: https://claude.ai/artifact/JDcen5BHm3AHhXmxdBcWX5
- S3 — Skill support: "habria que actualizar la skill tambien para manejar ese bloque" and "que la skill igual ayude a decidir dependiendo de la necesidad del usuario". The skill documents the fields, gives a CLI path to configure/upload, and a decision guide for choosing `band` vs `hero`.
- S4 — Current campaign configured with layout B: "yo creo que por esta campaña dejaria la b configurada". Applying to production requires the deploy (user's decision) and the real video URL/photos.
- S5 — Fix skill doc: album `showOnHome` does not exist; the real mechanism is gallery config `homeAlbumId`.

## Tasks

- T1 — S1,S2: backend settings keys, admin/public DTOs, public `campaign` (null when disabled/out of window), photos from album, YouTube embed URL, tests. Route: inline. Status: done — 42f5b25 (jest site-config: campaign tests green; 5 pre-existing controller-spec failures unchanged at baseline).
- T2 — S1,S2: website `PageInicio` renders `band`/`hero` layouts; docs `website/INTEGRATION.md`. Route: inline. Status: done — 1ccb8b5, 8f0cc87 (verify-integration OK; manual preview hero/band/none, 1440 + 390px, dark theme).
- T3 — S1: admin form section "Campaña destacada" + generated API model fields. Route: inline. Status: done — 3ee490c (5/5 vitest; tsc OK; 12 pre-existing home-config-form.test failures unchanged).
- T4 — S3,S5: skill (SKILL.md decision guide, api-endpoints.md, cms-cli `home campaign` helpers), synced to `.opencode`, `.claude`, `.agents` copies. Route: inline. Status: done — 2e61ebb (includes pre-existing uncommitted .env loading in cms-cli).
- T5 — S4: configure campaign B in production after deploy (needs user's video URL/photos + deploy). Route: inline. Status: pending (blocked on deploy).

## Log

- L1 (2026-10-20) — "Quiero ver si la skill funciona para actualizar el sitio de la iglesia o si tenemos que hacer algunos ajustes, por ejemplo me gustaria en el inicio hacer algo al respecto para enlazar el sitio regresiva.adventistascentralosorno.cl ya que estamos en la semana de evangelismo pero seria bueno que eso apareciera al inicio del sitio de la iglesia quizas poner el video de invitacion algunas fotos de los globos o lo que fue repartir los libros"
- L2 (2026-10-20) — "si seria bueno el bloque campaña destacada y habria que actualizar la skill tambien para manejar ese bloque, lo otro es que igual podriamos pensar en 2 o 3 diseños de inicio [...] me gustaria ver la idea de prototipo antes de avanzar". Prototype published with A/B/C.
- L3 (2026-10-20) — "yo creo que podemos trabajar con a y b que el sitio soporte esta combinacion y que la skill igual ayude a decidir dependiendo de la necesidad del usuario entonces el sitio soportaria estas 2 combinaciones. avancemos."
- L4 (2026-10-20) — "yo creo que por esta campaña dejaria la b configurada"
- L5 — Campaign facts (from regresiva site): "Cuenta Regresiva · El amanecer de un nuevo tiempo", Seminario profético con el Pr. Israel Jaramillo, 21 al 24 de octubre, nightly 19:30, Sáb 24 11:00 culto de cierre. Seminar starts 2026-10-21 19:30 (UTC-3).
- L6 (2026-10-20) — User sent WhatsApp zips + temple photo: "aqui hay fotos del evento del sabado donde se repartieron globos para que escogas las mejores fotos". Selected 8 photos (EXIF stripped) in scratchpad `fotos-globos/seleccion/`: 01 templo libros y globos, 02 grupo globos exterior, 03 padre bebé libro globo, 04 entrega en tienda, 05 niño libros globos, 06 grupo calle globos, 07 oración por los libros, 08 entrega en la calle.
- L7 — Independent verifier launched for risk item 6 (website rendering has no automated tests). Pending result.
- L8 (2026-10-20) — "dale con subir a produccion no mas el link de la invitacion no es un video de youtube es un video que hicimos aca con hyperframes". Video found published at https://regresiva.adventistascentralosorno.cl/video/invitacion.mp4 (720x1280, 56 s) with poster invitacion.webp. S1 updated; T1–T4 reopened and closed in the direct-video commit. Verifier (L7) result: no blockers, S1/S2/S3/S5 pass; advisory 1 (URLs without protocol) fixed in 2c8424b.
- L9 — Deploy to production authorized by user (L8).
