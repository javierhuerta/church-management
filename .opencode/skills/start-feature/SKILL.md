---
name: start-feature
description: Crea una rama Git feature/<name> desde una rama base para comenzar el trabajo en una nueva feature o change. Usar cuando el usuario quiere iniciar una feature, crear una rama, empezar a trabajar en un change nuevo, o antes de proponer con OpenSpec.
---

Crea una rama Git `feature/<name>` desde una rama base seleccionada por el usuario.

**Input**: El argumento opcional es el nombre de la feature en kebab-case (ej: `add-user-auth`). Si se omite, se pregunta.

**Steps**

1. **Resolver el nombre de la feature**

   Si se proporcionó un argumento, usarlo directamente.

   Si no se proporcionó, usar el **AskUserQuestion tool** (open-ended) para preguntar:
   > "¿Cómo se llama la feature? (kebab-case, ej: add-user-auth)"

   El nombre se usará como: `feature/<name>`

2. **Obtener el HEAD actual**

   ```bash
   git branch --show-current
   ```

   Guardar el resultado para mostrarlo como opción en el siguiente paso.

3. **Preguntar la rama base**

   Usar el **AskUserQuestion tool** con opciones para preguntar:
   > "¿Desde qué rama crear `feature/<name>`?"

   Opciones:
   - `development` (default recomendado)
   - `main`
   - `<rama actual del HEAD>`

   Si el HEAD ya es `development` o `main`, no duplicar — mostrar solo las opciones distintas.

4. **Verificar que la rama base existe**

   ```bash
   git branch --list <base>
   ```

   Si no existe localmente:
   ```bash
   git fetch origin <base>
   git branch --list <base>
   ```

   Si sigue sin existir después del fetch: mostrar error claro y detener.

   ```
   Error: la rama '<base>' no existe localmente ni en origin. Verificá el nombre e intentá de nuevo.
   ```

5. **Verificar si la rama destino ya existe**

   ```bash
   git branch --list feature/<name>
   ```

   **Si ya existe**: usar el **AskUserQuestion tool** para preguntar:
   > "La rama `feature/<name>` ya existe. ¿Qué hacemos?"

   Opciones:
   - Hacer checkout de la rama existente
   - Abortar

   Si elige checkout:
   ```bash
   git checkout feature/<name>
   ```

   Si elige abortar: detener con mensaje sin error.

   **Si no existe**: crear y hacer checkout:
   ```bash
   git checkout -b feature/<name> <base>
   ```

6. **Confirmar el estado final**

   ```bash
   git branch --show-current
   ```

   Mostrar mensaje de cierre:

   ```
   Rama feature/<name> lista (base: <base>).
   Ahora corre /opsx-propose <name> para crear los artefactos del change.
   ```

**Guardrails**
- No hacer push a remote — solo crear la rama localmente
- No modificar ningún archivo del proyecto
- Si hay uncommitted changes en el working tree, advertir antes de hacer checkout pero no bloquear
- Usar siempre kebab-case para el nombre de la rama
