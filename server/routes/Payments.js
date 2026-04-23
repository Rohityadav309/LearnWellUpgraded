import express from "express";

import {
  capturePayment,
  sendPaymentSuccessEmail,
  verifyPayment,
} from "../controllers/Payments.js";
import { auth, isStudent } from "../middleware/auth.js";

const router = express.Router();

router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifyPayment", auth, isStudent, verifyPayment);
router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  sendPaymentSuccessEmail,
);

export default router;
