"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { closeChatBot } from "@/redux/features/chatBot-slice";
import { useChatBotContext } from "@/app/context/ChatBotModelContext";
import ProductCard, { Product } from "./ProductCard";
import ReactMarkdown from "react-markdown";
import shopData from "@/components/Shop/shopData";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  products?: Product[];
  showAsCard?: boolean;
}

interface ApiResponse {
  question: string;
  message: string;
  audio_file: string | null;
  products?: Product[];
}

const ChatBotModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.chatBotReducer.isOpen);
  const { isModalOpen, closeModal } = useChatBotContext();
  const selectedProduct = useSelector((state: RootState) => state.quickViewReducer.product);
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<typeof window.SpeechRecognition | null>(null);
  const carouselRefs = useRef<Map<number, HTMLDivElement>>(new Map()); // Ref for each carousel
  const messagesEndRef = useRef<HTMLDivElement>(null); // Add this ref for auto-scrolling

  // Add this function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add useEffect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add useEffect to display product details when modal opens
  useEffect(() => {
    if (isOpen && selectedProduct && selectedProduct.id) {
      // Find the product in shopData by ID
      const productDetails = shopData.find(product => product.id === selectedProduct.id);
      
      if (productDetails) {
        // Format product details as markdown bullet points
        const formattedDetails = formatProductDetails(productDetails);
        
        // Add a message with the product details
        setMessages((prev) => [
          ...prev,
          {
            text: formattedDetails,
            isBot: true,
            timestamp: new Date(),
            showAsCard: false,
          },
        ]);
      }
    }
  }, [isOpen, selectedProduct]);

  // Function to format product details as markdown bullet points
  const formatProductDetails = (product: Product): string => {
    let details = `## ${product.title}\n\n`;
    
    details += `* **Brand:** ${product.brand_name || 'N/A'}\n`;
    details += `* **Price:** $${product.price}\n`;
    details += `* **Specs Score:** ${product.specs_score || 'N/A'}\n`;
    
    if (product.processor_brand) details += `* **Processor:** ${product.processor_brand}\n`;
    if (product.ram_capacity) details += `* **RAM:** ${product.ram_capacity} GB\n`;
    if (product.internal_memory) details += `* **Storage:** ${product.internal_memory} GB\n`;
    if (product.screen_size) details += `* **Screen Size:** ${product.screen_size} inches\n`;
    
    details += `* **5G Support:** ${product.has_5g ? 'Yes' : 'No'}\n`;
    details += `* **NFC Support:** ${product.has_nfc ? 'Yes' : 'No'}\n`;
    
    
    return details;
  };

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
        const response = await fetch("https://mobile-rag-python.onrender.com/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            question: inputMessage,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get response from chatbot: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        // Map backend product structure to Product interface
        const mappedProducts = data.products?.map((p) => ({
          brand_name: p.brand_name,
          model: p.model || p.title,
          title: p.title,
          price: p.price,
          rating: p.specs_score || 0,
          imgs: p.imgs || { 
            thumbnails: p.image_url ? [p.image_url] : undefined 
          },
          // Optional fields not provided by backend can be omitted or set to undefined
          processor_brand: p.processor_brand,
          ram_capacity: p.ram_capacity,
          internal_memory: p.internal_memory,
          screen_size: p.screen_size,
          has_5g: p.has_5g,
          has_nfc: p.has_nfc,
        })) || undefined;

        // Add bot response
        setMessages((prev) => [
          ...prev,
          {
            text: data.message || "Sorry, I couldn't process your request at the moment.",
            isBot: true,
            timestamp: new Date(),
            products: mappedProducts,
          },
        ]);

        // Play audio if available
        if (data.audio_file) {
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

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } else {
      alert('Speech recognition is not supported in your browser. Please try using Chrome or Edge.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleClose = () => {
    if (audioPlaying) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
    }

    if (isListening) {
      stopListening();
    }

    closeModal();
    dispatch(closeChatBot());
  };

  // Carousel navigation functions
  const scrollLeft = (messageIndex: number) => {
    const carousel = carouselRefs.current.get(messageIndex);
    if (carousel) {
      carousel.scrollBy({ left: -300, behavior: 'smooth' }); // Adjust scroll distance as needed
    }
  };

  const scrollRight = (messageIndex: number) => {
    const carousel = carouselRefs.current.get(messageIndex);
    if (carousel) {
      carousel.scrollBy({ left: 300, behavior: 'smooth' }); // Adjust scroll distance as needed
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest(".modal-content")) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'unset';

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen]);

  return (
    <div
      className={`${
        isOpen ? "z-[9999]" : "hidden"
      } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8`}
    >
      <div className="w-full bg-white max-w-[98%] xs:max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] h-[90vh] xs:h-[85vh] sm:h-[80vh] rounded-xl shadow-lg relative modal-content flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#3c50e0] p-2 sm:p-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
              <h3 className="text-white font-semibold text-base sm:text-lg">Mobile Expert</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/90 hover:text-white transition-colors p-1 sm:p-2 hover:bg-white/10 rounded-lg"
            aria-label="Close chat"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50">
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  message.isBot ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  {message.isBot && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue flex items-center justify-center mr-1 sm:mr-2 flex-shrink-0">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                    className={`max-w-[80%] xs:max-w-[75%] sm:max-w-[70%] rounded-2xl p-2 sm:p-3 ${
                      message.isBot
                        ? "bg-white text-gray-800 shadow-sm border border-gray-100"
                        : "bg-blue text-white"
                    }`}
                  >
                    {message.isBot ? (
                      <div className="markdown-content text-xs sm:text-sm md:text-base">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm md:text-base">{message.text}</p>
                    )}
                    <span className="text-[10px] xs:text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {!message.isBot && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue flex items-center justify-center ml-1 sm:ml-2 flex-shrink-0">
                      <span className="text-white text-[10px] sm:text-sm">You</span>
                    </div>
                  )}
                </div>

                {/* Product Recommendations in Carousel - Only show if showAsCard is not false */}
                {message.isBot && message.products && message.products.length > 0 && message.showAsCard !== false && (
                  <div className="mt-2 sm:mt-3 pl-6 sm:pl-10 max-w-[90%] xs:max-w-[85%] sm:max-w-[80%] lg:max-w-[70%]">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Recommended Products:</h4>
                    <div className="relative">
                      {/* Carousel Container */}
                      <div
                        ref={(el) => {
                          if (el) carouselRefs.current.set(index, el);
                        }}
                        className="flex overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory scroll-smooth gap-2 sm:gap-4 pb-2 whitespace-nowrap"
                      >
                        {message.products.map((product, productIndex) => (
                          <div key={productIndex} className="snap-start flex-shrink-0 w-[180px] xs:w-[220px] sm:w-[250px] md:w-[280px] min-w-[180px] xs:min-w-[220px] sm:min-w-[250px] md:min-w-[280px]">
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>

                      {/* Navigation Arrows - Hide on smallest screens */}
                      {message.products.length > 1 && (
                        <>
                          {/* Left Arrow */}
                          <button
                            onClick={() => scrollLeft(index)}
                            className="hidden xs:block absolute -left-6 sm:-left-10 top-1/2 transform -translate-y-1/2 bg-blue hover:bg-gray-300 text-white rounded-full p-1 sm:p-2 shadow-md"
                            aria-label="Scroll left"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>

                          {/* Right Arrow */}
                          <button
                            onClick={() => scrollRight(index)}
                            className="hidden xs:block absolute -right-6 sm:-right-10 top-1/2 transform -translate-y-1/2 bg-blue hover:bg-gray-300 text-white rounded-full p-1 sm:p-2 shadow-md"
                            aria-label="Scroll right"
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue flex items-center justify-center mr-1 sm:mr-2 flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                <div className="max-w-[80%] xs:max-w-[75%] sm:max-w-[70%] rounded-2xl p-2 sm:p-3 bg-white text-gray-800 shadow-sm border border-gray-100">
                  <div className="flex space-x-1 sm:space-x-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {/* Add this div at the end of messages for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-2 sm:p-4 border-t bg-white rounded-b-xl">
          <div className="flex gap-1 sm:gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about smartphones..."
              className="flex-1 border border-gray-200 rounded-full px-3 sm:px-6 py-2 sm:py-3 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm md:text-base transition-all duration-200"
              disabled={isLoading || isListening}
            />

            <button
              onClick={toggleVoiceInput}
              className={`${
                isListening ? "bg-red hover:bg-red" : "bg-blue"
              } text-white px-2 sm:px-4 py-2 sm:py-3 rounded-full transition-colors flex items-center justify-center shadow-sm`}
              disabled={isLoading}
              aria-label={isListening ? "Stop recording" : "Start voice input"}
            >
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isListening ? "text-white" : "text-gray"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isListening ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                )}
              </svg>
            </button>

            <button
              onClick={handleSendMessage}
              className={`bg-blue text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue transition-colors flex items-center gap-1 sm:gap-2 shadow-sm ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              <span className="hidden xs:inline text-xs sm:text-sm">{isLoading ? "Sending..." : "Send"}</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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