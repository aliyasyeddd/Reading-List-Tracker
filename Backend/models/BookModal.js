const mongoose = require('mongoose');
const validator = require("validator");
const { Schema } = mongoose;

const bookSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // stores user's ID
        ref: 'User', // points to User collection
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    title: {
        type: String,
        required: [true, 'Book Title is required'],
        minLength: 4,
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        minLength: 4,
        maxLength: 20,
        trim: true
    },
    genre: {
        type: String,
        required: [true, 'genre is required'],
        trim: true
    },
    coverUrl: {
        type: String,
        default: "https://www.nypl.org/scout/_next/image?url=https%3A%2F%2Fdrupal.nypl.org%2Fsites-drupal%2Fdefault%2Ffiles%2Fstyles%2Fmax_width_960%2Fpublic%2Fblogs%2FJ5LVHEL.jpg%3Fitok%3DDkMp1Irh&w=3840&q=90",
        // Custom validator to check whether the value is a valid URL
        validate(value) {
            // validator.isURL() returns true if the string is a proper URL
            if (!validator.isURL(value)) {
                // Throw an error if the URL format is invalid
                throw new Error("Invalid Book Cover URL: " + value);
            }
        },
    },
    status: {
        type: String,
        // The enum validator restricts the value to these three options
        // Enum validation ensures that only predefined values are allowed
        enum: {
            // Allowed values 
            values: ['want_to_read', 'reading', 'finished'],
            // Custom error message if the value is not in the allowed list
            // {VALUE} will be replaced with the invalid value entered
            message: `{VALUE} is not a valid status type`,
        },
        default: 'want_to_read',
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
    },
    notes: {
        type: String,
        trim: true,
    },
    startedAt: {
        type: Date,
        default: null,
    },
    finishedAt: {
        type: Date,
        default: null,
    }
},
    {
        timestamps: true,
    }
)

// Compound index to optimize queries filtering by user and status
// if we wont add index, it will be very slow to query books by user and status because it will have to scan the entire collection
bookSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Book', bookSchema)

