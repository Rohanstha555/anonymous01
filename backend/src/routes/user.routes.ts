import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken } from "../controllers/user/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkUsername } from "../controllers/user/checkUsername.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-Access-Token").post(refreshAccessToken)

router.route("/checkUsername").get(checkUsername)
export default router