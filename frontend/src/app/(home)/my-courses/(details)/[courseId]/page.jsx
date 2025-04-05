"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
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

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const searchParams = useSearchParams();
  const { showAlert, alertTypes } = useAlert();

  const [course, setCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      const data = await getCourseDetails(courseId);
      setCourse(data);

      const moduleId = searchParams.get("moduleId");

      if (moduleId && data.modules) {
        const foundModule = data.modules.find(
          (module) => module._id === moduleId
        );

        if (foundModule) {
          setSelectedModule(foundModule);
          setIsDashboardOpen(false);
        } else {
          showAlert("Module not found in this course", alertTypes.WARNING);
        }
      }
    } catch (err) {
      showAlert(
        err?.message || "Failed to fetch course details",
        alertTypes.ERROR
      );
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, searchParams]);

  // This function will be passed to ModuleContent to trigger refetch
  const handleModuleUpdate = () => {
    fetchCourseDetails(); // Refetch course details when a module is updated
  };

  return (
    <div className="min-h-screen xl:flex">
      <CourseSidebar
        course={course}
        selectedModule={selectedModule}
        isDashboardOpen={isDashboardOpen}
        isPresentationOpen={isPresentationOpen}
        isRoadmapOpen={isRoadmapOpen}
        setSelectedModule={setSelectedModule}
        setIsDashboardOpen={setIsDashboardOpen}
        setIsPresentationOpen={setIsPresentationOpen}
        setIsRoadmapOpen={setIsRoadmapOpen}
      />
      <Backdrop />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="min-h-screen">
          {isDashboardOpen && <CourseDashboard course={course} />}
          {isPresentationOpen && (
            <PresentationGenerator courseId={course._id} />
          )}
          {isRoadmapOpen && <Roadmap course={course} />}
          {!isDashboardOpen && !isPresentationOpen && !isRoadmapOpen && (
            <ModuleContent
              selectedModule={selectedModule}
              selectedContent={selectedContent}
              setSelectedContent={setSelectedContent}
              onModuleUpdate={handleModuleUpdate} // Pass the function
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
