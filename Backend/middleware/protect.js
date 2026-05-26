const User = require('../models/user');
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
    try {
        // extract token from cookies
        const { token } = req.cookies;
        // block unauthenticated requests early
        if (!token) {
            return res.status(401).send("Please Login!");
        }

        // verify the token
        const decodedObject = jwt.verify(token, process.env.JWT_SECRET_KEY)

        // extract user id from decoded payload
        const { _id } = decodedObject;

        // look up user in DB
        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found"); // id exists in token but not in DB
        }

        // attaches the user to req
        req.user = user;

        next(); // pass control to the next middleware
    } catch (error) {
        // handles invalid token, expired token, user not found
        res.status(400).send("ERROR: " + error.message);
    }
}

module.exports = {
    userAuth,
}
