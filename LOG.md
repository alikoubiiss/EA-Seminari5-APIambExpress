# LOG

Este documento es la bitácora del proyecto: sirve para registrar lo que se ha hecho
y el uso de herramientas de asistencia (IA) durante el desarrollo.

## 1. Materiales consultados

- Enunciado del ejercicio: [EXERCISE.md](EXERCISE.md) (CRUD de los tags de un libro).
- [README.md](README.md) y [CONTRIBUTING.md](CONTRIBUTING.md) del repositorio.
- Documentación oficial de MongoDB: operadores de actualización de arrays (`$addToSet` y `$pull`).
- Documentación de Mongoose: métodos de consulta y actualización (`findByIdAndUpdate`), opción `returnDocument` y población de referencias (`populate`).
- Documentación de Joi: validación de listas y valores permitidos (`Joi.string().valid()`, `Joi.array().items()`).
- Documentación de Swagger JSDoc / OpenAPI 3.0 para parámetros de ruta.
- Apuntes y ejemplos del Seminario 5 (API REST con Express y Mongoose).

## 2. Qué se ha hecho

Siguiendo el enunciado de [EXERCISE.md](EXERCISE.md), se ha implementado la gestión de los tags de un libro como recurso propio dentro del libro, respetando el diseño en capas del proyecto:

| Método | URL | Capa | Cambio realizado |
|---|---|---|---|
| POST | `/books/:bookId/tags` | Service | Función `addTag` usando `$addToSet` (evita duplicados) |
| PUT | `/books/:bookId/tags` | Service | Función `setTags` reemplazando el array completo |
| DELETE | `/books/:bookId/tags/:tag` | Service | Función `removeTag` usando `$pull` (no falla si no existe) |

Detalle de la implementación por capas:
- **`src/services/BookService.ts`**: Se han añadido las tres funciones que interactúan con Mongoose (`addTag`, `setTags`, `removeTag`), configuradas con `{ returnDocument: 'after' }` para retornar el libro actualizado y `.populate('authors')` para incluir la información de los autores.
- **`src/controllers/Book.ts`**: Se han implementado los controladores correspondientes para extraer los parámetros (`bookId`, `tag`, `tags`), invocar al servicio y responder con código HTTP 200 (con el libro actualizado) o 404 si el libro no existe.
- **`src/middleware/Joi.ts`**: Se han creado los esquemas de validación `addTag` (requiere un único tag válido de `BOOK_TAGS`) y `setTags` (requiere un array de tags válidos), respondiendo 422 si los datos son incorrectos.
- **`src/routes/Book.ts`**: Se han registrado las rutas encadenando las guardas de validación de formato de id (`ValidateId`), validación de body (`ValidateJoi`) y su documentación interactiva OpenAPI.
- **`demo.http`**: Se ha creado un archivo de pruebas para REST Client que permite ejecutar paso a paso todas las peticiones de los criterios de aceptación.

## 3. Uso de IA generativa

- **Herramienta utilizada**: ChatGPT / Claude (asistente de consulta técnica).
- **Enfoque**: Se ha utilizado la IA de forma puntual como soporte para resolver dudas de sintaxis y operadores específicos de librerías (Mongoose, Joi y OpenAPI), programando manualmente la integración en la arquitectura del proyecto.

---

#### Consulta 1: Operadores de actualización de arrays en Mongoose

- **Motivo de la consulta**: Necesitaba saber qué operadores de MongoDB eran los más adecuados para garantizar que al añadir un tag no se duplicase, y cómo retornar directamente el documento ya modificado con sus relaciones pobladas.
- **Prompt literal**:
  > "¿En Mongoose cómo puedo hacer un `findByIdAndUpdate` para añadir un elemento a un array sólo si no existe ya (sin duplicarlo), y cómo eliminar un elemento específico del array sin que dé error si no estaba? ¿Qué opción se le pasa para que retorne el documento con los cambios aplicados y con el `populate` de otra colección?"
- **Respuesta obtenida**: Explicó la diferencia entre `$push` y `$addToSet`, el funcionamiento de `$pull` para arrays, y sugirió el uso de `{ new: true }` y `.populate('authors')`.
- **Incoherencias detectadas y adaptación manual**:
  - La IA sugirió `{ new: true }` (sintaxis tradicional de Mongoose), pero en el proyecto se utiliza Mongoose moderno con `{ returnDocument: 'after' }` para mantener coherencia con el resto del servicio.
  - La IA sugería añadir `.exec()`, pero en nuestro `BookService.ts` las funciones devuelven directamente la promesa de la consulta Mongoose.
  - Escribí e integré manualmente las tres funciones (`addTag`, `setTags`, `removeTag`) en `src/services/BookService.ts`.

---

#### Consulta 2: Validación de arrays con valores permitidos en Joi

- **Motivo de la consulta**: En `Book.ts` existe una constante con los tags válidos (`BOOK_TAGS`). Necesitaba validar con Joi que el campo del body coincidiera con esos valores y que para el PUT cada elemento del array cumpliera la misma restricción.
- **Prompt literal**:
  > "Tengo una constante en TypeScript `export const BOOK_TAGS = ['ciencia-ficcion', 'fantasia', 'novela', 'ensayo', 'poesia', 'historia']`. ¿Cómo defino con Joi un esquema para un objeto `{ tag: string }` que sea obligatorio y solo admita uno de esos valores, y otro para `{ tags: string[] }` que valide que sea un array donde todos los elementos pertenezcan a esa lista?"
- **Respuesta obtenida**: Propuso usar el operador de propagación con `Joi.string().valid(...BOOK_TAGS)` y `Joi.array().items(Joi.string().valid(...BOOK_TAGS))`.
- **Incoherencias detectadas y adaptación manual**:
  - La respuesta no incluía los ejemplos de Swagger (`.example(...)`), necesarios para que la interfaz interactiva muestre valores de prueba realistas.
  - Adapté la respuesta añadiendo `.example('fantasia')` y `.example(['novela', 'historia'])`, ubicándolos dentro del objeto `Schemas.book` en `src/middleware/Joi.ts`.

---

#### Consulta 3: Documentación Swagger de rutas con parámetros de path en Express

- **Motivo de la consulta**: Dudas con la sintaxis exacta de OpenAPI 3.0 (JSDoc) para documentar el endpoint DELETE que recibe dos parámetros en la URL (`:bookId` y `:tag`).
- **Prompt literal**:
  > "¿Cómo se escribe la anotación `@openapi` en comentarios JSDoc para un endpoint DELETE `/books/{bookId}/tags/{tag}` en Express, indicando que recibe dos parámetros por path y devuelve 200 con el esquema de Book o 404?"
- **Respuesta obtenida**: Una plantilla de YAML para OpenAPI con la sección `parameters: in: path`.
- **Incoherencias detectadas e integración**:
  - La IA definió esquemas genéricos en línea para las respuestas de error en lugar de usar los componentes estándar del proyecto.
  - Se adaptaron los bloques para referenciar los componentes reutilizables definidos en el proyecto (`$ref: '#/components/responses/BookOne'`, `BadRequest`, `NotFound`, `Unprocessable`).
  - Se conectó la ruta en `src/routes/Book.ts` encadenando los middlewares correspondientes (`ValidateId` y el controlador).

---

## 4. Verificación y pruebas realizadas

Se verificó el correcto funcionamiento siguiendo los criterios de aceptación de `EXERCISE.md` utilizando el archivo `demo.http` con la extensión REST Client de VS Code y ejecutando peticiones manuales con `curl`:

1. `POST /books/:id/tags` con `{"tag": "fantasia"}`: añade el tag y responde 200 con el libro y sus autores.
2. Repetir la misma petición: responde 200 manteniendo los mismos tags (sin duplicar gracias a `$addToSet`).
3. `POST /books/:id/tags` con `{"tag": "cocina"}`: responde 422 (rechazado por el middleware de Joi).
4. `PUT /books/:id/tags` con `{"tags": ["ensayo", "historia"]}`: responde 200 con la nueva lista.
5. `DELETE /books/:id/tags/historia`: elimina el tag y responde 200 con la lista actualizada.
6. Repetir el DELETE anterior: responde 200 sin error (`$pull` no falla si el elemento no está).
7. Peticiones con ID inexistente (24 caracteres hexadecimales válidos): responde 404 `{ message: 'not found' }`.
8. Peticiones con ID malformado (ej. `abc`): responde 400 (detenido por la guarda `ValidateId`).
