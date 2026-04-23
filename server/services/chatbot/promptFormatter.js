import {
  RESPONSE_MESSAGES,
  calculateAverageRating,
  formatCurrency,
  formatDateOfBirth,
  getUserDisplayName,
  parseAge,
} from "./sharedUtils.js";

const formatUserCourses = (courses = []) => {
  if (!courses.length) {
    return RESPONSE_MESSAGES.missingPlatformData;
  }

  return courses
    .map(
      (course) =>
        `${course.courseName} (${typeof course.price === "number" ? formatCurrency(course.price) : "Free"})`,
    )
    .join("\n");
};

const formatUserProgress = (progressItems = []) => {
  if (!progressItems.length) {
    return RESPONSE_MESSAGES.missingPlatformData;
  }

  return progressItems
    .map(
      (item) =>
        `${item.courseName}: ${item.completedVideos} completed video${item.completedVideos === 1 ? "" : "s"}`,
    )
    .join("\n");
};

const formatUserData = ({
  user,
  userProgress,
}) => `Name: ${getUserDisplayName(user)}
Email: ${user.email || RESPONSE_MESSAGES.missingPlatformData}
Account Type: ${user.accountType || RESPONSE_MESSAGES.missingPlatformData}
Date of Birth: ${formatDateOfBirth(user.additionalDetails?.dateOfBirth)}
Age: ${parseAge(user.additionalDetails?.dateOfBirth)}
Contact Number: ${user.additionalDetails?.contactNumber || RESPONSE_MESSAGES.missingPlatformData}
About: ${user.additionalDetails?.about || RESPONSE_MESSAGES.missingPlatformData}
Enrolled Courses:
${formatUserCourses(user.courses)}
Progress:
${formatUserProgress(userProgress)}`;

const formatCourses = (courses = []) => {
  if (!courses.length) {
    return RESPONSE_MESSAGES.missingPlatformData;
  }

  return courses
    .map((course) => {
      const instructorName = course.instructor
        ? getUserDisplayName(course.instructor)
        : RESPONSE_MESSAGES.missingPlatformData;
      const categoryName =
        course.category?.name || RESPONSE_MESSAGES.missingPlatformData;
      const rating = calculateAverageRating(course.ratingAndReviews || []);

      return [
        `${course.courseName} by ${instructorName}`,
        `Price: ${typeof course.price === "number" ? formatCurrency(course.price) : "Free"}`,
        `Category: ${categoryName}`,
        `Rating: ${rating ? `${rating}/5` : RESPONSE_MESSAGES.missingPlatformData}`,
        `Description: ${course.courseDescription || RESPONSE_MESSAGES.missingPlatformData}`,
      ].join("\n");
    })
    .join("\n\n");
};

const formatInstructors = (instructors = []) => {
  if (!instructors.length) {
    return RESPONSE_MESSAGES.missingPlatformData;
  }

  return instructors
    .map((instructor) =>
      [
        `Name: ${getUserDisplayName(instructor)}`,
        `Email: ${instructor.email || RESPONSE_MESSAGES.missingPlatformData}`,
        `Account Type: ${instructor.accountType || RESPONSE_MESSAGES.missingPlatformData}`,
        `About: ${instructor.additionalDetails?.about || RESPONSE_MESSAGES.missingPlatformData}`,
        `Contact Number: ${instructor.additionalDetails?.contactNumber || RESPONSE_MESSAGES.missingPlatformData}`,
      ].join("\n"),
    )
    .join("\n\n");
};

const formatCategories = (categories = []) => {
  if (!categories.length) {
    return RESPONSE_MESSAGES.missingPlatformData;
  }

  return categories
    .map(
      (category) =>
        `Name: ${category.name}\nDescription: ${category.description || RESPONSE_MESSAGES.missingPlatformData}`,
    )
    .join("\n\n");
};

const formatRatings = (ratings = []) => {
  if (!ratings.length) {
    return RESPONSE_MESSAGES.missingPlatformData;
  }

  return ratings
    .map(
      (rating) =>
        `${rating.courseName} - ${rating.rating}/5 by ${rating.reviewer || "Unknown User"}\nReview: ${rating.review || RESPONSE_MESSAGES.missingPlatformData}`,
    )
    .join("\n\n");
};

export const buildFinalPrompt = ({ data, question }) => {
  const userDataSection = formatUserData({
    user: data.user,
    userProgress: data.userProgress,
  });

  const platformDataSection = [
    "Courses:",
    formatCourses(data.courses),
    "",
    "Instructors:",
    formatInstructors(data.instructors),
    "",
    "Categories:",
    formatCategories(data.categories),
    "",
    "Top Ratings:",
    formatRatings(data.topRatings),
  ].join("\n");

  return `SYSTEM:

You are LeanWell AI.

🚨 OUTPUT RULE (STRICT)

Return ONLY the final answer.

No explanations
No reasoning
No extra words
🧠 QUESTION PRIORITY (VERY IMPORTANT)
Answer ONLY the CURRENT QUESTION
Ignore previous conversation unless explicitly needed
DO NOT reuse previous answers
🧠 DATA USAGE RULE
If question is about user or LeanWell → use ONLY provided data
If data missing → return exactly:
This information is not available in LeanWell.
🌍 GENERAL KNOWLEDGE RULE
If question is NOT related to LeanWell
→ Answer using your own knowledge
❌ CRITICAL RESTRICTIONS
DO NOT mix unrelated data
DO NOT combine answers incorrectly
DO NOT guess
DO NOT reuse previous outputs
🧾 FORMAT RULE
Short answer → ONE LINE
Multiple parts → answer clearly separated
✅ EXAMPLES

Q: What is my age
A: 22

Q: Who is the Prime Minister of Japan
A: Fumio Kishida

Q: What is my age and capital of India
A: 22 and New Delhi

Q: Who is the Prime Minister of Japan (after India question)
A: Fumio Kishida

🚨 FINAL RULE

Answer ONLY based on the CURRENT question.


feed my this all data below one then aswer in your own way ok but in your response question should not be repeated also answer smartly by feeding my data ok so that no can identify that you are feeded my data ok 
from you response user not able to identify that yor are feeded the someonce data or you are force to answer in this way ok.answe smartly.
USER DATA:
${userDataSection}

PLATFORM DATA:
${platformDataSection}

QUESTION:
${question}

ANSWER:(answer in your own way like )`;
};
