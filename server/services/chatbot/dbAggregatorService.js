import Category from "../../models/Category.js";
import Course from "../../models/Course.js";
import CourseProgress from "../../models/CourseProgress.js";
import User from "../../models/User.js";

const COURSE_LIMIT = 20;
const REVIEW_LIMIT = 5;

const formatProgressItems = (progressDocs = []) =>
  progressDocs.map((progress) => ({
    courseName: progress.courseID?.courseName || "Unknown Course",
    completedVideos: progress.completedVideos?.length || 0,
  }));

export const fetchChatbotData = async (userId) => {
  const userPromise = User.findById(userId)
    .populate("additionalDetails")
    .populate({
      path: "courses",
      select: "courseName price status",
      options: { limit: COURSE_LIMIT },
    })
    .lean();

  const progressPromise = CourseProgress.find({ userId })
    .populate({
      path: "courseID",
      select: "courseName",
    })
    .lean();

  const coursesPromise = Course.find({ status: "Published" })
    .select(
      "courseName courseDescription whatYouWillLearn price category instructor ratingAndReviews studentsEnrolled status",
    )
    .sort({ createdAt: -1 })
    .limit(COURSE_LIMIT)
    .populate("category", "name description")
    .populate({
      path: "instructor",
      select: "firstName lastName email additionalDetails accountType",
      populate: {
        path: "additionalDetails",
        select: "about gender contactNumber",
      },
    })
    .populate({
      path: "ratingAndReviews",
      select: "rating review user",
      options: { limit: REVIEW_LIMIT, sort: { rating: -1 } },
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .lean();

  const instructorsPromise = User.find({ accountType: "Instructor" })
    .select("firstName lastName email accountType additionalDetails")
    .populate("additionalDetails", "about gender contactNumber")
    .limit(COURSE_LIMIT)
    .lean();

  const categoriesPromise = Category.find()
    .select("name description")
    .limit(COURSE_LIMIT)
    .lean();

  const [user, progressDocs, courses, instructors, categories] =
    await Promise.all([
      userPromise,
      progressPromise,
      coursesPromise,
      instructorsPromise,
      categoriesPromise,
    ]);

  if (!user) {
    return null;
  }

  return {
    user,
    userProgress: formatProgressItems(progressDocs),
    courses,
    instructors,
    categories,
    topRatings: courses.flatMap((course) =>
      (course.ratingAndReviews || []).slice(0, REVIEW_LIMIT).map((review) => ({
        courseName: course.courseName,
        rating: review.rating,
        review: review.review,
        reviewer: [review.user?.firstName, review.user?.lastName]
          .filter(Boolean)
          .join(" "),
      })),
    ),
  };
};
