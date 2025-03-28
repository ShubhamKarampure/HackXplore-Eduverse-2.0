"use client";

import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import TextArea from '../form/input/TextArea';
import VideoSection from './content/VideoSection';
import ResourSection from './content/ResourSection';
import QuizSection from './content/QuizEditSection';
import AssignmentEditSection from './content/AssignmentEditSection';
import QuizEditSection from './content/QuizEditSection';
import useUserStore from '@/store/userStore';

const ModuleContent = ({ 
  selectedModule, 
  onSaveModule 
}) => {
    const user = useUserStore((state) => state.user);
    const [isEditMode, setEditMode] = useState(false);
    const [moduleData, setModuleData] = useState(selectedModule || {
        title: '',
        description: '',
        contents: {}
    });

    const handleInputChange = (field, value) => {
        setModuleData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateModuleContents = (section, data) => {
        setModuleData(prev => ({
            ...prev,
            contents: {
                ...prev.contents,
                [section]: data
            }
        }));
    };

    const handleSaveModule = () => {
        if (onSaveModule) {
            onSaveModule(moduleData);
            setEditMode(false);
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
                        >
                            <X className="mr-2 w-4 h-4" />
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveModule}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Save className="mr-2 w-4 h-4" />
                            Save Changes
                        </Button>
                    </div>
                ) : (
                    <Button 
                        variant="outline" 
                        onClick={() => setEditMode(true)}
                        className="text-blue-600 hover:bg-blue-50"
                    >
                        <Edit className="mr-2 w-4 h-4" />
                        Edit Module
                    </Button>
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
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Module Description</Label>
                            <TextArea 
                                placeholder="Enter module description"
                                value={moduleData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
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
                onVideoUpload={(videoData) => updateModuleContents('video', videoData)}
                isEditMode={isEditMode}
                selectedModule={selectedModule}
            />

            <ResourSection
                resourceData={moduleData.contents?.resource}
                onResourceUpload={(resourceData) => updateModuleContents('resource', resourceData)}
                isEditMode={isEditMode}
                selectedModule={selectedModule}
            />

            <AssignmentEditSection 
                assignmentData={moduleData.contents?.assignment}
                onAssignmentUpdate={(assignmentData) => updateModuleContents('assignment', assignmentData)}
            />

            <QuizSection
                quizData={moduleData.contents?.quiz}
                moduleId={selectedModule._id}
            />
        </div>
    );
};

export default ModuleContent;   