"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sendMessage } from "@/lib/openformat";
import { ChevronRight, Settings } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface Message {
  id: number;
  text: string;
  type: "user" | "assistant";
  displayedText: string;
  message: {
    type: string;
    content: string;
  };
}

export default function Chat({ communitySlug }: { communitySlug: string }) {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    try {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }

      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    } catch (error) {
      console.error("Scrolling error:", error);
    }
  }, [chatMessages]);

  useEffect(() => {
    const scrollAttempts = [
      () => scrollToBottom(),
      () => setTimeout(scrollToBottom, 100),
      () => setTimeout(scrollToBottom, 300),
    ];

    for (const attempt of scrollAttempts) {
      attempt();
    }

    return () => {
      for (const attempt of scrollAttempts) {
        if (typeof attempt === "function") {
          clearTimeout(attempt as any);
        }
      }
    };
  }, [chatMessages, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!inputMessage.trim()) return;

      // Add User message to chat
      const newUserMessage: Message = {
        id: chatMessages.length,
        type: "user",
        text: inputMessage,
        displayedText: inputMessage,
        message: {
          type: "text",
          content: inputMessage,
        },
      };
      setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputMessage("");

      // Show loading spinner
      setIsLoading(true);

      try {
        // Wait for response from sendMessage
        const response = await sendMessage(inputMessage, communitySlug);

        // Create Assistant message
        const assistantMessage: Message = {
          id: chatMessages.length + 1,
          type: "assistant",
          text: response.text || "No response received.",
          displayedText: response.text || "No response received.",
          message: {
            type: "text",
            content: response.text || "No response received.",
          },
        };

        // Add assistant message to chat
        setChatMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error("Error sending message:", error);

        const errorMessage: Message = {
          id: chatMessages.length + 1,
          type: "assistant",
          text: "Failed to send message. Please try again.",
          displayedText: "Failed to send message. Please try again.",
          message: {
            type: "text",
            content: "Failed to send message. Please try again.",
          },
        };

        setChatMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputMessage, communitySlug, chatMessages]
  );

  return (
    <Card className="w-full h-[90%] flex flex-col p-6 bg-[#111111] shadow-xl rounded-xl border-0">
      <div ref={messagesContainerRef} className="flex-grow overflow-y-auto space-y-4 mb-4">
        {chatMessages.map((message) => (
          <div key={message.id} className="space-y-4">
            <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl ${
                  message.type === "user" ? "bg-[#222222] text-white px-6 py-3" : "text-white"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans animate-fade-in">{message.message.content}</div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && <LoadingSpinner />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="relative mt-auto">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full bg-[#222222] text-white rounded-xl py-4 px-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          disabled={isLoading || !inputMessage.trim()}
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Button>
        <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2">
          <Settings className="w-5 h-5 text-gray-400" />
        </Button>
      </form>
    </Card>
  );
}
