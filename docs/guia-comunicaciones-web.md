# Guía de Operación Web para Comunicaciones (Contenidos + Diseño con Claude)

Esta guía documenta los dos flujos de trabajo habilitados para el encargado de Comunicaciones de la **Iglesia Adventista Central de Osorno** (`adventistascentralosorno.cl`):

1. **Frente 1 — Operación diaria de contenidos (sin tocar código)**: publicar fotos en la galería, actualizar programas de culto, crear eventos en el calendario, cambiar textos/imágenes de inicio, horarios, liderazgo o transmisiones usando su **Agente Claude + API Key** (o directamente desde `/admin`).
2. **Frente 2 — Ajustes de diseño del sitio público vía Pull Requests**: proponer mejoras visuales en `website/` usando su cuenta **Claude Pro (Claude Code)**, validadas automáticamente por GitHub Actions y revisadas por `@javierhuerta` antes de pasar a Staging (`development`) y Producción (`main`).

---

## Parte 0 — Configuración inicial (Administrador `@javierhuerta`)

### 1. Ejecutar la migración en la base de datos
En el contenedor `backend` de Dokploy (o local):
```sh
sh entrypoint.sh migrate
```
Esto agrega el valor `'Comunicaciones'` a `users_role_enum` y crea la tabla `api_keys`.

### 2. Crear usuario y generar su API Key desde `/admin`
1. Ingresar a `/admin/mantenedores/usuarios`.
2. Crear o editar el usuario del encargado de Comunicaciones y asignarle el rol **Comunicaciones**.
   - Este rol tiene permiso sobre las **7 secciones del sitio público** (`inicio`, `liderazgo`, `horarios`, `calendario`, `programa`, `galeria`, `envivo`), y **no** tiene acceso a Usuarios, Misión ni Documentos internos.
3. En la misma pantalla de edición del usuario, bajar a la tarjeta **"Claves de API (Agentes / Integraciones)"**:
   - Hacer clic en **Generar clave**, asignarle un nombre identificatorio (ej. `Claude Code - Encargado Comunicaciones`) y copiar la clave `ch_cms_...` (se muestra en texto plano una única vez).
   - Si en algún momento cambia de computador o de encargado, basta con pulsar el ícono de **Revocar** junto a la clave y generar una nueva.

### 3. Proteger las ramas en GitHub (`Settings → Branches`)
Crear una regla de protección (Branch Protection Rule / Ruleset) para `development` y `main`:
- Activar **Require a pull request before merging** (1 aprobación requerida).
- Activar **Require review from Code Owners** (usa `.github/CODEOWNERS`, donde `@javierhuerta` es dueño de todo el repositorio).
- Activar **Require status checks to pass before merging** → seleccionar el job `Verify Website Integration & JSX Syntax`.

---

## Parte 1 — Gestión diaria de contenidos con Claude (Frente 1)

El encargado de Comunicaciones puede pedirle a su agente (Claude Code o Claude Desktop) que actualice cualquier sección del sitio conversando en lenguaje natural.

### 1. Instalar la Skill `church-communications-cms`
Copiar la carpeta `.claude/skills/church-communications-cms` del repositorio dentro de `~/.claude/skills/church-communications-cms` en el computador del encargado:

```bash
mkdir -p ~/.claude/skills
cp -r .claude/skills/church-communications-cms ~/.claude/skills/
```

### 2. Configurar las variables de entorno en su terminal
En `~/.zshrc` o `~/.bashrc` del encargado:

```bash
export CHURCH_API_URL="https://adventistascentralosorno.cl/api"
export CHURCH_API_KEY="ch_cms_pegar_aqui_su_clave_personal"
```

Para verificar que la conexión funciona:
```bash
node ~/.claude/skills/church-communications-cms/assets/cms-cli.mjs whoami
```

### 3. Ejemplos de solicitudes que puede hacerle a su Agente Claude

| Sección | Ejemplo de prompt para Claude |
|---------|-------------------------------|
| **Inicio** | *"Cambia el anuncio del banner superior de inicio a 'Semana de Oración Joven — 19:30 hrs' y actualiza la foto principal del hero con `~/Fotos/portada-primavera.jpg`"* |
| **Liderazgo** | *"Actualiza la foto grupal de la junta directiva con `~/Fotos/junta-2026.jpg`"* |
| **Horarios** | *"En la página de horarios, cambia la hora de Sociedad de Jóvenes del sábado a las 17:30"* |
| **Calendario** | *"Crea y publica un evento en el calendario para el sábado 14 de noviembre de 16:00 a 18:00 llamado 'Concierto Coral de Gratitud' en el Templo Central con el afiche `~/Fotos/concierto.jpg`"* |
| **Programa** | *"Muéstrame el programa de culto de este sábado, asigna como predicador al Pr. Juan Pérez con el tema 'La Esperanza Viva' (Apocalipsis 21:1-5) y publícalo"* |
| **Galería** | *"Crea un álbum publicado en la galería llamado 'Bautismos Primavera 2026', sube estas 4 fotos de `~/Fotos/bautismo/` y déjalo como el álbum destacado en el inicio"* |
| **En Vivo** | *"Sincroniza las últimas predicaciones desde el canal de YouTube o agrega el video `https://www.youtube.com/watch?v=...` como predicación publicada"* |

---

## Parte 2 — Ajustes de diseño del sitio público con Claude Code y PRs (Frente 2)

Cuando el encargado quiera proponer un cambio visual en el sitio (ajustar tipografías, espaciados, tarjetas, colores o layout de alguna sección), puede hacerlo con **Claude Code** siguiendo este flujo ágil y seguro:

### 1. Preparar una rama de diseño desde `development`
Dentro del repositorio clonado:

```bash
git checkout development
git pull origin development
git checkout -b design/mejora-tarjetas-inicio
```

### 2. Pedir el cambio a Claude Code
Al abrir `claude` en la carpeta del proyecto, Claude leerá automáticamente el archivo [`website/CLAUDE.md`](../website/CLAUDE.md), el cual le indica:
- Que **solo** debe tocar archivos visuales dentro de `website/` (`styles.css`, `ui.jsx`, `pages-1.jsx` a `pages-5.jsx`).
- Que **nunca** debe borrar los llamados a `window.IASD_API` ni romper el modo oscuro (`[data-theme="dark"]`) o las clases responsive mobile.

### 3. Verificar antes de subir
El encargado (o el propio Claude Code automáticamente) ejecuta:

```bash
node website/scripts/verify-integration.mjs
```

Si responde `✅ Verificación exitosa`, todos los enlaces con el backend siguen intactos.

### 4. Subir la rama y abrir el Pull Request hacia `development`
```bash
git add website/
git commit -m "style(website): ajustar diseño de tarjetas en inicio"
git push -u origin design/mejora-tarjetas-inicio
```
Luego abre el Pull Request en GitHub eligiendo:
- **base**: `development` ← **compare**: `design/mejora-tarjetas-inicio`

### 5. Revisión ágil y paso a Producción (`@javierhuerta`)
1. GitHub Actions ejecuta automáticamente `.github/workflows/website-pr-check.yml` (verifica todos los contratos `window.IASD_API` y valida que todos los archivos `.jsx` compilen con Babel sin errores de sintaxis).
2. `@javierhuerta` revisa el diff en GitHub y aprueba/fusiona el PR en **`development`**.
3. Al fusionarse en `development`, Dokploy despliega automáticamente el cambio en **Staging** para verlo funcionando con datos reales.
4. Una vez conforme en Staging, `@javierhuerta` hace merge de `development` → `main` para publicarlo en `adventistascentralosorno.cl`.
