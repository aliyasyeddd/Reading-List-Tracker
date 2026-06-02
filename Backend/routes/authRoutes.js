const express = require('express');
const { validateSignUpData } = require('../utils/profileValidation');
const User = require('../models/UserModal');
const bcrypt = require("bcryptjs");


const authRouter = express.Router()

//signup api - POST /signup
authRouter.post('/signup', async (req, res) => {
    try {
        //1: Check if the data is valid ---
        validateSignUpData(req);

        //2: Pick out the fields we need ---
        const { name, emailId, password } = req.body;

        //2a: Prevent duplicate signup by email ---
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).json("ERROR : Email already exists");
        }

        //3: hashing the password before saving ---
        const hashedPassword = await bcrypt.hash(password, 10);

        //4: Build the new user object ---
        const user = new User({
            name,
            emailId,
            password: hashedPassword,
        });

        //5: Actually save it to the database ---
        const savedUser = await user.save();

        //6: Create a login token --- auto login after signup. Why? Because it's a better user experience to be logged in immediately after signing up, rather than having to log in again right after signing up.
        const token = await savedUser.getJWT();

        //7: Give the token to the browser in a secure cookie ---
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,        // only sent over HTTPS
            sameSite: "strict",  // blocks CSRF attacks
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        //8: Send back a success response to the frontend ---
        res.json({ message: "User Added successfully!", data: {  name: savedUser.name, email: savedUser.email } });

    } catch (error) {
        // Catches validation errors, DB errors, or JWT signing errors.
        res.status(400).json("ERROR : " + error.message);
    }
})

//login api - POST /login
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        // we need to check if the user exists in the database and if the provided password matches the stored hashed password. The User model provides methods to perform these operations, such as findOne() to find a user by email and comparePassword() to compare the provided password with the stored hashed password.
        const user = await User.findOne({ emailId: emailId })
        if (!user) {
            throw new Error("Invalid Credentials")
        }

        const isPasswordValid = await user.comparePassword(password)
        if (isPasswordValid) {
            const token = await user.getJWT();
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,        // only sent over HTTPS
                sameSite: "strict",  // blocks CSRF attacks
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            res.json({ message: "login Successful", data: { name: user.name, emailId: user.emailId } });
        } else {
            throw new Error("Invalid Credentials")
        }
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})

//logout api - POST /logout
authRouter.post("/logout", (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
        });
        res.json({
            message: "Logout successful",
        });
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})



module.exports = authRouter;