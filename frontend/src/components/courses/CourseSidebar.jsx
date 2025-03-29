"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/context/SidebarContext"
import { Plus, Trash2, Wand2, BookOpen, Home, Sparkle } from "lucide-react"
import useUserStore from "@/store/userStore"

import { createModule, deleteModule } from "@/api/moduleApi"

const CourseSidebar = ({
  course,
  selectedModule,
  setSelectedModule,
  setIsDashboardOpen,
  isDashboardOpen,
  setIsPresentationOpen,
  isPresentationOpen,
  onCourseCreated,
  showAlert,
  alertTypes,
}) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  

  const [isGenerating, setIsGenerating] = useState(false)
  const [modules, setModules] = useState([])
  const [editingModule, setEditingModule] = useState(null)
  const [originalModules, setOriginalModules] = useState(null)

  const [newModuleTitle, setNewModuleTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (course && course.modules) {
      setModules(course.modules)
    }
  }, [course])

  // Initialize original modules when first loaded
  useEffect(() => {
    if (!originalModules && modules) {
      setOriginalModules(JSON.parse(JSON.stringify(modules)))
    }
  }, [modules])

  const handleGenerateModules = async () => {
    if (user?.role !== "Teacher") return

    setIsGenerating(true)

    // Show placeholders while generating
    const placeholderModules = [
      { order: "placeholder-1", title: "", isPlaceholder: true },
      { order: "placeholder-2", title: "", isPlaceholder: true },
      { order: "placeholder-3", title: "", isPlaceholder: true },
      { order: "placeholder-4", title: "", isPlaceholder: true },
      { order: "placeholder-5", title: "", isPlaceholder: true },
      { order: "placeholder-6", title: "", isPlaceholder: true },
      { order: "placeholder-7", title: "", isPlaceholder: true },
    ]
    setModules([...placeholderModules])

    try {
      const response = await generateModules(course._id)
      console.log(response)
      setTimeout(() => {
        setModules((prev) => {
          return [...response]
        })
        setIsGenerating(false)
      }, 1500)
    } catch (error) {
      console.error("Failed to generate modules", error)
      setIsGenerating(false)
      setModules([])
    }
  }

  const handleAddModule = async () => {
    if (user?.role !== "Teacher" || !newModuleTitle.trim()) return

    const newModule = {
      order: `module-${Date.now()}`,
      title: newModuleTitle.trim(),
    }

    try {
      const formData = {
        title: newModule.title,
        course: course._id,
      }
      const data = await createModule(formData)

      showAlert("Module created successfully", alertTypes.SUCCESS)
      setModules((prevModules) => [...(prevModules || []), data])
    } catch (error) {
      console.log(error)
      showAlert(error.response?.data?.message || "Error creating module", alertTypes.ERROR)
    } finally {
      setIsLoading(false)
    }
    setNewModuleTitle("") // Clear input after adding
  }

  const handleDeleteModule = async (moduleToDelete, e) => {
    if (user?.role !== "Teacher") return

    e.stopPropagation()
    try {
      await deleteModule(moduleToDelete._id)
      setModules((prevModules) => prevModules?.filter((module) => module._id !== moduleToDelete._id) || null)

      if (selectedModule?._id === moduleToDelete._id) {
        setSelectedModule(null)
      }
      showAlert("Module deleted successfully", alertTypes.SUCCESS)
    } catch (error) {
      console.error("Failed to delete module", error)
      showAlert(error.response?.data?.message || "Error deleting module", alertTypes.ERROR)
    }
  }

  const isVisible = isExpanded || isMobileOpen || isHovered

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 
        bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900
        border-r border-slate-200 dark:border-slate-800 
        text-slate-800 dark:text-slate-200 
        h-screen transition-all duration-300 ease-in-out z-50 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo - Keep this fixed at the top */}
      <div className={`py-6 px-4 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      {/* Scrollable content container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <div className="px-3 py-2">
          <button
            onClick={() => {
              setIsDashboardOpen(true)
              setIsPresentationOpen(false)
              setSelectedModule(null) // Ensure no module is selected
            }}
            className={`w-full flex items-center rounded-xl p-3 transition-all duration-200
              ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"} 
              ${selectedModule === null && isDashboardOpen
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
              }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg 
              ${selectedModule === null && isDashboardOpen
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
            >
              <Home className="w-5 h-5" />
            </div>
            {(isExpanded || isMobileOpen || isHovered) && (
              <span
                className={`ml-3 font-medium ${selectedModule === null && isDashboardOpen ? "text-blue-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}
              >
                Course Dashboard
              </span>
            )}
          </button>
        </div>

        {user.role === "Teacher" &&
          <div className="px-3 py-2">
            <button
              onClick={() => {
                setIsPresentationOpen(true)
                setIsDashboardOpen(false)
                setSelectedModule(null)
              }}
              className={`w-full flex items-center rounded-xl p-3 transition-all duration-200
                ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"} 
                ${selectedModule === null && isPresentationOpen
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg 
                ${selectedModule === null && isPresentationOpen
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Sparkle className="w-5 h-5" />
              </div>
              {(isExpanded || isMobileOpen || isHovered) && (
                <span
                  className={`ml-3 font-medium ${selectedModule === null && isPresentationOpen ? "text-blue-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}
                >
                  PPT Generator
                </span>
              )}
            </button>
          </div>
        }

        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            {isVisible ? (
              <h2 className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                Modules
              </h2>
            ) : (
              <div className="mx-auto p-1">
                <BookOpen className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
            )}
          </div>

          {/* Module Management Section */}
          {user?.role === "Teacher" && (
            <div className="space-y-3 mb-4">
              {/* New Module Input */}
              {isVisible && (
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5">
                  <input
                    type="text"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="New module title"
                    className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <button
                    onClick={handleAddModule}
                    disabled={!newModuleTitle.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                      newModuleTitle.trim()
                        ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    }`}
                    title="Add Module"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* AI Generate Button */}
              {isVisible && (
                <button
                  onClick={handleGenerateModules}
                  disabled={isGenerating}
                  className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2
                    ${
                      isGenerating
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    } transition-all duration-200 font-medium text-sm`}
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-400 dark:text-slate-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>AI Generate Modules</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="px-3 py-2">
          <nav>
            <ul className="space-y-2">
              {user?.role === "Teacher"
                ? // Teacher View with Edit Capabilities
                  modules?.map((module, moduleIndex) => (
                    <li key={module._id || module.order} className="relative">
                      {module.isPlaceholder ? (
                        <div className="w-full h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                      ) : (
                        <div className="group w-full">
                          <button
                            onClick={() => {
                              setSelectedModule(module)
                              setIsDashboardOpen(false)
                              setIsPresentationOpen(false)
                            }}
                            className={`w-full flex items-center rounded-xl p-2 transition-all duration-200
                              ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
                              ${
                                selectedModule?._id === module._id
                                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                              }`}
                          >
                            <div className="flex items-center w-full">
                              {/* Module Index */}
                              <div
                                className={`flex items-center justify-center w-10 h-10 rounded-lg
                                ${
                                  selectedModule?._id === module._id
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                <span className="font-medium">{moduleIndex + 1}</span>
                              </div>

                              {/* Module Title */}
                              {isVisible && (
                                <div className="ml-3 flex-1 text-left">
                                  <p
                                    className={`text-sm font-medium break-words line-clamp-2 ${
                                      selectedModule?._id === module._id
                                        ? "text-blue-700 dark:text-indigo-400"
                                        : "text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    {module.title}
                                  </p>
                                </div>
                              )}

                              {/* Delete Button */}
                              {isVisible && user?.role === "Teacher" && (
                                <div
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete Module"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteModule(module, e)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      )}
                    </li>
                  ))
                : // Student View (Read-Only)
                  course?.modules?.map((module, moduleIndex) => (
                    <li key={module._id || module.order} className="relative">
                      <button
                        onClick={() => {
                          setSelectedModule(module)
                          setIsDashboardOpen(false)
                          setIsPresentationOpen(false)
                        }}
                        className={`w-full flex items-center rounded-xl p-2 transition-all duration-200
                          ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
                          ${
                            selectedModule?._id === module._id
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                          }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg
                          ${
                            selectedModule?._id === module._id
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span className="font-medium">{moduleIndex + 1}</span>
                        </div>

                        {isVisible && (
                          <div className="ml-3 flex-1 text-left">
                            <p
                              className={`text-sm font-medium break-words line-clamp-2 ${
                                selectedModule?._id === module._id
                                  ? "text-blue-700 dark:text-indigo-400"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {module.title}
                            </p>
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  )
}

export default CourseSidebar