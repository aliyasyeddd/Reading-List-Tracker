const mongoose = require('mongoose');
const validator = require("validator");
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true, //to remove any whitespace from name 
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true, //to remove any whitespace from the email id before saving it to the database.
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value);
            }
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        //checks: { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 }
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Enter a Strong Password: " + value);
            }
        },
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('User', userSchema)