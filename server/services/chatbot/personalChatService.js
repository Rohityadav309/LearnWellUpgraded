import {
  RESPONSE_MESSAGES,
  formatDateOfBirth,
  parseAge,
} from "./sharedUtils.js";

export const PERSONAL_QUERY_PATTERNS = {
  age: [
    /\bage\b/i,
    /\bold am i\b/i,
    /\bhow old\b/i,
    /\byears old\b/i,
    /\bmy years\b/i,
  ],
  dob: [
    /\bdob\b/i,
    /date of birth/i,
    /birthday/i,
    /born on/i,
    /when was i born/i,
    /birth date/i,
  ],
  name: [
    /\bmy name\b/i,
    /\bwho am i\b/i,
    /\bwhat is my name\b/i,
    /\bfull name\b/i,
  ],
  courses: [
    /\bmy courses\b/i,
    /\benrolled courses\b/i,
    /\bwhat courses am i in\b/i,
    /\bcourses am i taking\b/i,
    /\bcourse list\b/i,
  ],
  contactNumber: [
    /\bcontact number\b/i,
    /\bphone number\b/i,
    /\bmobile number\b/i,
    /\bmy number\b/i,
  ],
  gender: [/\bgender\b/i, /\bmale or female\b/i, /\bsex\b/i],
  about: [
    /\babout me\b/i,
    /\bmy bio\b/i,
    /\bmyself\b/i,
    /\bprofile summary\b/i,
  ],
};

export const buildPersonalProfileData = (user) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const enrolledCourses =
    user.courses
      ?.map((course) => course.courseName)
      .filter(Boolean)
      .join(", ") || RESPONSE_MESSAGES.missingGenericData;

  return {
    name: fullName || RESPONSE_MESSAGES.missingGenericData,
    age: parseAge(user.additionalDetails?.dateOfBirth),
    dateOfBirth: formatDateOfBirth(user.additionalDetails?.dateOfBirth),
    contactNumber:
      user.additionalDetails?.contactNumber ||
      RESPONSE_MESSAGES.missingGenericData,
    gender:
      user.additionalDetails?.gender || RESPONSE_MESSAGES.missingGenericData,
    about:
      user.additionalDetails?.about || RESPONSE_MESSAGES.missingGenericData,
    courses: enrolledCourses,
  };
};

export const detectPersonalIntent = (question = "") => {
  const normalizedQuestion = question.toLowerCase();

  return Object.entries(PERSONAL_QUERY_PATTERNS).find(([, patterns]) =>
    patterns.some((pattern) => pattern.test(normalizedQuestion)),
  )?.[0];
};

export const buildPersonalAnswer = (intent, profileData) => {
  switch (intent) {
    case "age":
      return `Your age is ${profileData.age}.`;
    case "dob":
      return `Your date of birth is ${profileData.dateOfBirth}.`;
    case "name":
      return `Your name is ${profileData.name}.`;
    case "courses":
      return `Your enrolled courses are ${profileData.courses}.`;
    case "contactNumber":
      return `Your contact number is ${profileData.contactNumber}.`;
    case "gender":
      return `Your gender is ${profileData.gender}.`;
    case "about":
      return `Your profile summary is: ${profileData.about}`;
    default:
      return null;
  }
};

export const getMissingPersonalAnswer = () =>
  "This information is not available in LeanWell.";

export const handlePersonalQuery = ({ question, profileData }) => {
  const intent = detectPersonalIntent(question);

  if (!intent) {
    return null;
  }

  const answer = buildPersonalAnswer(intent, profileData);

  if (!answer) {
    return null;
  }

  return answer.includes(RESPONSE_MESSAGES.missingGenericData)
    ? getMissingPersonalAnswer()
    : answer;
};

export const buildPersonalPromptSection = (profileData) => `Personal Data:
Name: ${profileData.name}
Age: ${profileData.age}
Date of Birth: ${profileData.dateOfBirth}
Contact Number: ${profileData.contactNumber}
Gender: ${profileData.gender}
About: ${profileData.about}
Enrolled Courses: ${profileData.courses}`;
