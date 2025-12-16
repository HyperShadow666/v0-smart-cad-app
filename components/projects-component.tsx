"use client"

import type React from "react"

import { useState } from "react"
import { Folder, Upload, Search, Check, MoreVertical, Trash2, Edit2, Eye, Code, FileDown, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Project } from "@/app/page"

interface ProjectsComponentProps {
  projects: Project[]
  onOpenProject: (project: Project) => void
  onOpenRefiner: (project: Project) => void
  onDeleteProject: (id: string) => void
  onRenameProject: (id: string, newName: string) => void
  onUploadFile: (file: File) => void
  theme: "light" | "dark"
}

export function ProjectsComponent({
  projects,
  onOpenProject,
  onOpenRefiner,
  onDeleteProject,
  onRenameProject,
  onUploadFile,
  theme,
}: ProjectsComponentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newName, setNewName] = useState("")
  const { toast } = useToast()

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith(".vbs") || file.name.endsWith(".txt")) {
        onUploadFile(file)
        toast({
          title: "File uploaded",
          description: `${file.name} has been added to your projects.`,
        })
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .vbs or .txt file.",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewDescription = (project: Project) => {
    setSelectedProject(project)
    setShowDescriptionDialog(true)
  }

  const handleRename = (project: Project) => {
    setSelectedProject(project)
    setNewName(project.name)
    setShowRenameDialog(true)
  }

  const handleDelete = (project: Project) => {
    setSelectedProject(project)
    setShowDeleteDialog(true)
  }

  const confirmRename = () => {
    if (selectedProject && newName.trim()) {
      onRenameProject(selectedProject.id, newName.trim())
      setShowRenameDialog(false)
      toast({
        title: "Project renamed",
        description: `Project renamed to "${newName}".`,
      })
    }
  }

  const confirmDelete = () => {
    if (selectedProject) {
      onDeleteProject(selectedProject.id)
      setShowDeleteDialog(false)
      toast({
        title: "Project deleted",
        description: "The project has been removed.",
      })
    }
  }

  const handleExtractToFile = (project: Project) => {
    const blob = new Blob([project.code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.name}.vbs`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "File downloaded",
      description: `${project.name}.vbs has been saved.`,
    })
  }

  const handleDuplicate = (project: Project) => {
    const duplicatedProject = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (Copy)`,
      createdAt: new Date(),
      lastModified: new Date(),
    }
    toast({
      title: "Project duplicated",
      description: `Created "${duplicatedProject.name}".`,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`p-4 border-b ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-[#F5F5F5]"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Projects</h2>
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              size="sm"
              className={`cursor-pointer ${theme === "dark" ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-transparent"}`}
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </span>
            </Button>
            <input id="file-upload" type="file" accept=".vbs,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className={`pl-9 ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white"}`}
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Folder className={`w-16 h-16 mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`} />
            <p className={`font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              No projects yet
            </p>
            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Generate code or upload a script to get started
            </p>
            <label htmlFor="file-upload-empty">
              <Button
                variant="outline"
                className={`cursor-pointer ${theme === "dark" ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-transparent"}`}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Script
                </span>
              </Button>
              <input
                id="file-upload-empty"
                type="file"
                accept=".vbs,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group ${
                  theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Folder className="w-5 h-5 text-[#0070AD] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                        {project.name}
                      </h3>
                      <Check className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDescription(project)
                      }}
                      className={`text-xs hover:underline ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                    >
                      View full description
                    </button>
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {project.lastModified.toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`opacity-0 group-hover:opacity-100 ${theme === "dark" ? "text-gray-300" : ""}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDescription(project)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Description
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenProject(project)
                        }}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        View Full Code
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenRefiner(project)
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Open in Refiner
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExtractToFile(project)
                        }}
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Extract to File
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRename(project)
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicate(project)
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(project)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className={theme === "dark" ? "bg-gray-800 text-white border-gray-700" : ""}>
          <DialogHeader>
            <DialogTitle className={theme === "dark" ? "text-white" : ""}>{selectedProject?.name}</DialogTitle>
            <DialogDescription className={theme === "dark" ? "text-gray-400" : ""}>
              Project details and information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Description
              </p>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {selectedProject?.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Created
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {selectedProject?.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Last Modified
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {selectedProject?.lastModified.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Line Count
              </p>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {selectedProject?.lineCount} lines
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDescriptionDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedProject) {
                  onOpenProject(selectedProject)
                  setShowDescriptionDialog(false)
                }
              }}
              className="bg-[#0070AD] hover:bg-[#005A8C]"
            >
              <Code className="w-4 h-4 mr-2" />
              View Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className={theme === "dark" ? "bg-gray-800 text-white border-gray-700" : ""}>
          <DialogHeader>
            <DialogTitle className={theme === "dark" ? "text-white" : ""}>Rename Project</DialogTitle>
            <DialogDescription className={theme === "dark" ? "text-gray-400" : ""}>
              Enter a new name for your project
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
            className={theme === "dark" ? "bg-gray-700 text-white border-gray-600" : ""}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} className="bg-[#0070AD] hover:bg-[#005A8C]">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={theme === "dark" ? "bg-gray-800 text-white border-gray-700" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle className={theme === "dark" ? "text-white" : ""}>Delete Project</AlertDialogTitle>
            <AlertDialogDescription className={theme === "dark" ? "text-gray-400" : ""}>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
