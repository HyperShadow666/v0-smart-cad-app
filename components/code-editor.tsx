"use client"

import { useEffect, useRef } from "react"

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  readOnly: boolean
  language?: string
  theme: "light" | "dark"
}

export function CodeEditor({ code, onChange, readOnly, language = "vbscript", theme }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Monaco Editor will be loaded dynamically in production
    // For now, using a simple textarea fallback
    const loadMonaco = async () => {
      try {
        // @ts-ignore - Monaco will be available at runtime
        if (typeof window !== "undefined" && window.monaco) {
          // @ts-ignore
          const monaco = window.monaco
          monacoRef.current = monaco
        }
      } catch (error) {
        console.log("Monaco not available, using fallback")
      }
    }

    loadMonaco()
  }, [])

  const lines = code.split("\n")

  return (
    <div className={`h-full w-full flex ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      {/* Line Numbers */}
      <div
        className={`flex-shrink-0 px-3 py-4 text-right font-mono text-sm select-none border-r ${
          theme === "dark" ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-50 text-gray-400 border-gray-200"
        }`}
        style={{
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        {lines.map((_, index) => (
          <div key={index + 1}>{index + 1}</div>
        ))}
      </div>

      {/* Code Area */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`flex-1 p-4 font-mono text-sm border-none outline-none resize-none ${
          theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        }`}
        style={{
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: "14px",
          lineHeight: "1.6",
          tabSize: 4,
        }}
        spellCheck={false}
      />
    </div>
  )
}
