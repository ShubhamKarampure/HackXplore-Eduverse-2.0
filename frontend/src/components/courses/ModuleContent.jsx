"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  FileDown,
  ClipboardList,
  FileText,
  Clock,
  Edit,
  UploadCloud,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import VideoSection from "./content/VideoSection";
import ResourSection from "./content/ResourceSection";
import QuizSection from "./content/QuizSection";
import AssignmentSection from "./content/AssignmentSection";
import { useAlert } from "@/context/AlertContext";
import useUserStore from "@/store/userStore";
import axios from "axios";

const ModuleContent = ({ selectedModule, onModuleUpdate }) => {
    const { showAlert, alertTypes } = useAlert();

  const user = useUserStore((state) => state.user);
  const isTeacher = user?.role === "Teacher";
  const [isEditMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [moduleData, setModuleData] = useState(
    selectedModule || {
      title: "",
      description: "",
      contents: {},
    }
  );

  useEffect(() => {
    if (selectedModule) {
      setModuleData({
        ...selectedModule,
        contents: selectedModule.contents || {},
      });
    }
  }, [selectedModule]);

  const handleInputChange = (field, value) => {
    setModuleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateModuleContents = (section, data) => {
    setModuleData((prev) => ({
      ...prev,
      contents: {
        ...prev.contents,
        [section]: data,
      },
    }));
  };

  const handleSaveModule = async () => {
    // Validate required fields
      if (!moduleData.title.trim()) {
        showAlert("Module title is required", alertTypes.ERROR);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare form data for file uploads
      const formData = new FormData();
      
      // Add basic module details
      formData.append('title', moduleData.title);
      formData.append('description', moduleData.description);

      // Handle video upload if exists
      if (moduleData.contents?.video) {
          const videoFile = moduleData.contents.video.file;
          const videoTitle = moduleData.contents.video.title;
          if (videoFile) {
          formData.append('video', videoFile);
          }
          if (videoTitle) {
              formData.append('videoTitle',videoTitle );
          }
      }

      // Handle resource upload if exists
      if (moduleData.contents?.resource) {
        const resourceFile = moduleData.contents.resource.file;
        if (resourceFile) {
          formData.append('resource', resourceFile);
        }
      }
   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

        // Send API request to update module
        console.log(selectedModule._id)
      const response = await axios.put(
        `${BACKEND_URL}/modules/${selectedModule._id}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

    //   // Update assignment details via separate API call
    //   if (moduleData.contents?.assignment) {
    //     await axios.put(
    //       `/assignments/${moduleData.contents.assignment._id}`,
    //       {
    //         description: moduleData.contents.assignment.description,
    //         criteria: moduleData.contents.assignment.criteria,
    //         deadline: moduleData.contents.assignment.deadline
    //       }
    //     );
    //   }

        // Notify and update
        showAlert("Module updated successfully", alertTypes.SUCCESS);
     if (onModuleUpdate) {
        onModuleUpdate(); // Trigger course refetch
      }
      setEditMode(false);
    } catch (error) {
        console.error("Error updating module:", error);
           showAlert(error.response?.data?.message || "Failed to update module", alertTypes.ERROR);
   
      } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex-grow p-6 max-w-4xl mx-auto space-y-8">
      {/* Edit/Save Button in Top Right Corner */}
      <div className="absolute top-6 right-6 z-10">
        {isEditMode ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setEditMode(false)}
              disabled={isLoading}
            >
              <X className="mr-2 w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveModule}
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        ) : (
          isTeacher && (
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Edit className="mr-2 w-4 h-4" />
              Edit Module
            </Button>
          )
        )}
      </div>

      {isEditMode ? (
        <div className="mt-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
            Edit Module Details
          </h1>
          <div className="space-y-4">
            <div>
              <Label>Module Title</Label>
              <Input
                type="text"
                placeholder="Enter module title"
                value={moduleData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            <div>
              <Label>Module Description</Label>
              <TextArea
                placeholder="Enter module description"
                value={moduleData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-16">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedModule.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {selectedModule.description}
          </p>
        </div>
      )}

      <VideoSection
        videoData={moduleData.contents?.video}
        onVideoUpload={(videoData) => updateModuleContents("video", videoData)}
        isEditMode={isEditMode}
        selectedModule={selectedModule}
      />

      <ResourSection
        resourceData={moduleData.contents?.resource}
        onResourceUpload={(resourceData) =>
          updateModuleContents("resource", resourceData)
        }
        isEditMode={isEditMode}
        selectedModule={selectedModule}
      />

      <AssignmentSection
        assignmentData={moduleData.contents?.assignment}
        onAssignmentUpdate={(assignmentData) =>
          updateModuleContents("assignment", assignmentData)
        }
              isEditMode={isEditMode}
              isTeacher={isTeacher}
      />

      <QuizSection
        quizData={moduleData.contents?.quiz}
        moduleId={selectedModule._id}
        courseId={selectedModule.course}
        isTeacher={isTeacher}
          />
          <div className="absolute top-6 right-6 z-10">
        {isEditMode ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setEditMode(false)}
              disabled={isLoading}
            >
              <X className="mr-2 w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveModule}
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        ) : (
          isTeacher && (
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Edit className="mr-2 w-4 h-4" />
              Edit Module
            </Button>
          )
        )}
      </div>
      </div>
      
      
  );
};

export default ModuleContent;