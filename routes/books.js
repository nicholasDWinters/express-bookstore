const express = require("express");
const Book = require("../models/book");
const jsonschema = require('jsonschema');
const bookSchema = require('../schemas/book.json');
const router = new express.Router();
const ExpressError = require('../expressError');
const { json } = require("express");

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.isbn);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);
    if (!result.valid) {
      let errors = result.errors.map(e => e.stack);
      throw new ExpressError(errors, 400);

    }
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    let { isbn } = req.params;
    let { amazon_url, author, language, pages, publisher, title, year } = req.body;
    let updatedBook = { isbn, amazon_url, author, language, pages, publisher, title, year };
    const result = jsonschema.validate(updatedBook, bookSchema);
    if (!result.valid) {
      let errors = result.errors.map(e => e.stack);
      throw new ExpressError(errors, 400);

    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.status(200).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
