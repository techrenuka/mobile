import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

type InitialState = {
  isOpen: boolean;
  messages: Message[];
};

const initialState: InitialState = {
  isOpen: false,
  messages: [
    {
      text: "Hello! How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ],
};

export const chatBotSlice = createSlice({
  name: "chatBot",
  initialState,
  reducers: {
    toggleChatBot: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action: PayloadAction<{ text: string; isBot: boolean }>) => {
      state.messages.push({
        text: action.payload.text,
        isBot: action.payload.isBot,
        timestamp: new Date(),
      });
    },
    clearMessages: (state) => {
      state.messages = [
        {
          text: "Hello! How can I help you today?",
          isBot: true,
          timestamp: new Date(),
        },
      ];
    },
    closeChatBot: (state) => {
      state.isOpen = false;
    },
  },
});

export const { toggleChatBot, addMessage, clearMessages, closeChatBot } = chatBotSlice.actions;
export default chatBotSlice.reducer;