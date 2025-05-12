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

  const handleSendMessage = () => {
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

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your message. Our team will get back to you soon.",
            isBot: true,
            timestamp: new Date(),
          },
        ]);
      }, 1000);

      setInputMessage("");
    }
  };

  const handleClose = () => {
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
        isOpen ? "z-99999" : "hidden"
      } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5`}
    >
      <div className="flex items-center justify-center">
        <div className="w-1/2 h-125 rounded-xl shadow-3 bg-white relative modal-content flex flex-col">
          {/* Chat Header */}
          <div className="bg-blue m-2 p-4 flex justify-between items-center rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue"
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
                <h3 className="text-white font-semibold">Support Chat</h3>
                <p className="text-white/70 text-sm">Online</p>
              </div>
            </div>
            {/* close button */}
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
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
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%]  rounded-xl border border-gray-2 p-3 ${ 
                      message.isBot
                        ? "bg-gray-100 text-dark shadow-sm"
                        : "bg-blue text-white shadow-sm"
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue text-white px-4 py-2 rounded-lg hover:bg-blue-dark transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotModal;
