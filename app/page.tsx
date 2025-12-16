"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChatComponent } from "@/components/chat-component"
import { ProjectsComponent } from "@/components/projects-component"
import { CodeSpaceComponent } from "@/components/code-space-component"
import { Toaster } from "@/components/ui/toaster"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Mode = "generator" | "assistant" | "refiner"

export interface Message {
  id: string
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
}

export interface Project {
  id: string
  name: string
  code: string
  description: string
  createdAt: Date
  lastModified: Date
  lineCount: number
}

export interface Version {
  id: string
  code: string
  timestamp: Date
  description: string
}

export default function SmartCADApp() {
  const [mode, setMode] = useState<Mode>("generator")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content: "Welcome to Smart CAD App. Select a mode to begin.",
      timestamp: new Date(),
    },
  ])
  const [projects, setProjects] = useState<Project[]>([])
  const [codeSpaceVisible, setCodeSpaceVisible] = useState(false)
  const [currentCode, setCurrentCode] = useState<string>("")
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [isRefinerMode, setIsRefinerMode] = useState(false)
  const [originalCode, setOriginalCode] = useState<string>("")
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [chatWidth, setChatWidth] = useState(400)
  const [isResizing, setIsResizing] = useState(false)

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = ""
      let generatedCode = ""

      if (mode === "generator") {
        aiResponse = `I'll help you generate VBScript code for that. Here's what I've created:`
        generatedCode = `' VBScript for CATIA CAD Design
Sub CreatePart()
    Dim partDocument As PartDocument
    Set partDocument = CATIA.ActiveDocument
    
    Dim part As Part
    Set part = partDocument.Part
    
    Dim bodies As Bodies
    Set bodies = part.Bodies
    
    Dim body As Body
    Set body = bodies.Add()
    
    ' Add your design logic here
    MsgBox "Part created successfully!"
End Sub

CreatePart`
        setCurrentCode(generatedCode)
        setCodeSpaceVisible(true)
        setIsRefinerMode(false)
      } else if (mode === "assistant") {
        aiResponse = `Based on CATIA best practices, I recommend the following approach for your design...`
      } else if (mode === "refiner") {
        aiResponse = `I've analyzed your code and made the following improvements:`
        const newVersion: Version = {
          id: Date.now().toString(),
          code: currentCode + "\n\n" + "' Added error handling",
          timestamp: new Date(),
          description: "Added error handling",
        }
        setVersions((prev) => [...prev, newVersion])
        setCurrentVersionIndex(versions.length)
        setCurrentCode(newVersion.code)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])

      if (generatedCode && mode === "generator") {
        const codeMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "system",
          content: "Code generated successfully. View it in the Code Space.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, codeMessage])
      }
    }, 1000)
  }

  const handleSaveProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      code: currentCode,
      description: "AI-generated VBScript for CATIA design",
      createdAt: new Date(),
      lastModified: new Date(),
      lineCount: currentCode.split("\n").length,
    }
    setProjects((prev) => [...prev, newProject])
    setCurrentProjectId(newProject.id)
  }

  const handleOpenProject = (project: Project) => {
    setCurrentCode(project.code)
    setCurrentProjectId(project.id)
    setCodeSpaceVisible(true)
    setIsRefinerMode(false)
    setOriginalCode(project.code)
    setVersions([
      {
        id: "0",
        code: project.code,
        timestamp: project.createdAt,
        description: "Original version",
      },
    ])
    setCurrentVersionIndex(0)
  }

  const handleOpenRefiner = (project: Project) => {
    setCurrentCode(project.code)
    setOriginalCode(project.code)
    setCurrentProjectId(project.id)
    setCodeSpaceVisible(true)
    setIsRefinerMode(true)
    setMode("refiner")
    setVersions([
      {
        id: "0",
        code: project.code,
        timestamp: project.createdAt,
        description: "Original version",
      },
    ])
    setCurrentVersionIndex(0)
  }

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (currentProjectId === id) {
      setCodeSpaceVisible(false)
      setCurrentCode("")
      setCurrentProjectId(null)
    }
  }

  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName, lastModified: new Date() } : p)))
  }

  const handleUploadFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const code = e.target?.result as string
      const newProject: Project = {
        id: Date.now().toString(),
        name: file.name.replace(".vbs", ""),
        code,
        description: "Uploaded VBScript file",
        createdAt: new Date(),
        lastModified: new Date(),
        lineCount: code.split("\n").length,
      }
      setProjects((prev) => [...prev, newProject])
    }
    reader.readAsText(file)
  }

  const handleApplyChanges = () => {
    if (currentProjectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentProjectId
            ? { ...p, code: currentCode, lastModified: new Date(), lineCount: currentCode.split("\n").length }
            : p,
        ),
      )
    }
    setIsRefinerMode(false)
    setOriginalCode(currentCode)

    const systemMessage: Message = {
      id: Date.now().toString(),
      type: "system",
      content: "Changes applied successfully to project.",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, systemMessage])
  }

  const handleCancelChanges = () => {
    setCurrentCode(originalCode)
    setIsRefinerMode(false)
    setVersions([versions[0]])
    setCurrentVersionIndex(0)
  }

  const handleUndo = () => {
    if (currentVersionIndex > 0) {
      const newIndex = currentVersionIndex - 1
      setCurrentVersionIndex(newIndex)
      setCurrentCode(versions[newIndex].code)
    }
  }

  const handleRedo = () => {
    if (currentVersionIndex < versions.length - 1) {
      const newIndex = currentVersionIndex + 1
      setCurrentVersionIndex(newIndex)
      setCurrentCode(versions[newIndex].code)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX
        if (newWidth >= 300 && newWidth <= 800) {
          setChatWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  return (
    <div className={`flex h-screen overflow-hidden ${theme === "dark" ? "dark bg-gray-900" : "bg-white"}`}>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b px-6 py-3 shadow-sm ${
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0070AD] flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Smart CAD</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Chat Component */}
        <div
          className={`flex-shrink-0 border-r relative ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          } ${codeSpaceVisible ? "" : "flex-1"}`}
          style={codeSpaceVisible ? { width: `${chatWidth}px` } : undefined}
        >
          <ChatComponent
            mode={mode}
            onModeChange={setMode}
            messages={messages}
            onSendMessage={handleSendMessage}
            theme={theme}
          />
          {codeSpaceVisible && (
            <div
              className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#0070AD] transition-colors ${
                isResizing ? "bg-[#0070AD]" : ""
              }`}
              onMouseDown={handleMouseDown}
            />
          )}
        </div>

        {/* Code Space Component */}
        {codeSpaceVisible && (
          <div className="flex-1">
            <CodeSpaceComponent
              visible={codeSpaceVisible}
              code={currentCode}
              originalCode={originalCode}
              isRefinerMode={isRefinerMode}
              versions={versions}
              currentVersionIndex={currentVersionIndex}
              onClose={() => setCodeSpaceVisible(false)}
              onSave={handleSaveProject}
              onCodeChange={setCurrentCode}
              onApply={handleApplyChanges}
              onCancel={handleCancelChanges}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onVersionChange={setCurrentVersionIndex}
              projectId={currentProjectId}
              theme={theme}
            />
          </div>
        )}

        {/* Projects Component */}
        <div
          className={`w-[300px] flex-shrink-0 border-l ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-[#F5F5F5]"}`}
        >
          <ProjectsComponent
            projects={projects}
            onOpenProject={handleOpenProject}
            onOpenRefiner={handleOpenRefiner}
            onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject}
            onUploadFile={handleUploadFile}
            theme={theme}
          />
        </div>
      </div>

      <Toaster />
    </div>
  )
}
