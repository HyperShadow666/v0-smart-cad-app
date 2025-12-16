"use client"

import { useMemo } from "react"

interface DiffViewerProps {
  originalCode: string
  modifiedCode: string
  theme: "light" | "dark"
}

interface DiffLine {
  type: "unchanged" | "added" | "deleted" | "modified"
  originalLine?: string
  modifiedLine?: string
  originalLineNumber?: number
  modifiedLineNumber?: number
}

export function DiffViewer({ originalCode, modifiedCode, theme }: DiffViewerProps) {
  const diffLines = useMemo(() => {
    const originalLines = originalCode.split("\n")
    const modifiedLines = modifiedCode.split("\n")
    const result: DiffLine[] = []

    // Simple line-by-line comparison
    const maxLength = Math.max(originalLines.length, modifiedLines.length)

    for (let i = 0; i < maxLength; i++) {
      const origLine = originalLines[i]
      const modLine = modifiedLines[i]

      if (origLine === modLine) {
        result.push({
          type: "unchanged",
          originalLine: origLine,
          modifiedLine: modLine,
          originalLineNumber: i + 1,
          modifiedLineNumber: i + 1,
        })
      } else if (origLine === undefined) {
        result.push({
          type: "added",
          modifiedLine: modLine,
          modifiedLineNumber: i + 1,
        })
      } else if (modLine === undefined) {
        result.push({
          type: "deleted",
          originalLine: origLine,
          originalLineNumber: i + 1,
        })
      } else {
        result.push({
          type: "modified",
          originalLine: origLine,
          modifiedLine: modLine,
          originalLineNumber: i + 1,
          modifiedLineNumber: i + 1,
        })
      }
    }

    return result
  }, [originalCode, modifiedCode])

  return (
    <div className="flex h-full">
      {/* Left Pane - Original Code */}
      <div
        className={`flex-1 border-r overflow-auto ${
          theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-[#F9F9F9]"
        }`}
      >
        <div
          className={`sticky top-0 px-4 py-2 border-b font-semibold text-sm ${
            theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-200 border-gray-300 text-gray-700"
          }`}
        >
          Original Code
        </div>
        <div className="font-mono text-sm">
          {diffLines.map((line, index) => (
            <div
              key={`orig-${index}`}
              className={`flex ${
                line.type === "deleted"
                  ? theme === "dark"
                    ? "bg-red-950/30 border-l-4 border-red-500"
                    : "bg-[#FFEEF0] border-l-4 border-[#D73A49]"
                  : line.type === "modified"
                    ? theme === "dark"
                      ? "bg-yellow-950/20 border-l-4 border-yellow-500"
                      : "bg-[#FFF8C5] border-l-4 border-[#FFC107]"
                    : line.type === "added"
                      ? theme === "dark"
                        ? "bg-gray-900"
                        : "bg-gray-100"
                      : ""
              }`}
            >
              <span
                className={`w-12 flex-shrink-0 text-right px-2 py-1 select-none border-r ${
                  theme === "dark"
                    ? "text-gray-500 bg-gray-800 border-gray-700"
                    : "text-gray-500 bg-gray-100 border-gray-300"
                }`}
              >
                {line.originalLineNumber || ""}
              </span>
              <span
                className={`w-8 flex-shrink-0 text-center py-1 select-none ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
              >
                {line.type === "deleted" ? "-" : line.type === "modified" ? "~" : ""}
              </span>
              <pre className="flex-1 py-1 px-2 overflow-x-auto whitespace-pre">
                <code
                  className={`${line.type === "deleted" ? (theme === "dark" ? "line-through text-red-400" : "line-through text-[#CB2431]") : theme === "dark" ? "text-gray-300" : ""}`}
                >
                  {line.originalLine || "\u00A0"}
                </code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane - Modified Code */}
      <div className={`flex-1 overflow-auto ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
        <div
          className={`sticky top-0 px-4 py-2 border-b font-semibold text-sm ${
            theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-200 border-gray-300 text-gray-700"
          }`}
        >
          Modified Code
        </div>
        <div className="font-mono text-sm">
          {diffLines.map((line, index) => (
            <div
              key={`mod-${index}`}
              className={`flex ${
                line.type === "added"
                  ? theme === "dark"
                    ? "bg-green-950/30 border-l-4 border-green-500"
                    : "bg-[#E6FFED] border-l-4 border-[#34D058]"
                  : line.type === "modified"
                    ? theme === "dark"
                      ? "bg-yellow-950/20 border-l-4 border-yellow-500"
                      : "bg-[#FFF8C5] border-l-4 border-[#FFC107]"
                    : line.type === "deleted"
                      ? theme === "dark"
                        ? "bg-gray-900"
                        : "bg-gray-100"
                      : ""
              }`}
            >
              <span
                className={`w-12 flex-shrink-0 text-right px-2 py-1 select-none border-r ${
                  theme === "dark"
                    ? "text-gray-500 bg-gray-800 border-gray-700"
                    : "text-gray-500 bg-gray-100 border-gray-300"
                }`}
              >
                {line.modifiedLineNumber || ""}
              </span>
              <span
                className={`w-8 flex-shrink-0 text-center py-1 select-none ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
              >
                {line.type === "added" ? "+" : line.type === "modified" ? "~" : ""}
              </span>
              <pre className="flex-1 py-1 px-2 overflow-x-auto whitespace-pre">
                <code
                  className={`${line.type === "added" ? (theme === "dark" ? "text-green-400" : "text-[#22863A]") : theme === "dark" ? "text-gray-300" : ""}`}
                >
                  {line.modifiedLine || "\u00A0"}
                </code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
