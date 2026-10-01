# Cómo contribuir

Este proyecto lo leen y lo mantienen estudiantes. Cuando haya dos formas de hacer algo,
elegimos la más fácil de entender, aunque no sea la más corta ni la más eficiente.

## Ramas

| Rama | Para qué |
|---|---|
| `main` | Versión estable. Nunca se trabaja directamente en ella. |
| `develop` | Rama de integración: aquí llegan los objetivos terminados. |
| una por objetivo | Sale de `develop` y vuelve a `develop` con un pull request. Nombre corto en inglés con guiones, por ejemplo `basic-structure`. |

Para empezar un objetivo:

```
git switch develop
git pull
git switch -c nombre-del-objetivo
```

Al terminarlo, se sube la rama con `git push -u origin nombre-del-objetivo`, se abre un pull request
hacia `develop` y otro miembro del equipo lo revisa antes de hacer merge. Cuando `develop` está
estable, se abre un pull request de `develop` a `main`.

## Commits

Cada commit es un cambio con sentido propio. El mensaje empieza por el tipo de cambio y dice qué cambia:

| Tipo | Cuándo | Ejemplo |
|---|---|---|
| `feat` | Funcionalidad nueva | `feat: añade el gestor de errores` |
| `fix` | Corrige un fallo | `fix: devuelve 400 si el id no es válido` |
| `docs` | Solo documentación | `docs: añade CONTRIBUTING.md` |
| `chore` | Configuración, dependencias, herramientas | `chore: saca el .env de git` |

## Antes de abrir un pull request

- `npm run build` termina sin errores.
- `npm run lint` termina sin errores.
- El código está formateado con Prettier (se hace solo al guardar en VS Code).
- No subes tu `.env`. Si añades una variable nueva, añádela también a `.env.example`.
- Actualizas la sección "Estado del proyecto" de este archivo.

## Estado del proyecto

### Hecho

- **Punto de partida**: ejemplo del profesor con dos recursos, autores y libros (Express + Mongoose),
  con rutas, controllers, models y validación con Joi.
- **Capa de services** (`802f7d5`): los controllers ya no consultan la base de datos. Llaman a
  `services/AuthorService.ts` y `services/BookService.ts`, que son los únicos que usan los models.
- **Rutas REST** (`802f7d5`): la acción la indica el método HTTP, no la URL. Antes era
  `POST /authors/create` y ahora es `POST /authors`; igual para leer, modificar y borrar, en autores
  y en libros. Al modificar se responde 200 y al borrar 204.
- **Guarda del id**: si el id de la URL no tiene forma de id de MongoDB, la API responde 400
  en lugar de 500.
- **PUT en lugar de PATCH**: actualizar pide todos los campos, así que reemplaza el recurso
  entero. Eso es un PUT, que además es idempotente.
  Regla: PUT cuando se envía el recurso completo (lo reemplaza); PATCH cuando se envían solo
  los campos que cambian.
- **Estructura básica** (`basic-structure`): README, este CONTRIBUTING, `.gitignore` con el `.env`,
  y `.env.example` para que cada miembro configure su propio MongoDB.
- **Stack actualizado**: Node 24 LTS, TypeScript 6, Express 5, Mongoose 9, Joi 18 y dotenv 17.
  Mongoose 6 no soportaba MongoDB 6 o superior. Nuevo `npm run dev`, que reinicia la API al guardar.
- **CORS con el paquete `cors`**: `middleware/Cors.ts` sustituye a las cabeceras escritas a mano en
  `server.ts`. El origen se configura con `CORS_ORIGIN` en el `.env`.
- **Diez atributos por modelo**: el autor añade email (único), contraseña, fecha de nacimiento,
  nacionalidad, biografía, web, foto, activo y rol. El libro añade ISBN (único), edición, editorial,
  año, páginas, idioma, tags y precio, y ahora puede tener **más de un autor** (`authors`).
- **Datos de ejemplo**: `npm run seed` llena la base de datos con 5 autores y 12 libros
  (`src/seed.ts` y `src/seed-data.ts`). Con `-- --reset` la rehace desde cero.
- **Linter con Oxlint**: `npm run lint` analiza el código TypeScript de `src/` y
  `npm run lint:fix` aplica las correcciones automáticas disponibles. La configuración está en
  `.oxlintrc.json`.
- **Logger como middleware**: `middleware/Logger.ts` sale de `server.ts` y escribe cada petición y
  su código de respuesta.
- **Gestor de errores**: `middleware/ErrorHandler.ts`, el middleware de cuatro parámetros que se
  registra el último. Traduce cada error a su código (400, 404, 409, 422) y responde 500 con un
  mensaje genérico cuando el fallo es inesperado, sin enseñar detalles internos.
- **Hooks de Mongoose**: `pre-save` cifra la contraseña con scrypt y sal aleatoria, solo si ha
  cambiado; `post-save` escribe en el logger la simulación del correo de bienvenida.
- **Swagger con anotaciones**: cada ruta lleva su comentario `@openapi` y los esquemas se generan
  desde los de Joi con `joi-to-swagger`, así que no se desfasan. `config/swagger.ts` pasa de 685
  líneas escritas a mano a 61.

- **Tags de un libro**: `POST /books/:bookId/tags` añade un tag sin duplicarlo, `PUT` reemplaza la
  lista entera y `DELETE /books/:bookId/tags/:tag` quita uno. Usan `$addToSet` y `$pull` en
  `BookService.ts`, y el body se valida con Joi contra `BOOK_TAGS`. Las tres devuelven el libro
  actualizado con sus autores.

### En curso

- Nada en este momento.

### Pendiente

Objetivos del Seminario 5:

- [x] Estructura del proyecto
- [x] Middleware de CORS
- [x] Middleware de entrada: validación y logger
- [x] Middleware de salida: gestor de errores
- [x] Documentación con Swagger
- [x] Linter

Los objetivos del seminario están cubiertos. Lo único abierto es el ejercicio propuesto:

- [x] **CRUD de los tags de un libro**, con el enunciado en [EXERCISE.md](EXERCISE.md).

Nota sobre las contraseñas: las de los datos de ejemplo son públicas a propósito (ver el README).
Este es un proyecto de clase, no una aplicación real.
