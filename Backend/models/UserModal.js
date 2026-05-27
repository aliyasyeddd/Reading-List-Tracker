const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")


const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true, //to remove any whitespace from name 
        // Custom validator to check the length of the name
        validate(value) {
        if (!validator.isLength(value, { min: 2, max: 50 })) {
            throw new Error("Name must be between 2 and 50 characters");
        }
    }
    },
    emailId: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true, //to remove any whitespace from the email id before saving it to the database.
        unique: true,
        //validate email in schema why?? Because we want to ensure that the email id is valid before saving it to the database. This is an extra layer of validation in addition to the validation we do in the signup route. This way, even if someone bypasses the validation in the signup route, they won't be able to save an invalid email id to the database.
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value);
            }
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        // No validate() here — hash is stored, not raw password
    }
},
    {
        timestamps: true
    }
)

// schema method to generate a JWT token for the user. This method will be called after the user is saved to the database in the signup route. The token will be sent to the frontend in the cookie so that the frontend can use that token to authenticate the user in subsequent requests.
userSchema.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '5d' }
    );
    return token;
}

userSchema.methods.comparePassword = async function (passwordInputByUser) {
    const user = this;
    const hashedPassword = user.password; // Get the hashed password from the database

    // Use bcrypt to compare the input password with the hashed password
    const isPasswordMatch = await bcrypt.compare(passwordInputByUser, hashedPassword);

    return isPasswordMatch;
}


module.exports = mongoose.model('User', userSchema)