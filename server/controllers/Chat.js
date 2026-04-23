import { getChatbotReply } from "../services/chatbot/chatOrchestrator.js";
import { RESPONSE_MESSAGES } from "../services/chatbot/sharedUtils.js";

export const chatWithAssistant = async (req, res) => {
  try {
    const question = req.body?.message?.trim();

    if (!question) {
      return res.status(400).json({
        success: false,
        message: RESPONSE_MESSAGES.invalidMessage,
      });
    }

    const result = await getChatbotReply({
      userId: req.user.id,
      question,
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: RESPONSE_MESSAGES.processingError,
    });
  }
};
