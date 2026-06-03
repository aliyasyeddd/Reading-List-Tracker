const express = require('express');
const { userAuth } = require("../middleware/protect");
const Book = require("../models/BookModal");
const { validateBookData } = require("../utils/bookValidation");

const bookRouter = express.Router();


//POST /api/books — add a new book
bookRouter.post("/book", userAuth, async (req, res) => {
    try {
        const { title, author, genre, coverUrl } = req.body;
        if (!title || !author) {
            throw new Error("Title and author are required");
        }

        //check if the user already has a book with the same title to prevent duplicates
        const existingBook = await Book.findOne({ user: req.user._id, title: title });
        if (existingBook) {
            return res.status(400).json({ message: "A book with this title already exists for this user." });
        }


        // Create a new book associated with the logged-in user
        const newBook = new Book({
            user: req.user._id, // associate the book with the logged-in user's ID
            title,
            author,
            genre,
            coverUrl
        })

        await newBook.save();

        res.json({ message: "Book added successfully!", data: newBook });
    } catch (err) {
        res.status(400).json("ERROR: " + err.message);
    }
})

//GET /api/books — get all books for the logged-in user
bookRouter.get("/books", userAuth, async (req, res) => {
    try {
        //1: Get the user id from req.user (set by userAuth middleware)
        const userId = req.user._id;

        // 2: Start the filter with the userId so users only see their own books
        const filter = { user: userId };


        // 3: If status was sent in the URL, add it to the filter
        if (req.query.status) {
            filter.status = { $regex: new RegExp(req.query.status, "i") };// case-insensitive regex match for status
        }

        // 4: If genre was sent in the URL, add it to the filter
        if (req.query.genre) {
            filter.genre = { $regex: new RegExp(req.query.genre, "i") };
        }

        // 5: If search query was sent in the URL, add it to the filter. We want to search by title or author, so we use $or with regex for case-insensitive partial matching.
        if (req.query.search) {
            //$or allows us to specify multiple conditions, and if any of them are true, the document will match.
            //In this case, we want to match books where either the title or the author contains the search term. 
            filter.$or = [
                { title: { $regex: new RegExp(req.query.search, "i") } },
                { author: { $regex: new RegExp(req.query.search, "i") } }
            ];
        }

        // 6: Query the database for books that belong to this user
        const books = await Book.find(filter);

        // 7: If no books exist, send a friendly message instead of an empty array
        if (books.length === 0) {
            let message = "No books found";

            if (req.query.status && req.query.genre) {
                message = `No books found with status "${req.query.status}" and genre "${req.query.genre}"`;
            } else if (req.query.status) {
                message = `No books found with status "${req.query.status}"`.trim();
            } else if (req.query.genre) {
                message = `No books found with genre "${req.query.genre}"`.trim();
            }

            return res.status(200).json({ message });
        }

        res.status(200).json({ message: "Books fetched successfully", data: books });

    } catch (err) {
        res.status(400).json("ERROR: " + err.message);
    }
})

//GET /api/book/:id — get a specific book
bookRouter.get("/book/:id", userAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            // to stop the execution of the function if the book does not belong to the user. If we don't return, the code will continue to execute and may send another response later on, which would cause an error because you can't send multiple responses to the same request.
            return res.status(403).json("ERROR: book does not belong to the user");
        }

        const { title, author, genre, coverUrl, status, rating, notes } = book;
        res.json({
            message: "Book fetched successfully!",
            data: { title, author, genre, coverUrl, status, rating, notes }
        });

    } catch (err) {
        res.status(400).json("ERROR: " + err.message);
    }
})

//DELETE /api/book/:id — delete a book
bookRouter.delete("/book/:id", userAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Ensure the book belongs to the logged-in user before allowing deletion
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You do not have permission to delete this book" });
        }

        await book.deleteOne();
        res.json({ message: "Book deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: "ERROR: " + err.message });
    }
});

//PATCH /api/book/:id — edit/update a book
bookRouter.patch("/book/:id", userAuth, async (req, res) => {
    try {
        if (!validateBookData(req)) {
            throw new Error("Invalid edit request");
        }
        const { id } = req.params;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }


        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You do not have permission to edit this book" });
        }

        // Update the book with the fields provided in the request body
        Object.keys(req.body).forEach((field) => {
            book[field] = req.body[field];
        });

        await book.save();

        res.json({ message: "Book updated successfully!", data: book });
    } catch (err) {
        res.status(400).json({ message: "ERROR: " + err.message });
    }
})

module.exports = bookRouter;