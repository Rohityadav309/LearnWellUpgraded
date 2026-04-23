import express from "express";

import {
  changePassword,
  login,
  logout,
  refreshToken,
  sendotp,
  signup,
} from "../controllers/Auth.js";
import {
  resetPassword,
  resetPasswordToken,
} from "../controllers/ResetPassword.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

//Routes for Login, Signup, and Authentication

//*******************************************************************************
//                          Authentication Routes
//*******************************************************************************

//Route for user login
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

//Route for user signup
router.post("/signup", signup);

//Route for sending OTP to the user's email
router.post("/sendotp", sendotp);

//Route for changing the password
router.post("/changePassword", auth, changePassword);

//**********************************************************************************
//                          Reset Password
//**********************************************************************************

//Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

//Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

//Export the router for use in the main application
export default router;
