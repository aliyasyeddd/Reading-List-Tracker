const express = require('express');
const { validateSignUpData } = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require("bcryptjs");


const authRouter = express.Router()

//signup api - POST /signup
authRouter.post('/signup', async (req, res) => {
    try {
        //1: Check if the data is valid ---
        validateSignUpData(req);

        //2: Pick out the fields we need ---
        const { name, emailId, password } = req.body;

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

        //7: Give the token to the browser in a cookie ---
        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 3600000),
        });

        //8: Send back a success response to the frontend ---
        res.json({ message: "User Added successfully!", data: savedUser });

    } catch (error) {
        // Catches validation errors, DB errors, or JWT signing errors.
        res.status(400).json("ERROR : " + error.message);
    }
})

//login api - POST /login
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;


        const user = await User.findOne({ emailId: emailId })
        if (!user) {
            throw new Error("Invalid Credentials")
        }

        const isPasswordValid = await user.comparePassword(password)
        if (isPasswordValid) {
            const token = await user.getJWT();
            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 3600000),
            });
             res.json({ message: "login Successful", data: user });
        } else {
            throw new Error("Invalid Credentials")
        }
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})



module.exports = authRouter;