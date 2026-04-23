import express from "express";

import {
  deleteAccount,
  getAllUserDetails,
  getEnrolledCourses,
  instructorDashboard,
  updateDisplayPicture,
  updateProfile,
} from "../controllers/Profile.js";
import { auth, isInstructor } from "../middleware/auth.js";

const router = express.Router();

//****************************************************************************
//                              Profile routes
//****************************************************************************
//Delete User Account
router.delete("/deleteProfile", auth, deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);

//Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

export default router;
