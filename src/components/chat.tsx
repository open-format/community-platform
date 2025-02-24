"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sendMessage } from "@/lib/openformat";
import { getAddress } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { ChevronRight } from "lucide-react";
import type { default as React } from "react";
import { startTransition, useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface Message {
  id: number;
  text: string;
  type: "user" | "assistant";
  displayedText: string;
  message: {
    type: string;
    content: string;
    componentName?: string;
    props?: any;
  };
}

export default function ChatInterface({ communitySlug }: { communitySlug: string }) {
  const [inputValue, setInputValue] = useState("");
  const { user } = usePrivy();
  const address = getAddress(user);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 0,
      type: "assistant",
      text: "Hello, I'm the Open Format assistant. How are you?",
      displayedText: "Hello, I'm the Open Format assistant. How are you?",
      message: { type: "text", content: "Hello, I'm the OpenFormat assistant. How are you?" },
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isLoading]);

  function handleSubmit(e: React.FormEvent) {
    // 1. Add User message to chat
    const newUserMessage: Message = {
      id: chatMessages.length,
      type: "user",
      text: inputValue,
      displayedText: inputValue,
      message: {
        type: "text",
        content: inputValue,
      },
    };
    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue("");
    setIsLoading(true);
    startTransition(async () => {
      e.preventDefault();
      if (inputValue.trim() === "") return;

      // 2. Send message to OpenFormat
      try {
        setIsLoading(true);
        const response = await sendMessage(inputValue, communitySlug);

        // 3. Add Assistant message to chat
        if (response.text) {
          const assistantMessage: Message = {
            id: chatMessages.length + 1,
            type: "assistant",
            text: response.text,
            displayedText: response.text,
            message: {
              type: "text",
              content: response.text,
            },
          };
          setChatMessages((prevMessages) => [...prevMessages, assistantMessage]);
        }
      } catch (error) {
        setChatMessages((prevMessages) => [
          ...prevMessages,
          {
            id: chatMessages.length + 1,
            type: "assistant",
            text: "Sorry, something went wrong. Please try again.",
            displayedText: "Sorry, something went wrong. Please try again.",
            message: {
              type: "text",
              content: "Sorry, something went wrong. Please try again.",
            },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center text-white">
      <Card className="w-full max-w-2xl h-[90%] flex flex-col p-6 bg-[#111111] shadow-xl rounded-xl border-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#222222] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
            </div>
          </div>
        </div>
        <div
          ref={messagesContainerRef}
          className="flex-grow overflow-y-auto space-y-4 mb-4 min-h-[200px] max-h-[500px]"
        >
          {chatMessages.map((message) => {
            return (
              <div key={message.id} className="space-y-4">
                <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl ${
                      message.type === "user" ? "bg-[#222222] text-white px-6 py-3" : "text-white"
                    }  ${message.message.type === "component" ? "w-full max-w-full" : ""}`}
                  >
                    {message.message.type === "text" && (
                      <div className="whitespace-pre-wrap font-sans animate-fade-in">{message.message.content}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && <LoadingSpinner />}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="relative mt-auto">
          <input
            type="text"
            disabled={!address || isLoading}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={address ? "Type your message..." : "Please Login to continue..."}
            className="w-full bg-[#222222] text-white rounded-xl py-4 px-12 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button type="submit" size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
