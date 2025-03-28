"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { LayoutGrid, Plus, Trash2, Wand2, Edit3, Save } from "lucide-react";
import useUserStore from "@/store/userStore";
import { cn } from "@/lib/utils";
import { generateModules } from "@/api/moduleApi";
import { createModule, deleteModule } from "@/api/moduleApi";

const CourseSidebar = ({
  course,
  selectedModule,
  setSelectedModule,
  setIsDashboardOpen,
}) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const [isGenerating, setIsGenerating] = useState(false);
  const [modules, setModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);
  const [originalModules, setOriginalModules] = useState(null);

  const [newModuleTitle, setNewModuleTitle] = useState("");

  useEffect(() => {
    if (course && course.modules) {
      setModules(course.modules);
    }
  }, [course]);



  // Initialize original modules when first loaded
  useEffect(() => {
    if (!originalModules && modules) {
      setOriginalModules(JSON.parse(JSON.stringify(modules)));
    }
  }, [modules]);

  
  const handleGenerateModules = async () => {
    if (user?.role !== "Teacher") return;

    setIsGenerating(true);

    // Show placeholders while generating
    const placeholderModules = [
      { order: "placeholder-1", title: "", isPlaceholder: true },
        { order: "placeholder-2", title: "", isPlaceholder: true },
        { order: "placeholder-3", title: "", isPlaceholder: true },
        { order: "placeholder-4", title: "", isPlaceholder: true },
        { order: "placeholder-5", title: "", isPlaceholder: true },
        { order: "placeholder-6", title: "", isPlaceholder: true },
      { order: "placeholder-7", title: "", isPlaceholder: true },
    ];
    setModules([...placeholderModules]);

    try {
        const response = await generateModules(course._id);
        console.log(response)
      setTimeout(() => {
        
        setModules((prev) => {
          return [...response];
        });
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to generate modules", error);
      setIsGenerating(false);
      setModules([]);
    }
  };

  const handleAddModule = async () => {
    if (user?.role !== "Teacher" || !newModuleTitle.trim()) return;

    const newModule = {
      order: `module-${Date.now()}`,
      title: newModuleTitle.trim(),
      };
      
      try {
            const data = await createCourse(formData);
          
            showAlert("Course created successfully", alertTypes.SUCCESS);
            onCourseCreated(data.course)
          } catch (error) {
            console.log(error);
            showAlert(error.response?.data?.message || "Error creating course", alertTypes.ERROR);
          } finally {
            setIsLoading(false);
          }
    setModules((prevModules) => [...(prevModules || []), newModule]);
    setEditingModule(newModule);
    setNewModuleTitle(""); // Clear input after adding
  };

  const handleDeleteModule = (moduleToDelete, e) => {
    if (user?.role !== "Teacher") return;

    e.stopPropagation();
    setModules(
      (prevModules) =>
        prevModules?.filter((module) => module.order !== moduleToDelete.order) ||
        null
    );

    if (selectedModule?.order === moduleToDelete.order) {
      setSelectedModule(null);
    }
  };

  

  const isVisible = isExpanded || isMobileOpen || isHovered;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0 
        dark:bg-slate-900 
        border-r border-indigo-100 dark:border-slate-800 
        text-slate-800 dark:text-slate-200 
        h-screen transition-all duration-300 ease-in-out z-50 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
          </div>

          <button
        onClick={() => {
          setIsDashboardOpen(true);
          setSelectedModule(null); // Ensure no module is selected
        }}
        className={`menu-item group cursor-pointer mb-4 
          ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"} 
          ${selectedModule === null ? "menu-item-active" : "menu-item-inactive hover:bg-primary/10"}`}
      >
        <span className={`w-6 h-6 mr-3 flex items-center justify-center rounded-full 
          ${selectedModule === null 
            ? "bg-primary/20 text-primary" 
            : "bg-gray-200 dark:bg-gray-700 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"}`}>
          📌
        </span>
        {(isExpanded || isMobileOpen || isHovered) && <span className="menu-item-text font-bold">Course Dashboard</span>}
      </button>

          
          <div className="flex justify-between items-center mb-3 px-2">
            {isVisible ? (
              <h2 className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                Modules
              </h2>
            ) : (
              <LayoutGrid className="w-5 h-5 mx-auto text-slate-500 dark:text-slate-400" />
            )}

          </div>


      {/* Module Management Section */}
      {user?.role === "Teacher" && (
        <>
          

          {/* New Module Input */}
          {isVisible && (
            <div className="flex items-center mb-3 px-2 space-x-2">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="New module title"
                className="flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddModule}
                disabled={!newModuleTitle.trim()}
                className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add Module"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* AI Generate Button */}
          {isVisible && !isGenerating && (
            <button
              onClick={handleGenerateModules}
              className={cn(
                "w-full mb-3 py-2 px-3 rounded-md flex items-center justify-center gap-2",
                "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20",
                "dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30",
                "transition-colors duration-200 font-medium text-sm"
              )}
              disabled={isGenerating}
            >
              <Wand2 className="w-4 h-4" />
              <span>AI Generate Modules</span>
            </button>
          )}
        </>
      )}

      {/* Modules List */}
      <div className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-slate-600">
        <nav>
          <ul className="space-y-1">
            {user?.role === "Teacher"
              ? // Teacher View with Edit Capabilities
                modules?.map((module, moduleIndex) => (
                  <li key={module.order} className="relative group">
                    {module.isPlaceholder ? (
                      <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                    ) : (
                      <div className="w-full flex items-center rounded-md p-1 transition-colors duration-200">
                        <button
                          onClick={() => {
                            setSelectedModule(module);
                            setIsDashboardOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center rounded-md p-2 transition-colors duration-200",
                            !isExpanded && !isHovered
                              ? "lg:justify-center"
                              : "lg:justify-start",
                            selectedModule?.order === module.order
                              ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <span
                            className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-full",
                              selectedModule?.order === module.order
                                ? "bg-indigo-500/20 text-indigo-600 dark:bg-indigo-500/30 dark:text-indigo-400"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {moduleIndex + 1}
                          </span>

                          {isVisible && (
                            <div className="ml-3 flex-1 text-left">
                              <p className="text-sm font-medium break-words line-clamp-2">
                                {module.title}
                              </p>
                            </div>
                          )}
                        </button>

                        {isVisible && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                            <button
                              onClick={(e) => handleDeleteModule(module, e)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-800"
                              title="Delete Module"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))
              : // Student View (Read-Only)
                course?.modules?.map((module, moduleIndex) => (
                  <li key={module.order} className="relative group">
                    <button
                      onClick={() => {
                        setSelectedModule(module);
                        setIsDashboardOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center rounded-md p-2 transition-colors duration-200",
                        !isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "lg:justify-start",
                        selectedModule?.order === module.order
                          ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <span
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full",
                          selectedModule?.order === module.order
                            ? "bg-indigo-500/20 text-indigo-600 dark:bg-indigo-500/30 dark:text-indigo-400"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {moduleIndex + 1}
                      </span>

                      {isVisible && (
                        <div className="ml-3 flex-1 text-left">
                          <p className="text-sm font-medium break-words line-clamp-2">
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
    </aside>
  );
};

export default CourseSidebar;
