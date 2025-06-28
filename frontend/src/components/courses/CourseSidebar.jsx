"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSidebar } from "@/context/SidebarContext";
import useUserStore from "@/store/userStore";
import { useAlert } from "@/context/AlertContext";
import { generateModules, createModule, deleteModule } from "@/api/moduleApi";
import { Plus, Trash2, Wand2, BookOpen, Home, Sparkle } from "lucide-react";

const CourseSidebar = ({
  course,
  selectedModule,
  setSelectedModule,
  activeView,
  setActiveView,
}) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const { showAlert, alertTypes } = useAlert();

  const [newModuleTitle, setNewModuleTitle] = useState("");

  const isVisible = isExpanded || isMobileOpen || isHovered;

  // Mutation to CREATE a new module
  const { mutate: addModule, isLoading: isAddingModule } = useMutation({
    mutationFn: createModule,
    onSuccess: () => {
      showAlert("Module created successfully", alertTypes.SUCCESS);
      queryClient.invalidateQueries(["course", course._id]); // Invalidate to refetch
      setNewModuleTitle("");
    },
    onError: (error) => {
      showAlert(
        error.response?.data?.message || "Error creating module",
        alertTypes.ERROR
      );
    },
  });

  // Mutation to DELETE a module
  const { mutate: removeModule } = useMutation({
    mutationFn: deleteModule,
    onSuccess: () => {
      showAlert("Module deleted successfully", alertTypes.SUCCESS);
      queryClient.invalidateQueries(["course", course._id]);
      // If the deleted module was selected, navigate to dashboard
      if (selectedModule === moduleToDelete._id) {
        setActiveView("dashboard");
        setSelectedModule(null);
      }
    },
    onError: (error) => {
      showAlert(
        error.response?.data?.message || "Error deleting module",
        alertTypes.ERROR
      );
    },
  });

  // Mutation to AI-GENERATE modules
  const { mutate: aiGenerateModules, isLoading: isGenerating } = useMutation({
    mutationFn: () => generateModules(course._id),
    onSuccess: () => {
      showAlert("Modules generated successfully!", alertTypes.SUCCESS);
      queryClient.invalidateQueries(["course", course._id]);
    },
    onError: (error) => {
      showAlert(
        error.message || "Failed to generate modules",
        alertTypes.ERROR
      );
      queryClient.invalidateQueries(["course", course._id]); // Refetch to remove placeholders
    },
  });

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    addModule({ title: newModuleTitle.trim(), course: course._id });
  };

  const handleDeleteModule = (moduleToDeleteId, e) => {
    e.stopPropagation();
    removeModule(moduleToDeleteId);
  };

  const handleGenerateModules = () => {
    // Optimistically show placeholders before calling the mutation
    const placeholderModules = Array.from({ length: 7 }, (_, i) => ({
      _id: `placeholder-${i}`,
      title: "",
      isPlaceholder: true,
    }));

    queryClient.setQueryData(["course", course._id], (oldData) => ({
      ...oldData,
      modules: placeholderModules,
    }));

    aiGenerateModules();
  };

  // Directly use course.modules from props as the single source of truth
  const modules = course?.modules || [];

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 
        bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900
        border-r border-slate-200 dark:border-slate-800 
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
        className={`py-6 px-4 flex ${
          !isVisible ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isVisible ? (
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

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <div className="px-3 py-2">
          {/* Dashboard Button */}
          <button
            onClick={() => setActiveView("dashboard")}
            className={`w-full flex items-center rounded-xl p-3 transition-all duration-200 ${
              !isVisible ? "lg:justify-center" : "lg:justify-start"
            } ${
              activeView === "dashboard"
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                activeView === "dashboard"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            {isVisible && (
              <span
                className={`ml-3 font-medium ${
                  activeView === "dashboard"
                    ? "text-blue-700 dark:text-indigo-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                Course Dashboard
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Teacher/Student View Buttons */}
        <div className="px-3 py-2">
          {user?.role === "Teacher" && (
            <button
              onClick={() => setActiveView("presentation")}
              className={`w-full flex items-center rounded-xl p-3 transition-all duration-200 ${
                !isVisible ? "lg:justify-center" : "lg:justify-start"
              } ${
                activeView === "presentation"
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
              }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                  activeView === "presentation"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Sparkle className="w-5 h-5" />
              </div>
              {isVisible && (
                <span
                  className={`ml-3 font-medium ${
                    activeView === "presentation"
                      ? "text-blue-700 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  PPT Generator
                </span>
              )}
            </button>
          )}
          {user?.role === "Student" && (
            <button
              onClick={() => setActiveView("roadmap")}
              className={`w-full flex items-center rounded-xl p-3 transition-all duration-200 ${
                !isVisible ? "lg:justify-center" : "lg:justify-start"
              } ${
                activeView === "roadmap"
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
              }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                  activeView === "roadmap"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Sparkle className="w-5 h-5" />
              </div>
              {isVisible && (
                <span
                  className={`ml-3 font-medium ${
                    activeView === "roadmap"
                      ? "text-blue-700 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Roadmap
                </span>
              )}
            </button>
          )}
        </div>

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
          {user?.role === "Teacher" && (
            <div className="space-y-3 mb-4">
              {isVisible && (
                <>
                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5">
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="New module title"
                      className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                    />
                    <button
                      onClick={handleAddModule}
                      disabled={!newModuleTitle.trim() || isAddingModule}
                      className={`p-2 rounded-lg transition-colors ${
                        newModuleTitle.trim()
                          ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50"
                          : "text-slate-400 cursor-not-allowed"
                      }`}
                      title="Add Module"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleGenerateModules}
                    disabled={isGenerating}
                    className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all font-medium text-sm"
                  >
                    {isGenerating ? (
                      "Generating..."
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>AI Generate Modules</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-3 py-2">
          <nav>
            <ul className="space-y-2">
              {modules.map((module, moduleIndex) => (
                <li key={module._id}>
                  {module.isPlaceholder ? (
                    <div className="w-full h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                  ) : (
                    <div className="group w-full">
                      <button
                        onClick={() => {
                          setSelectedModule(module._id);
                          setActiveView("module");
                        }}
                        className={`w-full flex items-center rounded-xl p-2 transition-all duration-200 ${
                          !isVisible ? "lg:justify-center" : ""
                        } ${
                          selectedModule === module._id
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                            selectedModule === module._id
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
                                selectedModule === module._id
                                  ? "text-blue-700 dark:text-indigo-400"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {module.title}
                            </p>
                          </div>
                        )}
                        {isVisible && user?.role === "Teacher" && (
                          <div
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Module"
                            onClick={(e) => handleDeleteModule(module._id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default CourseSidebar;
