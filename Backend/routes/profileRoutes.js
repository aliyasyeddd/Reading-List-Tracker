const express = require('express');
const { userAuth } = require('../middleware/protect');


const profileRouter = express.Router()

// GET /profile - Get the user's profile information
profileRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user; // userAuth middleware attaches the user to req
        res.json({
            name: user.name,
            emailId: user.emailId,
        });

    } catch(err) {
        res.status(400).json("ERROR: " + err.message);
    }
})

module.exports = profileRouter;