import { Router } from "express";
import { deleteMessage, getAcceptMessage, getMessage, postAcceptMessage, sendMessage } from "../controllers/user/message.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

router.route("/sendMessage").post(sendMessage)
router.route("/getMessage").get(verifyJWT, getMessage)
router.route("/acceptMessage").get(verifyJWT, getAcceptMessage)
router.route("/acceptMessage").post(verifyJWT, postAcceptMessage)
router.route("/deleteMessage/:messageId").delete(verifyJWT, deleteMessage)

export default router