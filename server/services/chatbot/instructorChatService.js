import {
  RESPONSE_MESSAGES,
  calculateAverageRating,
  formatInstructorSummary,
  getUserDisplayName,
  inferCategoryFromQuestion,
  pickMatchedInstructor,
} from "./sharedUtils.js";

const INSTRUCTOR_PATTERNS = [
  /\binstructor\b/i,
  /\bmentor\b/i,
  /\bteacher\b/i,
  /\btrainer\b/i,
  /\bfaculty\b/i,
];

export const isInstructorQuery = (question = "") =>
  INSTRUCTOR_PATTERNS.some((pattern) => pattern.test(question));

export const handleInstructorQuery = ({
  question,
  instructors,
  courses,
  categories,
}) => {
  if (!isInstructorQuery(question)) {
    return null;
  }

  const matchedCategory = inferCategoryFromQuestion(question, categories);

  if (matchedCategory) {
    const categoryCourses = courses.filter(
      (course) => String(course.category?._id) === String(matchedCategory._id),
    );

    const categoryInstructors = instructors.filter((instructor) =>
      categoryCourses.some(
        (course) => String(course.instructor?._id) === String(instructor._id),
      ),
    );

    if (!categoryInstructors.length) {
      return `I don't have information about mentors who teach ${matchedCategory.name}.`;
    }

    return categoryInstructors
      .map((instructor) => {
        const instructorCourses = categoryCourses.filter(
          (course) => String(course.instructor?._id) === String(instructor._id),
        );
        const averageRating = calculateAverageRating(
          instructorCourses.flatMap((course) => course.ratingAndReviews || []),
        );

        return `${getUserDisplayName(instructor)} - Rating: ${
          averageRating
            ? `${averageRating}/5`
            : RESPONSE_MESSAGES.missingGenericData
        }`;
      })
      .join("\n");
  }

  const matchedInstructor = pickMatchedInstructor(question, instructors);

  if (!matchedInstructor) {
    return "I don't have information about that instructor.";
  }

  const instructorCourses = courses.filter(
    (course) =>
      String(course.instructor?._id) === String(matchedInstructor._id),
  );

  return formatInstructorSummary(matchedInstructor, instructorCourses);
};

export const buildInstructorPromptSection = (instructors, courses) => {
  if (!instructors.length) {
    return `Instructor Data:\n${RESPONSE_MESSAGES.missingGenericData}`;
  }

  return `Instructor Data:\n${instructors
    .map((instructor) => {
      const instructorCourses = courses.filter(
        (course) => String(course.instructor?._id) === String(instructor._id),
      );

      return formatInstructorSummary(instructor, instructorCourses);
    })
    .join("\n\n")}`;
};
