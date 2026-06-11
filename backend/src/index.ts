import express from 'express';
import { connectDB } from './db/dbconnect.js';
import dotenv from "dotenv";

dotenv.config();

const app = express()

app.get("/", (req, res) => {
    res.send("server is ready")
})

const port = process.env.PORT || 3000;

// Connect to DB and start server
await connectDB();

app.listen(port, () => {
    console.log(`Serve at http://localhost:${port}`);
})