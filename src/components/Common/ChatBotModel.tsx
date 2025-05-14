"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { closeChatBot } from "@/redux/features/chatBot-slice";
import { useChatBotContext } from "@/app/context/ChatBotModelContext";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ApiResponse {
  question: string;
  answer: string;
  audio_file: string | null;
}

const ChatBotModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.chatBotReducer.isOpen);
  const { isModalOpen, closeModal } = useChatBotContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          text: inputMessage,
          isBot: false,
          timestamp: new Date(),
        },
      ]);

      setIsLoading(true);

      try {
        // Call the chatbot API with the correct parameter name "question"
        const response = await fetch("https://mobile-rag-python.onrender.com/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            question: inputMessage // Changed from "message" to "question"
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to get response from chatbot: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        
        // Add bot response
        setMessages((prev) => [
          ...prev,
          {
            text: data.answer || "Sorry, I couldn't process your request at the moment.",
            isBot: true,
            timestamp: new Date(),
          },
        ]);

        // Play audio if available
        if (data.audio_file) {
          // Stop any currently playing audio
          if (audioPlaying) {
            audioPlaying.pause();
            audioPlaying.currentTime = 0;
          }
          
          const audioUrl = `https://mobile-rag-python.onrender.com/audio/${data.audio_file}`;
          const audio = new Audio(audioUrl);
          audio.play();
          setAudioPlaying(audio);
        }
      } catch (error) {
        console.error("Error calling chatbot API:", error);
        
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, there was an error processing your request. Please try again later.",
            isBot: true,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setInputMessage("");
      }
    }
  };

  const handleClose = () => {
    // Stop any playing audio
    if (audioPlaying) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
    }
    
    closeModal();
    dispatch(closeChatBot());
  };

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div
      className={`${
        isOpen ? "z-[9999]" : "hidden"
      } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 flex items-center justify-center p-4 sm:p-6 md:p-8`}
    >
      <div className="w-full bg-white max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] h-[80vh] rounded-xl shadow-lg bg-[] relative modal-content flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#3c50e0] p-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Mobile Expert</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/90 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Close chat"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isBot ? "justify-start" : "justify-end"
                }`}
              >
                {message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl p-3 ${
                    message.isBot
                      ? "bg-white text-gray-800 shadow-sm border border-gray-100"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <p className="text-sm md:text-base">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {!message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ml-2">
                    <span className="text-white text-sm">You</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="max-w-[70%] rounded-2xl p-3 bg-white text-gray-800 shadow-sm border border-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t bg-white rounded-b-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about smartphones..."
              className="flex-1 border border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm md:text-base transition-all duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              className={`bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              <span className="hidden sm:inline">{isLoading ? 'Sending...' : 'Send'}</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotModal;