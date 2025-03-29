"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { X, Upload, Loader2 } from "lucide-react";
import ComponentCard from "./dashboard/stats/common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Form from "../form/Form";
import Button from "../ui/button/Button";
import { createCourse } from "@/api/courseApi";
import Loader from "../Loading";

export default function CreateCourseForm({ onCancel,onCourseCreated}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert, alertTypes } = useAlert();
  const [course, setCourse] = useState({
    name: "",
    description: "",
    enrollKey: "",
    semester: "",
    syllabus: null,
    textbooks: [],
    image: null,
  });

  const [previews, setPreviews] = useState({
    image: null,
    syllabus: null,
    textbooks: []
  });

  const handleChange = (field, value) => {
    setCourse((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field, files) => {
    const fileList = Array.from(files);
    
    if (field === "textbooks") {
      // Handle multiple textbooks
      setCourse((prev) => ({ 
        ...prev, 
        textbooks: [...prev.textbooks, ...fileList] 
      }));
      
      // Create previews for textbooks
      const newTextbookPreviews = fileList.map(file => ({
        name: file.name,
        type: file.type
      }));
      setPreviews(prev => ({
        ...prev,
        textbooks: [...(prev.textbooks || []), ...newTextbookPreviews]
      }));
    } else {
      // Handle single file (image or syllabus)
      const file = fileList[0];
      setCourse((prev) => ({ ...prev, [field]: file }));
      
      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({
            ...prev,
            [field]: {
              dataUrl: reader.result,
              name: file.name,
              type: file.type
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDrop = (field) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer?.files;
    if (files) {
      handleFileChange(field, files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = (field, index) => {
    if (field === "textbooks" && index !== undefined) {
      // Remove specific textbook
      setCourse(prev => ({
        ...prev,
        textbooks: prev.textbooks.filter((_, i) => i !== index)
      }));
      setPreviews(prev => ({
        ...prev,
        textbooks: prev.textbooks.filter((_, i) => i !== index)
      }));
    } else {
      // Remove single file (image or syllabus)
      setCourse(prev => ({
        ...prev,
        [field]: null
      }));
      setPreviews(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const formData = new FormData();

    Object.entries(course).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((file, index) => formData.append(`${key}[${index}]`, file));
      } else {
        formData.append(key, value);
      }
    });
    try {
      const response = await createCourse(formData);
      
      showAlert("Course created successfully", alertTypes.SUCCESS);
      onCourseCreated(response.course);
    } catch (error) {
      console.log(error);
      showAlert(error.response?.data?.message || "Error creating course", alertTypes.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const FileDropzone = ({ 
    field, 
    multiple = false, 
    accept, 
    children 
  }) => {
    const fileInputRef = useRef(null);

    const triggerFileInput = () => {
      fileInputRef.current?.click();
    };

    return (
      <div 
        onDrop={handleDrop(field)}
        onDragOver={handleDragOver}
        onClick={triggerFileInput}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center 
                   hover:border-blue-500 transition-colors duration-300 cursor-pointer"
      >
        <input 
          ref={fileInputRef}
          type="file" 
          id={field}
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFileChange(field, e.target.files)}
          className="hidden"
        />
        {children}
      </div>
    );
  };

  const FilePreview = ({ file, onRemove }) => (
    <div className="flex items-center bg-gray-100 p-2 rounded-md mb-2">
      <span className="flex-grow truncate mr-2">{file.name}</span>
      <button 
        type="button" 
        onClick={onRemove} 
        className="text-red-500 hover:text-red-700"
      >
        <X size={20} />
      </button>
    </div>
  );

 

  return (
    <>
      {/* Full Page Loader */}
          {isLoading ? <Loader /> :
              (
                  <ComponentCard title="Create a New Course">
                      <Form onSubmit={handleSubmit}>
                          <div className="grid gap-6 sm:grid-cols-2">
                              <div className="col-span-full">
                                  <Label htmlFor="name">Course Name</Label>
                                  <Input
                                      type="text"
                                      id="name"
                                      value={course.name}
                                      onChange={(e) => handleChange("name", e.target.value)}
                                      required
                                  />
                              </div>

                              <div className="col-span-full">
                                  <Label htmlFor="description">Description</Label>
                                  <Input
                                      type="textarea"
                                      id="description"
                                      value={course.description}
                                      onChange={(e) => handleChange("description", e.target.value)}
                                      required
                                  />
                              </div>

                              <div className="col-span-full">
                                  <Label htmlFor="enrollKey">Enrollment Key</Label>
                                  <Input
                                      type="text"
                                      id="enrollKey"
                                      value={course.enrollKey}
                                      onChange={(e) => handleChange("enrollKey", e.target.value)}
                                      required
                                  />
                              </div>

                              <div className="col-span-full">
                                  <Label htmlFor="semester">Semester</Label>
                                  <Input
                                      type="text"
                                      id="semester"
                                      value={course.semester}
                                      onChange={(e) => handleChange("semester", e.target.value)}
                                      required
                                  />
                              </div>
            
                              <div className="col-span-full">
                                  <Label htmlFor="image">Course Image</Label>
                                  <FileDropzone
                                      field="image"
                                      accept="image/*"
                                  >
                                      {previews.image ? (
                                          <div className="relative">
                                              <img
                                                  src={previews.image.dataUrl}
                                                  alt="Course preview"
                                                  className="max-h-64 mx-auto object-contain rounded-lg"
                                              />
                                              <button
                                                  type="button"
                                                  onClick={() => removeFile("image")}
                                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                              >
                                                  <X size={20} />
                                              </button>
                                          </div>
                                      ) : (
                                          <div className="flex flex-col items-center">
                                              <Upload size={48} className="text-gray-400 mb-4" />
                                              <p className="text-gray-600">
                                                  Drag and drop an image or click to upload
                                              </p>
                                          </div>
                                      )}
                                  </FileDropzone>
                              </div>

                              <div className="col-span-full">
                                  <Label htmlFor="syllabus">Syllabus (PDF)</Label>
                                  <FileDropzone
                                      field="syllabus"
                                      accept=".pdf"
                                  >
                                      {previews.syllabus ? (
                                          <FilePreview
                                              file={previews.syllabus}
                                              onRemove={() => removeFile("syllabus")}
                                          />
                                      ) : (
                                          <div className="flex flex-col items-center">
                                              <Upload size={48} className="text-gray-400 mb-4" />
                                              <p className="text-gray-600">
                                                  Drag and drop a PDF or click to upload
                                              </p>
                                          </div>
                                      )}
                                  </FileDropzone>
                              </div>

                              <div className="col-span-full">
                                  <Label htmlFor="textbooks">Textbooks (Multiple Files)</Label>
                                  <FileDropzone
                                      field="textbooks"
                                      multiple
                                  >
                                      {previews.textbooks && previews.textbooks.length > 0 ? (
                                          <div>
                                              {previews.textbooks.map((book, index) => (
                                                  <FilePreview
                                                      key={index}
                                                      file={book}
                                                      onRemove={() => removeFile("textbooks", index)}
                                                  />
                                              ))}
                                          </div>
                                      ) : (
                                          <div className="flex flex-col items-center">
                                              <Upload size={48} className="text-gray-400 mb-4" />
                                              <p className="text-gray-600">
                                                  Drag and drop textbooks or click to upload
                                              </p>
                                          </div>
                                      )}
                                  </FileDropzone>
                              </div>
                          </div>

                          <div className="mt-6 flex gap-4">
                              <Button
                                  type="submit"
                                  disabled={isLoading}
                              >
                                  {!isLoading ? "Create Course" : "Creating..."}
                              </Button>
                              <Button
                                  type="button"
                                  onClick={onCancel}
                                  variant="secondary"
                                  disabled={isLoading}
                              >
                                  Cancel
                              </Button>
                          </div>
                      </Form>
                  </ComponentCard>)}
    </>
  );
}