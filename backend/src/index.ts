import { app } from './app.js';
import { connectDB } from './db/dbconnect.js';
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;

// Connect to DB and start server
await connectDB();

app.listen(port, () => {
    console.log(`Serve at http://localhost:${port}`);
});