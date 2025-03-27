"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { getCourseDetails } from "@/api/courseApi";
import ModuleContent from "@/components/courses/ModuleContent";
import Backdrop from "@/layout/Backdrop";
import AppHeader from "@/layout/AppHeader";
import CourseSidebar from "@/components/courses/CourseSidebar";
import { useSidebar } from "@/context/SidebarContext";
import CourseDashboard from "@/components/courses/CourseDashboard";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { showAlert, alertTypes } = useAlert();

  // State management
  const [course, setCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true); 

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  
    // Dynamic class for main content margin based on sidebar state
    const mainContentMargin = isMobileOpen
      ? "ml-0"
      : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";
  
  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const data = await getCourseDetails(courseId);
        console.log(data);
        setCourse(data);

        
      } catch (err) {
        showAlert(err?.message || "Failed to fetch course details", alertTypes.ERROR);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  return (
      <div className="min-h-screen xl:flex">
      
    
      {/* Sidebar Component */}
      <CourseSidebar course={course} selectedModule={selectedModule} setSelectedModule={setSelectedModule} setIsDashboardOpen={setIsDashboardOpen}/>
        <Backdrop />
        
        <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
        >

         <AppHeader />
        {/* Module Content Component */}'
        <div className="min-h-screen">
          {isDashboardOpen && <CourseDashboard course={course} ></CourseDashboard>}
          {!isDashboardOpen && <ModuleContent selectedModule={selectedModule} selectedContent={selectedContent} setSelectedContent={setSelectedContent} />}
        </div>'
    </div>
       
      </div>
  );
};

export default CourseDetailPage;
