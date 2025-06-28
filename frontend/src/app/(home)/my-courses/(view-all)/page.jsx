"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyCourses, createCourse } from "@/api/courseApi"; 
import useUserStore from "@/store/userStore";
import { useAlert } from "@/context/AlertContext";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge";
import CreateCourseForm from "@/components/courses/CreateCourseForm";
import {
  Search,
  BookOpen,
  UserCircle2,
  Calendar,
  PlusCircle,
} from "lucide-react";
import Loader from "@/components/Loading"; 

const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const CoursesPage = () => {
  const { showAlert, alertTypes } = useAlert();
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myCourses"],
    queryFn: getMyCourses,
    select: (data) => data.courses, 
    onError: (err) => {
      showAlert(err?.message || "Failed to fetch courses", alertTypes.ERROR);
    },
  });

  const { mutate: addCourse, isLoading: isCreating } = useMutation({
    mutationFn: createCourse,
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries(["myCourses"]);
      showAlert("Course created successfully!", alertTypes.SUCCESS);
      setIsCreatingCourse(false);
    },
    onError: (err) => {
      showAlert(err?.message || "Failed to create course", alertTypes.ERROR);
    },
  });

  const openCourse = (course) => {
    router.push(`/my-courses/${course._id}`);
  };

  const handleCourseCreated = (formData) => {
    addCourse(formData);
  };

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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              My Courses
            </h1>
          </div>

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
                {user?.role === "Teacher" && (
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

          {isCreatingCourse && (
            <div className="mb-8">
              <CreateCourseForm
                onCancel={() => setIsCreatingCourse(false)}
                onCourseCreated={handleCourseCreated}
                isCreating={isCreating}
              />
            </div>
          )}

          {isLoading && <Loader />}
          {isError && (
            <div className="text-center text-red-500">
              Error: {error.message}
            </div>
          )}

          {!isLoading &&
            !isError &&
            !isCreatingCourse &&
            (filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card
                    key={course._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-300 dark:border-gray-700 overflow-hidden flex flex-col group"
                    onClick={() => openCourse(course)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.image?.url || "/placeholder.svg"}
                        alt={course.name || "Course Image"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <p className="text-white text-sm overflow-y-auto max-h-full">
                          {truncateText(course.description, 150)}
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow">
                      {user?.role === "Student" && (
                        <div className="flex items-center mb-3">
                          {!course.instructor?.profile?.image?.url ? (
                            <UserCircle2 className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <img
                              src={course.instructor.profile.image.url}
                              alt={`${course.instructor.firstName || ""} ${
                                course.instructor.lastName || ""
                              }`}
                              className="w-5 h-5 rounded-full mr-2 object-cover"
                            />
                          )}
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">
                              {course.instructor?.firstName || ""}{" "}
                              {course.instructor?.lastName || ""}
                            </span>
                          </span>
                        </div>
                      )}
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
                      <div className="flex-grow"></div>
                      <div className="mt-3">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3"></div>
                        <Button
                          variant="outline"
                          className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 transition-colors duration-300 text-sm py-1"
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
                  {user?.role === "Teacher"
                    ? "Create your first course to get started."
                    : "Try adjusting your search or check back later"}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
