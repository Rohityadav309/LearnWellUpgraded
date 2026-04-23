import {
  RESPONSE_MESSAGES,
  calculateAverageRating,
  formatCourseSummary,
  formatCurrency,
  formatInstructorSummary,
  getAlternativeCourses,
  inferCategoryFromQuestion,
  pickMatchedCourse,
} from "./sharedUtils.js";

export const COURSE_QUERY_PATTERNS = {
  list: [
    /\bcourses\b/i,
    /\bcourse catalogue\b/i,
    /\bcourse catalog\b/i,
    /\bavailable courses\b/i,
  ],
  price: [/\bprice\b/i, /\bcost\b/i, /\bfee\b/i],
  rating: [/\brating\b/i, /\breview\b/i, /\breviews\b/i],
  instructor: [/\binstructor\b/i, /\bmentor\b/i, /\bteacher\b/i],
  category: [/\bcategory\b/i, /\bsubject\b/i],
  detail: [
    /\bdetails\b/i,
    /\babout course\b/i,
    /\bwhat is\b/i,
    /\bsyllabus\b/i,
    /\blearn\b/i,
  ],
  availability: [/\bavailable\b/i, /\boffer\b/i, /\bhave\b/i],
};

export const detectCourseIntent = (question = "") => {
  const intentEntries = Object.entries(COURSE_QUERY_PATTERNS);
  const matchedIntent = intentEntries.find(([, patterns]) =>
    patterns.some((pattern) => pattern.test(question)),
  );

  return matchedIntent?.[0] || null;
};

export const handleCourseQuery = ({ question, courses, categories }) => {
  const courseIntent = detectCourseIntent(question);

  if (!courseIntent) {
    return null;
  }

  if (courseIntent === "list") {
    if (!courses.length) {
      return "This course is not available right now.";
    }

    const matchedCategory = inferCategoryFromQuestion(question, categories);

    if (matchedCategory) {
      const filteredCourses = courses.filter(
        (course) =>
          String(course.category?._id) === String(matchedCategory._id),
      );

      return filteredCourses.length
        ? `${matchedCategory.name} courses are: ${filteredCourses
            .slice(0, 10)
            .map((course) => course.courseName)
            .join(", ")}.`
        : `This course is not available in ${matchedCategory.name}.`;
    }

    return `Available courses are: ${courses
      .slice(0, 10)
      .map((course) => course.courseName)
      .join(", ")}.`;
  }

  const matchedCourse = pickMatchedCourse(question, courses);

  if (!matchedCourse) {
    const alternatives = getAlternativeCourses(courses);

    return alternatives.length
      ? `This course is not available. You can explore these alternatives: ${alternatives.join(", ")}.`
      : RESPONSE_MESSAGES.courseUnavailable;
  }

  if (courseIntent === "price") {
    return `The price of ${matchedCourse.courseName} is ${formatCurrency(matchedCourse.price)}.`;
  }

  if (courseIntent === "rating") {
    const averageRating = calculateAverageRating(
      matchedCourse.ratingAndReviews,
    );

    return averageRating
      ? `The rating of ${matchedCourse.courseName} is ${averageRating}/5.`
      : `I don't have information about the rating of ${matchedCourse.courseName}.`;
  }

  if (courseIntent === "instructor") {
    if (!matchedCourse.instructor) {
      return `I don't have information about the instructor for ${matchedCourse.courseName}.`;
    }

    const instructorCourses = courses.filter(
      (course) =>
        String(course.instructor?._id) ===
        String(matchedCourse.instructor?._id),
    );

    return formatInstructorSummary(matchedCourse.instructor, instructorCourses);
  }

  if (courseIntent === "availability") {
    return `${matchedCourse.courseName} is available on LeanWell.`;
  }

  return formatCourseSummary(matchedCourse);
};

export const buildCoursePromptSection = (courses, categories) => {
  const courseCatalogue = courses.length
    ? courses.map((course) => formatCourseSummary(course)).join("\n\n")
    : RESPONSE_MESSAGES.missingGenericData;

  const categorySummary = categories.length
    ? categories.map((category) => category.name).join(", ")
    : RESPONSE_MESSAGES.missingGenericData;

  return `Course Catalogue:
${courseCatalogue}

Categories:
${categorySummary}`;
};
