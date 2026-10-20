# API Endpoints & Payloads — Church Communications CMS

All admin endpoints require header `X-API-Key: <CHURCH_API_KEY>` (or `Authorization: ApiKey <CHURCH_API_KEY>`).
Base URL defaults to `https://adventistascentralosorno.cl` (all paths below are under `/api/...`).

---

## 1. Inicio (`home`)

- `GET /api/site-config/home` — Get current Home config
- `PUT /api/site-config/home` — Update Home texts (partial JSON):
  ```json
  {
    "heroTitle": "Una comunidad de fe",
    "heroTitleAccent": "esperanza y amor",
    "heroSubtitle": "Iglesia Adventista Central Osorno",
    "verseText": "Porque yo sé los pensamientos que tengo acerca de vosotros...",
    "verseReference": "Jeremías 29:11",
    "scheduleTitle": "Nuestras reuniones",
    "scheduleSubtitle": "Te esperamos cada semana",
    "facebookUrl": "https://facebook.com/...",
    "instagramUrl": "https://instagram.com/...",
    "youtubeUrl": "https://youtube.com/...",
    "footerCtaTitle": "¿Primera vez que nos visitas?",
    "footerCtaSubtitle": "Conoce nuestros horarios y ubicación",
    "footerCtaButtonText": "Ver horarios",
    "contactAddress": "Andrés Bello 748",
    "contactCity": "Osorno, Chile",
    "contactEmail": "contacto@adventistascentralosorno.cl",
    "contactPhone": "+56 64 ..."
  }
  ```
- `POST /api/site-config/home/images/:slot` — `multipart/form-data` (`file`), where `:slot` is `main`, `small`, or `next-service`.

---

## 2. Liderazgo (`leaders`)

- `GET /api/site-config/leaders` — List board leaders (`principal_leaders`)
- `POST /api/site-config/leaders` — Create leader:
  ```json
  {
    "role": "Pastor Distrital",
    "name": "Pr. Daniel Cárcamo",
    "sortOrder": 0,
    "isActive": true
  }
  ```
- `PATCH /api/site-config/leaders/:id` — Update leader (`role`, `name`, `sortOrder`, `isActive`)
- `DELETE /api/site-config/leaders/:id` — Delete leader
- `POST /api/site-config/leaders/:id/photo` — `multipart/form-data` (`file`) portrait upload
- `GET /api/site-config/leadership/board-photo` — Get group photo URL
- `POST /api/site-config/leadership/board-photo` — `multipart/form-data` (`file`) board group photo
- `GET /api/site-config/ministries` — List ministries & directors (derived from departments)

---

## 3. Horarios (`schedule`)

- `GET /api/site-config/schedule/texts` — Get page header texts (`{ kicker, title, paragraph }`)
- `PATCH /api/site-config/schedule/texts` — Update page header texts
- `GET /api/site-config/schedule` — List all schedule items
- `POST /api/site-config/schedule` — Create schedule item:
  ```json
  {
    "dayLabel": "Sábado",
    "dayAccent": true,
    "time": "09:45",
    "title": "Escuela Sabática",
    "description": "Estudio bíblico en grupos.",
    "sortOrder": 0,
    "isActive": true
  }
  ```
- `PATCH /api/site-config/schedule/:id` — Update schedule item
- `PATCH /api/site-config/schedule/reorder` — Bulk reorder (`{ "items": [{ "id": "uuid", "sortOrder": 0 }] }`)
- `DELETE /api/site-config/schedule/:id` — Delete schedule item

---

## 4. Calendario (`calendar`)

- `GET /api/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=50` — List events
- `POST /api/calendar` — Create event (starts in `draft` status):
  ```json
  {
    "title": "Sábado Joven Especial",
    "description": "<p>Invitado especial...</p>",
    "startDate": "2026-10-24T11:00:00.000Z",
    "endDate": "2026-10-24T12:30:00.000Z",
    "eventType": "local",
    "location": "Templo Central · Andrés Bello 748",
    "departmentId": null,
    "organizers": [{ "displayName": "Comunicaciones" }]
  }
  ```
  (`eventType`: `"local"` | `"asach"` | `"distrital"`)
- `PATCH /api/calendar/:id` — Update event fields
- `POST /api/calendar/:id/publish` — Publish event (`status: "published"`)
- `POST /api/calendar/:id/archive` — Archive event
- `POST /api/calendar/:id/cover` — `multipart/form-data` (`file`) upload 16:9 cover image
- `POST /api/calendar/:id/attachments` — `multipart/form-data` (`file`, optional `isCover=true`)
- `DELETE /api/calendar/:id` — Delete event

---

## 5. Programa de Culto (`worship`)

- `GET /api/worship-services/templates` — List templates (find the Sabbath Worship template `id`)
- `GET /api/hymns?q=<query>` — Search hymns by number or title
- `GET /api/worship-services/programs?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD` — List programs
- `GET /api/worship-services/programs/:id` — Get full program with `groups` and `sections`
- `POST /api/worship-services/programs` — Create program from template:
  ```json
  {
    "templateId": "uuid-of-template",
    "date": "2026-10-24",
    "title": "Culto Divino",
    "preacher": "Pr. Daniel Cárcamo",
    "theme": "No se preocupen por la vida",
    "scripture": "Mateo 6:25-34"
  }
  ```
- `PATCH /api/worship-services/programs/:id` — Update program metadata (`date`, `title`, `preacher`, `theme`, `scripture`)
- `PATCH /api/worship-services/programs/sections/:sectionId` — Update a section:
  ```json
  {
    "name": "Himno inicial",
    "startTime": "11:05",
    "duration": 5,
    "responsible": "Familia Rojas",
    "hymnText": "Himno #125 — Gran Dios",
    "notes": "Congregación de pie"
  }
  ```
- `POST /api/worship-services/programs/:id/publish` — Publish program to the website
- `POST /api/worship-services/programs/:id/publish-with-event` — Publish and optionally create calendar event (`{ "createCalendarEvent": true }`)

---

## 6. Galería (`gallery`)

- `GET /api/gallery/config` / `PATCH /api/gallery/config` — Gallery page header config
- `GET /api/gallery/albums` — List all albums
- `GET /api/gallery/albums/:id` — Get album with images
- `POST /api/gallery/albums` — Create album:
  ```json
  {
    "title": "Bautismos Primavera 2026",
    "description": "Sábado especial de bautismos",
    "eventDate": "2026-10-17",
    "showOnHome": false
  }
  ```
- `PATCH /api/gallery/albums/:id` — Update album (`title`, `description`, `eventDate`, `showOnHome`, `coverImageUrl`)
- `PATCH /api/gallery/albums/:id/publish` — Toggle publish/unpublish album
- `POST /api/gallery/albums/:id/images` — `multipart/form-data` (`file`) upload image to album
- `PATCH /api/gallery/images/:id` — Update image (`caption`, `order`, `isPublished`)
- `PATCH /api/gallery/images/:id/publish` — Toggle publish/unpublish image
- `DELETE /api/gallery/images/:id` — Delete image

---

## 7. En Vivo / Transmisiones (`live`)

- `GET /api/transmisiones/config` — Get YouTube channel & live detection config
- `PATCH /api/transmisiones/config` — Update config (e.g. `{ "isLiveManual": true }` to turn on "EN VIVO AHORA" badge)
- `POST /api/transmisiones/force-check` — Force immediate YouTube live detection check
- `POST /api/transmisiones/sermons/sync` — Sync latest sermons from YouTube RSS feed
- `GET /api/transmisiones/sermons` — List all sermons (admin)
- `POST /api/transmisiones/sermons` — Create sermon video:
  ```json
  {
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "El poder de la esperanza",
    "preacher": "Pr. Daniel Cárcamo",
    "reference": "Romanos 15:13",
    "date": "2026-10-17",
    "isPublished": true
  }
  ```
- `PATCH /api/transmisiones/sermons/:id` — Update sermon
- `PATCH /api/transmisiones/sermons/:id/publish` — Toggle publish/unpublish sermon
- `DELETE /api/transmisiones/sermons/:id` — Delete sermon
