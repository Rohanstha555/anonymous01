import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({extended: true, limit: "20kb"}))
app.use(cookieParser())


//import router
import UserRouter from './routes/user.routes.js';
import MessageRouter from './routes/message.route.js';

//routes declaration

app.use("/api/v1/users", UserRouter)
app.use("/api/v1/Messages", MessageRouter)





app.get("/", (req, res) => {
    res.send("server is ready");
});

export { app };
