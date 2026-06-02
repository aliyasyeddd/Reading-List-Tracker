const User = require('../models/UserModal');
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
        console.log("Decoded JWT payload:", decodedObject); // Debugging line to check the decoded token

        // extract user id from decoded payload )
        const userId = decodedObject._id ;

        // look up user in DB
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found"); // id exists in token but not in DB
        }

        // attaches the user to req
        req.user = user;

        next(); // pass control to the next middleware
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send('Token expired. Please login again.');
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send('Invalid token. Please login again.');
        }

        res.status(400).send('ERROR: ' + error.message);
    }
}

module.exports = {
    userAuth,
}
