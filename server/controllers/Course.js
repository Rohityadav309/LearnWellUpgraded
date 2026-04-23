import Category from "../models/Category.js";
import Course from "../models/Course.js";
import CourseProgress from "../models/CourseProgress.js";
import Section from "../models/Section.js";
import SubSection from "../models/SubSection.js";
import User from "../models/User.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import { convertSecondsToDuration } from "../utils/secToDuration.js";

export const createCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      status = "Draft",
    } = req.body;

    const tag = Array.isArray(req.body.tag)
      ? req.body.tag
      : JSON.parse(req.body.tag || "[]");
    const instructions = Array.isArray(req.body.instructions)
      ? req.body.instructions
      : JSON.parse(req.body.instructions || "[]");
    const thumbnail = req.files?.thumbnailImage;
    let categoryDetails = null;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      tag.length === 0 ||
      instructions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory",
      });
    }

    const instructorDetails = await User.findOne({
      _id: userId,
      accountType: "Instructor",
    });

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    if (category) {
      categoryDetails = await Category.findById(category);

      if (!categoryDetails) {
        return res.status(404).json({
          success: false,
          message: "Category details not found",
        });
      }
    }

    let thumbnailImage = null;

    if (thumbnail) {
      thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME,
      );
    }

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price: Number(price),
      tag,
      category: categoryDetails?._id,
      thumbnail: thumbnailImage?.secure_url || "",
      status,
      instructions,
    });

    await User.findByIdAndUpdate(instructorDetails._id, {
      $push: { courses: newCourse._id },
    });

    if (categoryDetails) {
      await Category.findByIdAndUpdate(categoryDetails._id, {
        $push: { courses: newCourse._id },
      });
    }

    return res.status(201).json({
      success: true,
      data: newCourse,
      message: "Course created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    const { courseId, ...updates } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (String(course.instructor) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this course",
      });
    }

    if (req.files?.thumbnailImage) {
      const thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnailImage,
        process.env.FOLDER_NAME,
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (key === "tag" || key === "instructions") {
        course[key] = Array.isArray(value) ? value : JSON.parse(value || "[]");
      } else if (value !== undefined) {
        course[key] = value;
      }
    });

    await course.save();

    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllCourses = async (_req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
        status: true,
      },
    ).populate("instructor");

    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Cannot fetch course data",
      error: error.message,
    });
  }
};

export const getStudentVisibleCourses = async (_req, res) => {
  try {
    const courses = await Course.find(
      {},
      {
        courseName: true,
        courseDescription: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
        category: true,
        status: true,
      },
    )
      .populate("instructor")
      .populate("category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Cannot fetch visible courses",
      error: error.message,
    });
  }
};

export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection", select: "-videoUrl" },
      });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    const totalDurationInSeconds = courseDetails.courseContent.reduce(
      (courseTotal, content) =>
        courseTotal +
        content.subSection.reduce(
          (subTotal, subSection) =>
            subTotal + Number.parseInt(subSection.timeDuration || "0", 10),
          0,
        ),
      0,
    );

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration: convertSecondsToDuration(totalDurationInSeconds),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    const courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    const totalDurationInSeconds = courseDetails.courseContent.reduce(
      (courseTotal, content) =>
        courseTotal +
        content.subSection.reduce(
          (subTotal, subSection) =>
            subTotal + Number.parseInt(subSection.timeDuration || "0", 10),
          0,
        ),
      0,
    );

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration: convertSecondsToDuration(totalDurationInSeconds),
        completedVideos: courseProgressCount?.completedVideos || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const instructorCourses = await Course.find({
      instructor: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: instructorCourses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (String(course.instructor) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this course",
      });
    }

    for (const studentId of course.studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    for (const sectionId of course.courseContent) {
      const section = await Section.findById(sectionId);

      if (section) {
        for (const subSectionId of section.subSection) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      await Section.findByIdAndDelete(sectionId);
    }

    await Category.findByIdAndUpdate(course.category, {
      $pull: { courses: courseId },
    });

    await User.findByIdAndUpdate(course.instructor, {
      $pull: { courses: courseId },
    });

    await CourseProgress.deleteMany({ courseID: courseId });
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
