"use client"

import { useState } from "react"
import { X, Copy, Save, Undo, Redo, Check, XCircle, ChevronLeft, ChevronRight, Eye, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { CodeEditor } from "@/components/code-editor"
import { DiffViewer } from "@/components/diff-viewer"
import type { Version } from "@/app/page"

interface CodeSpaceComponentProps {
  visible: boolean
  code: string
  originalCode: string
  isRefinerMode: boolean
  versions: Version[]
  currentVersionIndex: number
  onClose: () => void
  onSave: (name: string) => void
  onCodeChange: (code: string) => void
  onApply: () => void
  onCancel: () => void
  onUndo: () => void
  onRedo: () => void
  onVersionChange: (index: number) => void
  projectId: string | null
  theme: "light" | "dark"
}

export function CodeSpaceComponent({
  visible,
  code,
  originalCode,
  isRefinerMode,
  versions,
  currentVersionIndex,
  onClose,
  onSave,
  onCodeChange,
  onApply,
  onCancel,
  onUndo,
  onRedo,
  onVersionChange,
  projectId,
  theme,
}: CodeSpaceComponentProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code copied",
      description: "Code has been copied to clipboard.",
    })
  }

  const handleSave = () => {
    if (projectId) {
      toast({
        title: "Project updated",
        description: "Changes have been saved to the project.",
      })
    } else {
      setShowSaveDialog(true)
    }
  }

  const confirmSave = () => {
    if (projectName.trim()) {
      onSave(projectName.trim())
      setShowSaveDialog(false)
      setProjectName("")
      toast({
        title: "Project saved",
        description: `"${projectName}" has been added to your projects.`,
      })
    }
  }

  if (!visible) return null

  return (
    <div className={`flex flex-col h-full ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      {/* Toolbar */}
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${
          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className={theme === "dark" ? "text-gray-300" : ""}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {isRefinerMode ? "Refiner Mode" : "Code Space"}
          </h2>
          {isRefinerMode && versions.length > 0 && (
            <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Version {currentVersionIndex + 1} of {versions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className={theme === "dark" ? "bg-gray-700 border-gray-600 text-gray-300" : ""}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={theme === "dark" ? "bg-gray-700 border-gray-600 text-gray-300" : ""}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          {!projectId && (
            <Button size="sm" onClick={handleSave} className="bg-[#0070AD] hover:bg-[#005A8C]">
              <Save className="w-4 h-4 mr-2" />
              Save to Project
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={theme === "dark" ? "text-gray-400 hover:text-white" : ""}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Version History Bar (Refiner Mode) */}
      {isRefinerMode && versions.length > 0 && (
        <div
          className={`border-b px-4 py-3 ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-[#F9F9F9]"}`}
        >
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onUndo} disabled={currentVersionIndex === 0}>
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button variant="outline" size="sm" onClick={onRedo} disabled={currentVersionIndex === versions.length - 1}>
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVersionChange(Math.max(0, currentVersionIndex - 1))}
                disabled={currentVersionIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 flex items-center gap-1">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => onVersionChange(index)}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      index === currentVersionIndex
                        ? "bg-[#0070AD] h-3"
                        : index < currentVersionIndex
                          ? "bg-blue-300"
                          : "bg-gray-300"
                    }`}
                    title={`${version.description} - ${version.timestamp.toLocaleString()}`}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVersionChange(Math.min(versions.length - 1, currentVersionIndex + 1))}
                disabled={currentVersionIndex === versions.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {versions[currentVersionIndex] && (
              <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {versions[currentVersionIndex].description}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Code Display Area */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className={`h-full overflow-auto p-6 ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white"}`}>
            <div
              className={`rounded-lg border p-6 ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Code Preview
              </h3>
              <pre
                className={`text-sm font-mono whitespace-pre-wrap ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                {code}
              </pre>
            </div>
          </div>
        ) : isRefinerMode ? (
          <DiffViewer originalCode={originalCode} modifiedCode={code} theme={theme} />
        ) : (
          <CodeEditor code={code} onChange={onCodeChange} readOnly={false} theme={theme} />
        )}
      </div>

      {/* Action Bar (Refiner Mode) */}
      {isRefinerMode && (
        <div
          className={`border-t px-4 py-3 bg-white flex items-center justify-end gap-2 ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
        >
          <Button variant="outline" onClick={onCancel} className="text-red-600 border-red-300 bg-transparent">
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onApply} className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
            <Check className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
        </div>
      )}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Project</DialogTitle>
            <DialogDescription>Enter a name for your project</DialogDescription>
          </DialogHeader>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My CATIA Script"
            onKeyDown={(e) => e.key === "Enter" && confirmSave()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave} className="bg-[#0070AD] hover:bg-[#005A8C]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
