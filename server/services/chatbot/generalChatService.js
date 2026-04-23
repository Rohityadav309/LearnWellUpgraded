import { OLLAMA_ENDPOINT, OLLAMA_MODEL } from "./sharedUtils.js";

const GREETING_PATTERNS = [/^hi$/i, /^hello$/i, /^hey$/i, /^hello there$/i];

const GENERAL_QUERY_PATTERNS = [
  /\bwhat is\b/i,
  /\bhow to\b/i,
  /\bexplain\b/i,
  /\bdifference between\b/i,
  /\bwhy does\b/i,
  /\bexample\b/i,
  /\bcode\b/i,
  /\balgorithm\b/i,
  /\bjavascript\b/i,
  /\breact\b/i,
  /\bnode\b/i,
  /\bpython\b/i,
  /\binternet\b/i,
];

export const isGeneralQuery = (question = "") =>
  GENERAL_QUERY_PATTERNS.some((pattern) => pattern.test(question));

export const isGreetingQuery = (question = "") =>
  GREETING_PATTERNS.some((pattern) => pattern.test(question.trim()));

export const buildContextEnvelope = ({
  userLabel,
  personalSection,
  instructorSection,
  courseSection,
  categoriesSection,
  ambiguitySection,
}) => `[USER DATA]
Active User: ${userLabel}
${personalSection}

[PLATFORM DATA]
${instructorSection}

${courseSection}

${categoriesSection}

[AMBIGUITY NOTES]
${ambiguitySection}`;

export const buildGeneralPrompt = ({
  question,
  contextEnvelope,
  requiresStrictPlatformAnswer,
}) => `You are LeanWell AI.

For EVERY request, follow this exact thinking order:
STEP 1 - Analyze the QUESTION
STEP 2 - Analyze the provided DATA
STEP 3 - Decide the answer source
STEP 4 - Write the final answer

Strict answering policy:
- You will always receive structured sections named [USER DATA], [PLATFORM DATA], [AMBIGUITY NOTES], and [QUESTION].
- Read DATA first, then QUESTION, then answer.
- If the question is about the user or LeanWell platform, ONLY use the provided data.
- Do NOT use general knowledge for LearnWell-specific questions.
- If LeanWell-specific information is missing, reply exactly: "This information is not available in LeanWell."
- If a LearnWell course is missing, reply exactly: "This course is not available."
- If the question is general knowledge, answer using your own reasoning.
- If the question is ambiguous and multiple data matches exist, ask a short clarification question.
- If the question partially matches LearnWell data, prefer that data first and then reason carefully only if it does not conflict with the data.
- For simple greetings, respond naturally and briefly.
- Never expose raw JSON.
- Never hallucinate LeanWell data.
- Never mix general knowledge into a LearnWell-specific missing-data answer.

Strict platform mode: ${requiresStrictPlatformAnswer ? "enabled" : "disabled"}

[DATA]
${contextEnvelope}

[QUESTION]
${question}`;

export const getGeneralAssistantReply = async ({
  question,
  contextEnvelope,
  requiresStrictPlatformAnswer,
}) => {
  const prompt = buildGeneralPrompt({
    question,
    contextEnvelope,
    requiresStrictPlatformAnswer,
  });

  const response = await fetch(OLLAMA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  return response;
};
