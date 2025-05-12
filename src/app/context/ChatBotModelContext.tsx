"use client"
import React, { createContext, useContext, useState } from "react";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatBotContextType {
  isModalOpen: boolean;
  messages: Message[];
  openModal: () => void;
  closeModal: () => void;
  addMessage: (message: string, isBot: boolean) => void;
  clearMessages: () => void;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export const useChatBotContext = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error("useChatBotContext must be used within a ChatBotProvider");
  }
  return context;
};

export const ChatBotProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addMessage = (text: string, isBot: boolean) => {
    setMessages((prev) => [
      ...prev,
      {
        text,
        isBot,
        timestamp: new Date(),
      },
    ]);
  };

  const clearMessages = () => {
    setMessages([
      {
        text: "Hello! How can I help you today?",
        isBot: true,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <ChatBotContext.Provider
      value={{
        isModalOpen,
        messages,
        openModal,
        closeModal,
        addMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatBotContext.Provider>
  );
};