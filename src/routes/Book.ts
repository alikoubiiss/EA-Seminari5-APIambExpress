import express from 'express';

import controller from '../controllers/Book';

import { Schemas, ValidateId, ValidateJoi } from '../middleware/Joi';

// Creamos el router que se encargara de las rutas relacionadas con los libros
const router = express.Router();

/**
 * @openapi
 * /books:
 *   post:
 *     tags: [Books]
 *     summary: Crea un libro
 *     description: Un libro necesita al menos un autor, y cada autor se indica con su id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/BookInput' }
 *     responses:
 *       201:
 *         description: Libro creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Book' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para crear un libro nuevo
// Primero comprobamos que los datos recibidos cumplen el esquema de Joi
// Si son correctos llamamos a la funcion createBook del controlador
router.post('/', ValidateJoi(Schemas.book.create), controller.createBook);

/**
 * @openapi
 * /books/{bookId}:
 *   get:
 *     tags: [Books]
 *     summary: Devuelve un libro, con los datos de sus autores
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *         example: 6ab2d1c247a7d5e4fe530049
 *     responses:
 *       200: { $ref: '#/components/responses/BookOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para buscar un libro usando su ID
// Antes de llamar al controlador comprobamos que el ID tenga un formato valido
router.get('/:bookId', ValidateId('bookId'), controller.readBook);

/**
 * @openapi
 * /books:
 *   get:
 *     tags: [Books]
 *     summary: Lista todos los libros, con los datos de sus autores
 *     responses:
 *       200: { $ref: '#/components/responses/BookList' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */

// Ruta para obtener todos los libros
router.get('/', controller.readAll);

/**
 * @openapi
 * /books/{bookId}:
 *   put:
 *     tags: [Books]
 *     summary: Reemplaza los datos de un libro
 *     description: Hay que enviar el libro entero, no solo los campos que cambian.
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/BookInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/BookOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para actualizar un libro
// Primero comprobamos que el ID sea correcto y despues validamos los datos recibidos
router.put('/:bookId', ValidateId('bookId'), ValidateJoi(Schemas.book.update), controller.updateBook);

/**
 * @openapi
 * /books/{bookId}:
 *   delete:
 *     tags: [Books]
 *     summary: Borra un libro
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     responses:
 *       204: { description: Libro borrado, sin contenido }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para eliminar un libro usando su ID
// Comprobamos primero que el ID tenga un formato valido
router.delete('/:bookId', ValidateId('bookId'), controller.deleteBook);

/**
 * @openapi
 * /books/{bookId}/tags:
 *   post:
 *     tags: [Books]
 *     summary: Añade un tag a un libro
 *     description: Si el libro ya tiene el tag, no se duplica.
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tag]
 *             properties:
 *               tag: { type: string, example: fantasia }
 *     responses:
 *       200: { $ref: '#/components/responses/BookOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para añadir un tag a un libro
// Comprobamos el ID, despues el tag del body y por ultimo llamamos al controlador
router.post('/:bookId/tags', ValidateId('bookId'), ValidateJoi(Schemas.book.addTag), controller.addTag);

/**
 * @openapi
 * /books/{bookId}/tags:
 *   put:
 *     tags: [Books]
 *     summary: Reemplaza la lista entera de tags de un libro
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tags]
 *             properties:
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *                 example: [novela, historia]
 *     responses:
 *       200: { $ref: '#/components/responses/BookOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/Unprocessable' }
 */

// Ruta para reemplazar todos los tags de un libro
router.put('/:bookId/tags', ValidateId('bookId'), ValidateJoi(Schemas.book.setTags), controller.setTags);

/**
 * @openapi
 * /books/{bookId}/tags/{tag}:
 *   delete:
 *     tags: [Books]
 *     summary: Quita un tag de un libro
 *     description: Si el libro no tiene ese tag, no da error.
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *       - in: path
 *         name: tag
 *         required: true
 *         schema: { type: string }
 *         example: historia
 *     responses:
 *       200: { $ref: '#/components/responses/BookOne' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// Ruta para quitar un tag de un libro
router.delete('/:bookId/tags/:tag', ValidateId('bookId'), controller.removeTag);

// Exportamos el router para poder utilizar estas rutas en la aplicacion
export = router;
