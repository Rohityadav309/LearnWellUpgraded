import { useEffect, useMemo, useRef, useState } from "react";
import { BiBot, BiLoaderAlt, BiSend } from "react-icons/bi";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { apiConnector } from "../../services/apiconnector.js";
import { chatEndpoints } from "../../services/apis.js";

const initialMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Hi, I can answer questions about your profile and enrolled courses using your current LearnWell data.",
};

const AIChatbot = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.profile.user);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const messagesEndRef = useRef(null);

  const canChat = useMemo(() => Boolean(token && user), [token, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleToggle = () => {
    if (!canChat) {
      toast.error("Please log in to use the AI assistant.");
      return;
    }

    setIsOpen((currentValue) => !currentValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiConnector(
        "POST",
        chatEndpoints.CHAT_WITH_AI_API,
        { message },
        {
          Authorization: `Bearer ${token}`,
        },
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response?.data?.reply || "I don't have that information",
        },
      ]);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Unable to reach the local AI assistant right now.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50 text-richblack-900 shadow-[0_12px_30px_rgba(255,214,10,0.35)] transition-all duration-200 hover:scale-105 hover:bg-yellow-25"
        aria-label="Open AI chatbot"
      >
        {isOpen ? (
          <FiX className="text-2xl" />
        ) : (
          <FiMessageCircle className="text-2xl" />
        )}
      </button>

      <div
        className={`fixed right-0 top-0 z-[999] flex h-screen w-full max-w-md transform flex-col border-l border-richblack-700 bg-richblack-800 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-richblack-700 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-50/10 p-2 text-yellow-50">
              <BiBot className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-richblack-5">
                LearnWell AI
              </p>
              <p className="text-xs text-richblack-300">
                Answers from your account data
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-richblack-300 transition hover:bg-richblack-700 hover:text-richblack-5"
            aria-label="Close AI chatbot"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.role === "user"
                    ? "bg-yellow-50 text-richblack-900"
                    : "bg-richblack-700 text-richblack-25"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-richblack-700 px-4 py-3 text-sm text-richblack-25">
                <BiLoaderAlt className="animate-spin text-lg" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-richblack-700 bg-richblack-800 px-4 py-4"
        >
          <div className="flex items-end gap-3 rounded-2xl border border-richblack-600 bg-richblack-700 px-3 py-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your courses or profile"
              className="w-full bg-transparent text-sm text-richblack-5 outline-none placeholder:text-richblack-400"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-richblack-900 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <BiSend className="text-xl" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AIChatbot;
