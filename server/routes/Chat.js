import express from "express";

import { chatWithAssistant } from "../controllers/Chat.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, chatWithAssistant);

export default router;
