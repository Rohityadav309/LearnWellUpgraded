const MAX_SUGGESTIONS = 3;

export const OLLAMA_ENDPOINT =
  process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

export const STOP_WORDS = new Set([
  "a",
  "about",
  "all",
  "an",
  "and",
  "are",
  "can",
  "course",
  "courses",
  "details",
  "for",
  "from",
  "give",
  "have",
  "in",
  "is",
  "know",
  "list",
  "me",
  "mentor",
  "mentors",
  "of",
  "on",
  "price",
  "rating",
  "show",
  "teach",
  "teacher",
  "teachers",
  "tell",
  "the",
  "this",
  "to",
  "what",
  "who",
]);

export const RESPONSE_MESSAGES = {
  missingPlatformData: "This information is not available in LeanWell.",
  missingGenericData: "I don't have that information.",
  courseUnavailable: "This course is not available.",
  localAiUnavailable:
    "Local AI service is unavailable due to some internal issues",
  invalidMessage: "Message is required",
  userNotFound: "User not found",
  processingError: "Unable to process chat request",
};

export const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const extractMeaningfulTokens = (value = "") =>
  normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

export const getUserDisplayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

export const formatCurrency = (value) => {
  if (typeof value !== "number") {
    return RESPONSE_MESSAGES.missingGenericData;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const calculateAverageRating = (ratings = []) => {
  if (!ratings.length) {
    return null;
  }

  const total = ratings.reduce((sum, item) => sum + (item.rating || 0), 0);
  return (total / ratings.length).toFixed(1);
};

export const parseAge = (dateOfBirth) => {
  if (!dateOfBirth) {
    return RESPONSE_MESSAGES.missingGenericData;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return RESPONSE_MESSAGES.missingGenericData;
  }

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDifference = now.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && now.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? String(age) : RESPONSE_MESSAGES.missingGenericData;
};

export const formatDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return RESPONSE_MESSAGES.missingGenericData;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return String(dateOfBirth);
  }

  return birthDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const getAlternativeCourses = (courses, excludeCourseId = null) =>
  courses
    .filter((course) => String(course._id) !== String(excludeCourseId || ""))
    .slice(0, MAX_SUGGESTIONS)
    .map((course) => course.courseName);

export const buildCourseSearchText = (course) =>
  normalizeText(
    [
      course.courseName,
      course.courseDescription,
      course.whatYouWillLearn,
      course.category?.name,
      course.instructor ? getUserDisplayName(course.instructor) : "",
      ...(course.tag || []),
    ].join(" "),
  );

export const buildInstructorSearchText = (instructor) =>
  normalizeText(
    [
      getUserDisplayName(instructor),
      instructor.additionalDetails?.about,
      instructor.additionalDetails?.gender,
      instructor.email,
    ].join(" "),
  );

export const pickMatchedCourse = (question, courses) => {
  const normalizedQuestion = normalizeText(question);
  const tokens = extractMeaningfulTokens(question);

  return (
    courses.find((course) =>
      normalizedQuestion.includes(normalizeText(course.courseName)),
    ) ||
    courses.find((course) =>
      buildCourseSearchText(course).includes(normalizedQuestion),
    ) ||
    courses.find((course) =>
      tokens.every((token) => buildCourseSearchText(course).includes(token)),
    ) ||
    null
  );
};

export const pickMatchedInstructor = (question, instructors) => {
  const normalizedQuestion = normalizeText(question);
  const tokens = extractMeaningfulTokens(question);

  return (
    instructors.find((instructor) =>
      normalizedQuestion.includes(
        normalizeText(getUserDisplayName(instructor)),
      ),
    ) ||
    instructors.find((instructor) =>
      tokens.every((token) =>
        buildInstructorSearchText(instructor).includes(token),
      ),
    ) ||
    null
  );
};

export const inferCategoryFromQuestion = (question, categories) => {
  const normalizedQuestion = normalizeText(question);
  const tokens = extractMeaningfulTokens(question);

  return (
    categories.find((category) =>
      normalizedQuestion.includes(normalizeText(category.name)),
    ) ||
    categories.find((category) => {
      const categoryTokens = extractMeaningfulTokens(category.name);
      return categoryTokens.some((token) => tokens.includes(token));
    }) ||
    null
  );
};

export const formatCourseSummary = (course) => {
  const instructorName = course.instructor
    ? getUserDisplayName(course.instructor)
    : RESPONSE_MESSAGES.missingGenericData;
  const categoryName =
    course.category?.name || RESPONSE_MESSAGES.missingGenericData;
  const averageRating = calculateAverageRating(course.ratingAndReviews);

  return [
    `Course: ${course.courseName}`,
    `Instructor: ${instructorName}`,
    `Category: ${categoryName}`,
    `Price: ${formatCurrency(course.price)}`,
    `Rating: ${averageRating ? `${averageRating}/5` : RESPONSE_MESSAGES.missingGenericData}`,
    `Description: ${course.courseDescription || RESPONSE_MESSAGES.missingGenericData}`,
  ].join("\n");
};

export const formatInstructorSummary = (instructor, courses = []) => {
  const averageRating = calculateAverageRating(
    courses.flatMap((course) => course.ratingAndReviews || []),
  );

  return [
    `Instructor: ${getUserDisplayName(instructor) || RESPONSE_MESSAGES.missingGenericData}`,
    `Email: ${instructor.email || RESPONSE_MESSAGES.missingGenericData}`,
    `About: ${instructor.additionalDetails?.about || RESPONSE_MESSAGES.missingGenericData}`,
    `Gender: ${instructor.additionalDetails?.gender || RESPONSE_MESSAGES.missingGenericData}`,
    `Rating: ${averageRating ? `${averageRating}/5` : RESPONSE_MESSAGES.missingGenericData}`,
    `Courses: ${courses.length ? courses.map((course) => course.courseName).join(", ") : RESPONSE_MESSAGES.missingGenericData}`,
  ].join("\n");
};
