"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Lightbulb, Bot, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Mode, Message } from "@/app/page"

interface ChatComponentProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  messages: Message[]
  onSendMessage: (content: string) => void
  theme: "light" | "dark"
}

export function ChatComponent({ mode, onModeChange, messages, onSendMessage, theme }: ChatComponentProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getPlaceholder = () => {
    switch (mode) {
      case "generator":
        return "Describe the CAD element you want to create..."
      case "assistant":
        return "Ask me anything about CATIA or CAD design..."
      case "refiner":
        return "Describe how you want to improve the code..."
    }
  }

  return (
    <div className={`flex flex-col h-full ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      {/* Mode Switcher */}
      <div className={`border-b ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
        <div className="flex">
          <button
            onClick={() => onModeChange("generator")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              mode === "generator"
                ? "text-[#0070AD] border-b-2 border-[#0070AD]"
                : theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => onModeChange("assistant")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              mode === "assistant"
                ? "text-[#0070AD] border-b-2 border-[#0070AD]"
                : theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Assistant
          </button>
          <button
            onClick={() => onModeChange("refiner")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              mode === "refiner"
                ? "text-[#0070AD] border-b-2 border-[#0070AD]"
                : theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Refiner
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === "system" ? (
              <div className="flex justify-center">
                <div
                  className={`px-4 py-2 rounded-lg text-sm italic max-w-[90%] text-center ${
                    theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-[#F5F5F5] text-gray-600"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    message.type === "user" ? "bg-[#6FA3D9]" : "bg-[#E3F2FD]"
                  }`}
                >
                  {message.type === "user" ? (
                    <Lightbulb className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#0070AD]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {message.type === "user" ? "User" : "Smart CAD"}
                    </span>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div
                    className={`rounded-xl px-4 py-3 max-w-[90%] ${
                      message.type === "user"
                        ? "bg-[#6FA3D9] text-white"
                        : theme === "dark"
                          ? "bg-gray-700 text-gray-100"
                          : "bg-[#E3F2FD] text-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t p-4 ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className={`flex-1 min-h-[44px] max-h-[120px] resize-none ${
              theme === "dark" ? "bg-gray-700 text-white border-gray-600" : ""
            }`}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-[#0070AD] hover:bg-[#005A8C] text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
