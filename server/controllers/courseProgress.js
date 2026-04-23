import CourseProgress from "../models/CourseProgress.js";
import SubSection from "../models/SubSection.js";

export const updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body;
  const userId = req.user.id;

  try {
    const subsection = await SubSection.findById(subsectionId);

    if (!subsection) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid subsection" });
    }

    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress does not exist",
      });
    }

    if (courseProgress.completedVideos.includes(subsectionId)) {
      return res.status(400).json({
        success: false,
        message: "Subsection already completed",
      });
    }

    courseProgress.completedVideos.push(subsectionId);
    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Course progress updated",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getProgressPercentage = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    return res
      .status(400)
      .json({ success: false, message: "Course ID not provided" });
  }

  try {
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    }).populate({
      path: "courseID",
      populate: {
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      },
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Cannot find course progress with these IDs",
      });
    }

    let lectures = 0;
    courseProgress.courseID.courseContent?.forEach((section) => {
      lectures += section.subSection.length || 0;
    });

    const progressPercentage =
      lectures === 0
        ? 100
        : Math.round(
            (courseProgress.completedVideos.length / lectures) * 100 * 100,
          ) / 100;

    return res.status(200).json({
      success: true,
      data: progressPercentage,
      message: "Successfully fetched course progress",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
