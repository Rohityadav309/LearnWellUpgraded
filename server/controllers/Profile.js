import mongoose from "mongoose";

import Course from "../models/Course.js";
import CourseProgress from "../models/CourseProgress.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import { convertSecondsToDuration } from "../utils/secToDuration.js";

export const updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body;
    const id = req.user.id;

    const userDetails = await User.findById(id);

    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await User.findByIdAndUpdate(id, { firstName, lastName }, { new: true });

    const profile = await Profile.findById(userDetails.additionalDetails);
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;
    profile.gender = gender;
    await profile.save();

    const updatedUserDetails =
      await User.findById(id).populate("additionalDetails");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Profile.findByIdAndDelete(
      new mongoose.Types.ObjectId(user.additionalDetails),
    );

    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(courseId, {
        $pull: { studentsEnrolled: id },
      });
    }

    await CourseProgress.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be deleted successfully",
    });
  }
};

export const getAllUserDetails = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id).populate(
      "additionalDetails",
    );

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files?.displayPicture;
    const userId = req.user.id;

    if (!displayPicture) {
      return res
        .status(400)
        .json({ success: false, message: "Display picture is required" });
    }

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000,
    );

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    let userDetails = await User.findById(userId).populate({
      path: "courses",
      populate: {
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      },
    });

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find user with id: ${userId}`,
      });
    }

    userDetails = userDetails.toObject();

    for (const course of userDetails.courses) {
      let totalDurationInSeconds = 0;
      let subsectionLength = 0;

      for (const section of course.courseContent) {
        totalDurationInSeconds += section.subSection.reduce(
          (acc, curr) => acc + Number.parseInt(curr.timeDuration || "0", 10),
          0,
        );
        subsectionLength += section.subSection.length;
      }

      course.totalDuration = convertSecondsToDuration(totalDurationInSeconds);

      const courseProgressCount = await CourseProgress.findOne({
        courseID: course._id,
        userId,
      });

      const completedCount = courseProgressCount?.completedVideos.length || 0;
      course.progressPercentage =
        subsectionLength === 0
          ? 100
          : Math.round((completedCount / subsectionLength) * 100 * 100) / 100;
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id });

    const courseData = courseDetails.map((course) => ({
      _id: course._id,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      totalStudentsEnrolled: course.studentsEnrolled.length,
      totalAmountGenerated: course.studentsEnrolled.length * course.price,
    }));

    return res.status(200).json({ success: true, courses: courseData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
