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
        trim: true,
        // Custom validator to check the length of the book title
        validate(value) {
            if (!validator.isLength(value, { min: 4, max: 100 })) {
                throw new Error("Title must be between 4 and 100 characters");
            }
        }
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true,
        // Custom validator to check the length of the author name
        validate(value) {
            if (!validator.isLength(value, { min: 4, max: 20 })) {
                throw new Error("Author name must be between 4 and 20 characters");
            }
        }
    },
    genre: {
        type: String,
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
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: null,
        validate: {
            validator: function (value) {
                // If status is 'finished', rating must be a number between 1 and 5
                if (this.status === 'finished') {
                    return typeof value === 'number' && value >= 1 && value <= 5;
                }
                // For other statuses, rating must be null
                return value === null;
            },
            message: 'Rating can only be set when status is "finished"',
        }
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

bookSchema.pre('save', async function () {
    if (!this.isModified('status')) return;

    if (this.status === 'reading') {
        this.startedAt = new Date();
    } else if (this.status === 'finished') {
        this.finishedAt = new Date();
    }
});

module.exports = mongoose.model('Book', bookSchema)

