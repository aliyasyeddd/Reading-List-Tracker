const express = require('express');
const { userAuth } = require("../middleware/protect");

const bookRouter = express.Router();

//GET /api/books — get all books for the logged-in user
bookRouter.get("/books", userAuth, (req, res) => {})

//POST /api/books — add a new book
bookRouter.post("/books", userAuth, (req, res) => {})

//PUT /api/books/:id — update a book (status, rating, notes)
bookRouter.put("/books/:id", userAuth, (req, res) => {})

//DELETE /api/books/:id — delete a book
bookRouter.delete("/books/:id", userAuth, (req, res) => {})

module.exports = bookRouter;