import { Router } from "express";
import { sendMessage } from "../controllers/user/message.controller.js";


const router = Router();

router.route("/sendMessage").post(sendMessage)

export default router