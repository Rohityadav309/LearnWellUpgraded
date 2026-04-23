import { fetchChatbotData } from "./dbAggregatorService.js";
import { getGeneralAssistantReply } from "./generalChatService.js";
import { buildFinalPrompt } from "./promptFormatter.js";
import { RESPONSE_MESSAGES } from "./sharedUtils.js";

const buildAmbiguityResponse = ({ question, data }) => {
  const normalizedQuestion = question.toLowerCase();

  const matchedInstructors = data.instructors.filter((instructor) => {
    const fullName =
      `${instructor.firstName || ""} ${instructor.lastName || ""}`
        .trim()
        .toLowerCase();

    return fullName && normalizedQuestion.includes(fullName);
  });

  if (matchedInstructors.length > 1) {
    return "Can you specify which instructor you are referring to?";
  }

  return null;
};

export const getChatbotReply = async ({ userId, question }) => {
  const data = await fetchChatbotData(userId);

  if (!data) {
    return {
      status: 404,
      body: {
        success: false,
        message: RESPONSE_MESSAGES.userNotFound,
      },
    };
  }

  const ambiguityReply = buildAmbiguityResponse({ question, data });

  if (ambiguityReply) {
    return {
      status: 200,
      body: {
        success: true,
        reply: ambiguityReply,
      },
    };
  }

  const prompt = buildFinalPrompt({ data, question });
  const ollamaResponse = await getGeneralAssistantReply({
    question,
    contextEnvelope: prompt,
    requiresStrictPlatformAnswer: true,
  });

  if (!ollamaResponse.ok) {
    const errorText = await ollamaResponse.text();

    return {
      status: 502,
      body: {
        success: false,
        message: RESPONSE_MESSAGES.localAiUnavailable,
        error: errorText,
      },
    };
  }

  const result = await ollamaResponse.json();

  return {
    status: 200,
    body: {
      success: true,
      reply: result.response?.trim() || RESPONSE_MESSAGES.missingPlatformData,
    },
  };
};
