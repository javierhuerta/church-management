## Why

El sistema carece de identidad visual propia: usa colores neutros genéricos que no reflejan la marca de Adventistas Central Osorno. Además el login no expone los controles de tema y tamaño de texto, el tema por defecto es "sistema" (que muestra oscuro en muchos dispositivos), y hay componentes en los módulos de Calendario y Cultos que aún tienen colores hardcodeados no adaptados al dark mode.

## What Changes

- **Logo SVG**: crear `logo.svg` trazado a mano basado en el logo oficial (azul marino + dorado), optimizado para uso en sidebar y login en cualquier fondo.
- **Paleta de marca**: reemplazar los tokens `--primary` neutrales por la paleta corporativa de la iglesia — azul marino `#1B3A6B` como primary, dorado `#C9A84C` como accent, crema cálida `#FAF6F0` como background en light, con sus equivalentes dark.
- **Tipografía**: incorporar Google Font **Lato** (sans-serif humanista) para texto corrido y **Playfair Display** para headings representativos (login, títulos de módulo).
- **Login rediseñado**: mostrar logo, controles de tema (Claro/Oscuro/Sistema) y selector de tamaño de texto directamente en la pantalla de login, sin necesidad de entrar a la app.
- **Tema predeterminado "light"**: cambiar `defaultTheme` de `"system"` a `"light"` en el `ThemeProvider`.
- **Dark mode completo**: auditar y corregir todos los componentes y páginas con colores hardcodeados que no respetan el tema oscuro (Calendario, Cultos, Mantenedores, componentes compartidos).

## Capabilities

### New Capabilities
- `brand-identity`: Paleta de colores, tipografía y logo SVG que definen la identidad visual del sistema, alineada con la marca de Adventistas Central Osorno.

### Modified Capabilities
- `login-ui`: La pantalla de login ahora incluye toggle de tema y selector de tamaño de texto, y muestra el logo SVG de la iglesia.
- `frontend-theme-system`: El tema predeterminado cambia de `"system"` a `"light"`. Los tokens de color adoptan la paleta de marca.

## Impact

- `frontend/src/index.css`: redefinir tokens CSS `--primary`, `--accent`, `--background`, tipografía base.
- `frontend/src/main.tsx`: cambiar `defaultTheme="light"`.
- `frontend/src/assets/images/logo.svg`: nuevo archivo.
- `frontend/src/features/auth/`: login-page, login-form — rediseño visual + nuevos controles.
- `frontend/src/components/layout/sidebar.tsx`: usar logo SVG.
- Todos los módulos frontend (Calendar, WorshipServices, Mantenedores): corrección de colores hardcodeados restantes.
- Sin cambios de backend ni de API.

## Fuera del alcance

- Cambios en la marca adventista institucional (el símbolo de llama/biblia es propiedad de la IASD y no se modifica).
- Rediseño de layouts o navegación.
- Nuevos módulos o funcionalidades de negocio.
- Generación o edición de imágenes fotográficas.
