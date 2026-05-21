// Load env variables FIRST — before anything else 
const dotenv = require('dotenv') 
dotenv.config()

const express = require("express")
const connectDB = require("./config/database");

const app = express()

const port = process.env.PORT || 3000

//parse JSON request bodies
app.use(express.json())

app.get('/', (req, res) => {
    res.send('welcome to express.js');
});

connectDB().then(() => {
    console.log("Database Connection established.... successfully");

    app.listen(process.env.PORT || 3000, () => {
        console.log(`API is running on port ${port}`);
    });
}).catch((err) => {
    console.error("Failed to connect to DB:", err.message);
});
