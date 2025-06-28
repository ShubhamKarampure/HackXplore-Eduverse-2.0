"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@/context/AlertContext";
import { getCourseDetails } from "@/api/courseApi";
import ModuleContent from "@/components/courses/ModuleContent";
import Backdrop from "@/layout/Backdrop";
import AppHeader from "@/layout/AppHeader";
import CourseSidebar from "@/components/courses/CourseSidebar";
import { useSidebar } from "@/context/SidebarContext";
import CourseDashboard from "@/components/courses/CourseDashboard";
import { PresentationGenerator } from "@/components/content-generation/presentation";
import Roadmap from "@/components/courses/content/Roadmap";
import Loader from "@/components/Loading"; // Assuming a generic Loader component

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const searchParams = useSearchParams();
  const { showAlert, alertTypes } = useAlert();
  const queryClient = useQueryClient();

  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard', 'module', 'roadmap', 'presentation'
  const [selectedModule, setSelectedModule] = useState(null);

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseDetails(courseId),
    enabled: !!courseId,
    onError: (err) => {
      showAlert(
        err?.message || "Failed to fetch course details",
        alertTypes.ERROR
      );
    },
  });

  useEffect(() => {
    const moduleId = searchParams.get("moduleId");
    if (moduleId) {
      setSelectedModule(moduleId);
      setActiveView("module");
    } else {
      // Default to dashboard if no module is selected
      setActiveView("dashboard");
      setSelectedModule(null);
    }
  }, [searchParams]);

  const handleTitleUpdate = (moduleId, newTitle) => {
    // Optimistically update the local cache for instant UI feedback
    queryClient.setQueryData(["course", courseId], (oldData) => {
      if (!oldData) return;
      const updatedModules = oldData.modules.map((module) =>
        module._id === moduleId ? { ...module, title: newTitle } : module
      );
      return { ...oldData, modules: updatedModules };
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (isError) {
      return (
        <div className="p-6 text-center text-red-500">
          Error loading course: {error.message}
        </div>
      );
    }

    if (!course) {
      return (
        <div className="p-6 text-center text-gray-500">Course not found.</div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return <CourseDashboard course={course} />;
      case "presentation":
        return <PresentationGenerator courseId={course._id} />;
      case "roadmap":
        return <Roadmap course={course} />;
      case "module":
        return (
          <ModuleContent
            selectedModule={selectedModule}
            handleTitleUpdate={handleTitleUpdate}
          />
        );
      default:
        return <CourseDashboard course={course} />;
    }
  };

  return (
    <div className="min-h-screen xl:flex">
      <CourseSidebar
        course={course}
        selectedModule={selectedModule}
        activeView={activeView}
        setActiveView={setActiveView}
        setSelectedModule={setSelectedModule}
      />
      <Backdrop />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="min-h-screen">{renderContent()}</div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
