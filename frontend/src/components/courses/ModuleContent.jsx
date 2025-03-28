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
  Trash2
} from 'lucide-react';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import TextArea from '../form/input/TextArea';
import VideoSection from './content/VideoSection';
import ResourSection from './content/ResourSection';
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
    }
  };

 
    return (
      <div className="flex-grow p-6 max-w-4xl mx-auto space-y-8">
            <div className="mb-8">
                
                {isEditMode ? (<button onClick={() => { setEditMode(false) }}>
                        Save Module
                    </button>) : (<button onClick={() => { setEditMode(true) }}>
                        Edit Module
                    </button>)
                }
                {isEditMode ? (<>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Edit className="mr-3 w-8 h-8 text-blue-500" />
           Edit Module
          </h1>
                    <div className="space-y-4 mt-4">
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
                </div></>):
                (<div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {selectedModule.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {selectedModule.description}
        </p>
      </div>)}
            </div>
            
            


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

        <QuizEditSection 
          quizData={moduleData.contents?.quiz}
          onQuizUpdate={(quizData) => updateModuleContents('quiz', quizData)}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="secondary">Cancel</Button>
          <Button onClick={handleSaveModule}>
            {selectedModule ? 'Update Module' : 'Create Module'}
          </Button>
        </div>
      </div>
    );
};

export default ModuleContent;