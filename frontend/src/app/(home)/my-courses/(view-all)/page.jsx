"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  Search,
  BookOpen,
  UserCircle2,
  Calendar,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMyCourses } from "@/api/courseApi";
import { useAlert } from "@/context/AlertContext";
import useUserStore from "@/store/userStore";
import { useRouter } from "next/navigation";
import CreateCourseForm from "@/components/courses/CreateCourseForm";

// Truncate text to a specific length
const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const CoursesPage = () => {
  const { showAlert, alertTypes } = useAlert();
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const data = await getMyCourses();
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

  const openCourse = (course) => {
    router.push(`/my-courses/${course._id}`);
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

  const handleCourseCreated = (newCourse) => {
    setCourses([...courses, newCourse]);
    setIsCreatingCourse(false);
  };
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              My Courses
            </h1>
          </div>

          {/* Filters Section */}
          {!isCreatingCourse && (
            <div className="mb-8 mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 mx-auto space-y-4 md:space-y-0">
                <div className="relative w-full md:w-2/3 lg:w-1/2">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder={
                      user?.role === "Teacher"
                        ? "Search by name"
                        : "Search courses by name, instructor..."
                    }
                    className="pl-12 py-3 text-base border-2 border-gray-300 dark:border-gray-700 rounded-xl w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {user?.role === "Teacher" && !isCreatingCourse && (
                  <Button
                    className="w-full md:w-auto flex items-center"
                    onClick={() => setIsCreatingCourse(true)}
                  >
                    <PlusCircle className="w-5 h-5 mr-2" /> Create Course
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Create Course Form */}
          {isCreatingCourse && (
            <div className="mb-8">
              <CreateCourseForm
                onCancel={() => setIsCreatingCourse(false)}
                onCourseCreated={handleCourseCreated}
              />
            </div>
          )}

          {/* Course Cards */}

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 mb-4 rounded"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isCreatingCourse &&
            (filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card
                    key={course._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg 
             transition-all duration-300 transform hover:-translate-y-2 
             border border-gray-300 dark:border-gray-700 
             overflow-hidden flex flex-col h-full"
                    onClick={() => openCourse(course)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.image?.url || "/placeholder.svg"}
                        alt={course.name || "Course Image"}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>

                    <CardContent className="flex-grow p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                          {truncateText(course.name, 50)}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="ml-2 bg-primary/10 text-primary border-primary/30"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Sem {course.semester || "N/A"}
                        </Badge>
                      </div>

                      {user?.role === "Student" && (
                        <div className="flex items-center mb-4">
                          <UserCircle2 className="w-6 h-6 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {course.instructor?.firstName || ""}{" "}
                            {course.instructor?.lastName || ""}
                          </span>
                        </div>
                      )}

                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {truncateText(course.description, 100)}
                      </p>

                      {/* Ensuring consistent button placement */}
                      <div className="mt-auto pt-4 border-t dark:border-gray-700">
                        <Button
                          variant="outline"
                          className="w-full bg-primary/10 text-primary hover:bg-primary/20 
                   border-primary/30 transition-colors duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCourse(course);
                          }}
                        >
                          View Course
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
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
