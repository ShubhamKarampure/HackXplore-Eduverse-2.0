"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getModuleDetails, updateModule } from "@/api/moduleApi"; // Ensure updateModule API function is defined
import { useAlert } from "@/context/AlertContext";
import useUserStore from "@/store/userStore";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import VideoSection from "./content/VideoSection";
import ResourSection from "./content/ResourceSection";
import QuizSection from "./content/QuizSection";
import AssignmentSection from "./content/AssignmentSection";
import YoutubeSection from "./content/YoutubeSection";
import Loader from "../Loading";
import { Edit, Save, X } from "lucide-react";

const ModuleContent = ({ selectedModule, handleTitleUpdate }) => {
  const { showAlert, alertTypes } = useAlert();
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const isTeacher = user?.role === "Teacher";

  const [isEditMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState(null);

  const {
    data: moduleResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["module", selectedModule],
    queryFn: () => getModuleDetails(selectedModule),
    enabled: !!selectedModule,
    onError: (err) => {
      showAlert(
        err?.message || "Failed to fetch module details",
        alertTypes.ERROR
      );
    },
  });

  const moduleData = moduleResponse?.module;

  useEffect(() => {
    if (moduleData) {
      setEditableData(moduleData);
    }
  }, [moduleData]);

  const { mutate: saveModule, isLoading: isSaving } = useMutation({
    mutationFn: (formData) => updateModule(selectedModule, formData),
    onSuccess: (data) => {
      showAlert("Module updated successfully", alertTypes.SUCCESS);
      queryClient.invalidateQueries(["module", selectedModule]); 
      queryClient.invalidateQueries(["course", moduleData?.course]);
      handleTitleUpdate(selectedModule, editableData.title);
      setEditMode(false);
    },
    onError: (err) => {
      showAlert(
        err.response?.data?.message || "Failed to update module",
        alertTypes.ERROR
      );
    },
  });

  const handleInputChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const updateModuleContents = (section, data) => {
    let updatedData = data;
    if (section === "assignment" && editableData?.contents?.assignment) {
      updatedData = { ...data, _id: editableData.contents.assignment._id };
    }
    setEditableData((prev) => ({
      ...prev,
      contents: { ...prev.contents, [section]: updatedData },
    }));
  };

  const handleSaveModule = () => {
    if (!editableData?.title?.trim()) {
      showAlert("Module title is required", alertTypes.ERROR);
      return;
    }

    const formData = new FormData();
    formData.append("title", editableData.title);
    formData.append("description", editableData.description);

    if (editableData?.contents?.video?.file) {
      formData.append("video", editableData.contents.video.file);
    }
    if (editableData?.contents?.video?.title) {
      formData.append("videoTitle", editableData.contents.video.title);
    }
    if (editableData?.contents?.resource?.file) {
      formData.append("resource", editableData.contents.resource.file);
    }

    saveModule(formData);
  };

  const handleCancelEdit = () => {
    if (moduleData) {
      setEditableData(moduleData); // Reset changes
    }
    setEditMode(false);
  };

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">Error: {error.message}</div>
    );
  if (!moduleData && !isLoading)
    return (
      <div className="p-6 text-center text-gray-500">
        Select a module to view its content.
      </div>
    );

  return (
    <div className="relative flex-grow p-6 max-w-4xl mx-auto space-y-8">
      <div className="absolute top-6 right-6 z-10">
        {isEditMode ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              <X className="mr-2 w-4 h-4" /> Cancel
            </Button>
            <Button onClick={handleSaveModule} disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        ) : (
          isTeacher && (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              <Edit className="mr-2 w-4 h-4" /> Edit Module
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
                value={editableData?.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            <div>
              <Label>Module Description</Label>
              <TextArea
                placeholder="Enter module description"
                value={editableData?.description || ""}
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
            {moduleData?.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {moduleData?.description}
          </p>
        </div>
      )}

      <VideoSection
        videoData={editableData?.contents?.video}
        onVideoUpload={(videoData) => updateModuleContents("video", videoData)}
        isEditMode={isEditMode}
        moduleData={moduleData}
      />
      <ResourSection
        resourceData={editableData?.contents?.resource}
        onResourceUpload={(resourceData) =>
          updateModuleContents("resource", resourceData)
        }
        isEditMode={isEditMode}
        selectedModule={selectedModule}
      />
      <AssignmentSection
        assignmentData={editableData?.contents?.assignment}
        onAssignmentUpdate={(assignmentData) =>
          updateModuleContents("assignment", assignmentData)
        }
        isEditMode={isEditMode}
        isTeacher={isTeacher}
      />
      <QuizSection
        quizData={moduleData?.contents?.quiz}
        moduleId={selectedModule}
        courseId={moduleData?.course}
        isTeacher={isTeacher}
      />
      {!isEditMode && <YoutubeSection moduleData={moduleData} />}

      {isEditMode && (
        <div className="flex justify-between items-center mt-8 border-t pt-6">
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isSaving}
          >
            <X className="mr-2 w-4 h-4" /> Cancel
          </Button>
          <Button onClick={handleSaveModule} disabled={isSaving}>
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 w-4 h-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModuleContent;
