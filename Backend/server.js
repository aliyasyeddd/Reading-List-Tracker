// Load env variables FIRST — before anything else 
const dotenv = require('dotenv') 
dotenv.config()

const express = require("express")
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser")

const app = express()

const port = process.env.PORT || 3000

//parse JSON request bodies
app.use(express.json())
app.use(cookieParser()); //middleware to parse the cookies and attach it to the request object

const authRouter = require("./routes/authRoutes");
const bookRouter = require("./routes/bookRoutes");
const profileRouter = require("./routes/profileRoutes");

//whenever request coming from slash go to  authRouter and bookRouter to check if there is a matching route. 
//If there is, it will be handled by that router. If not, it will continue to the next middleware
app.use("/", authRouter);
app.use("/", bookRouter);
app.use("/", profileRouter);

connectDB().then(() => {
    console.log("Database Connection established.... successfully");

    app.listen(process.env.PORT || 3000, () => {
        console.log(`API is running on port ${port}`);
    });
}).catch((err) => {
    console.error("Failed to connect to DB:", err.message);
});
