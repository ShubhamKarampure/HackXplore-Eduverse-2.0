"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  AlertCircle,
  Search,
  BookOpen,
  UserCircle2,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllCourses, enrollCourse } from "@/api/courseApi";
import { useAlert } from "@/context/AlertContext";

// Truncate text to a specific length
const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const CoursesPage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState("");
  const { showAlert, alertTypes } = useAlert();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCourses();
        setCourses(data.courses);
      } catch (err) {
        const errorMessage = err?.message || "Failed to fetch courses";

        // Use error alert for fetch failure
        showAlert(errorMessage, alertTypes.ERROR);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setEnrollmentId("");
  };

  const handleEnroll = async () => {
    if (!selectedCourse) {
      showAlert("Please select a course before enrolling", alertTypes.WARNING);
      return;
    }

    if (!enrollmentId) {
      showAlert("Please enter an enrollment ID", alertTypes.WARNING);
      return;
    }

    try {
      const response = await enrollCourse(selectedCourse._id, enrollmentId);

      // Remove the enrolled course from the list
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course._id !== selectedCourse._id)
      );

      // Success alert for enrollment
      showAlert(
        `Successfully enrolled in ${selectedCourse.name}`,
        alertTypes.SUCCESS
      );

      setSelectedCourse(null); // Reset selected course
      setEnrollmentId(""); // Clear enrollment ID
    } catch (error) {
      // Error alert for enrollment failure
      showAlert(
        error?.message || "Enrollment failed. Please check your enrollment ID",
        alertTypes.ERROR
      );
    }
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(
    (course) =>
      course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      course.instructor?.lastName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Rest of the component remains the same as in the original code
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Courses
            </h1>
          </div>

          {/* Filters Section */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search courses by name, instructor..."
                className="pl-12 py-3 text-base border-2 border-gray-300 dark:border-gray-700 
                           focus:ring-2 focus:ring-primary/50 
                           dark:bg-gray-800 dark:text-white 
                           transition-all duration-300 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Course Cards */}

{isLoading && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map((_, index) => (
      <div
        key={index}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 mb-3 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-600 mb-2 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)}

{(filteredCourses.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCourses.map((course) => (
        <Card
          key={course._id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg 
             transition-all duration-300 transform hover:-translate-y-2 
             border border-gray-300 dark:border-gray-700 
             overflow-hidden flex flex-col group"
          onClick={() => openCourse(course)}
        >
          {/* Card Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={course.image?.url || "/placeholder.svg"}
              alt={course.name || "Course Image"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Hover Description Overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 
                 transition-opacity duration-300 flex items-center justify-center p-4">
              <p className="text-white text-sm overflow-y-auto max-h-full">
                {truncateText(course.description, 150)}
              </p>
            </div>
          </div>

          <CardContent className="p-4 flex flex-col flex-grow">
            {/* Instructor Section */}
            {(
              <div className="flex items-center mb-3">
                {!course.instructor?.profile?.image?.url ? (
                  <UserCircle2 className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                ) : (
                  <img
                    src={course.instructor.profile.image.url}
                    alt={`${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`}
                    className="w-5 h-5 rounded-full mr-2 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">
                    {course.instructor?.firstName || ""}{" "}
                    {course.instructor?.lastName || ""}
                  </span>
                  {" • "}
                  <span className="text-gray-500">Instructor</span>
                </span>
              </div>
            )}

            {/* Title and Badge Section */}
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 pr-2">
                {truncateText(course.name, 50)}
              </CardTitle>
              <Badge
                variant="outline"
                className="flex-shrink-0 bg-primary/10 text-primary border-primary/30"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Sem {course.semester || "N/A"}
              </Badge>
            </div>
            
            {/* Spacer to push button to bottom */}
            <div className="flex-grow"></div>

            {/* Separator Line and Button - Fixed at bottom */}
            <div className="mt-3">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3"></div>
              <Button
                variant="outline"
                className="w-full bg-primary/10 text-primary hover:bg-primary/20 
                   border-primary/30 transition-colors duration-300 text-sm py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourse(course);
                }}
              >
                Enroll Course
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <BookOpen className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
        No courses found
      </h3>
      <p className="text-gray-500 dark:text-gray-500">
        Try adjusting your search or check back later
      </p>
    </div>
  ))}


          {/* Enrollment Dialog */}
          <Dialog
            open={!!selectedCourse}
            onOpenChange={() => setSelectedCourse(null)}
          >
            <DialogContent className="rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  Enrollment Verification
                </DialogTitle>
                <DialogDescription>
                  Enter the enrollment ID for{" "}
                  <span className="font-bold">
                    {selectedCourse?.name || "the course"}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Enter Enrollment ID"
                  className="py-2.5 border-2 focus:ring-2 focus:ring-primary/50"
                  value={enrollmentId}
                  onChange={(e) => {
                    setEnrollmentId(e.target.value);
                  }}
                />

                <Button
                  onClick={handleEnroll}
                  className="w-full py-3 text-base rounded-lg 
                             bg-primary hover:bg-primary/90 
                             transition-colors duration-300"
                  disabled={!enrollmentId}
                >
                  Verify and Enter Course
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
