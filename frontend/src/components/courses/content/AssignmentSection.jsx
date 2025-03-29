import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  Eye,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import Label from '../../form/Label';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { useAlert } from '@/context/AlertContext';
import 'react-datepicker/dist/react-datepicker.css';
// Import Froala Editor
import FroalaEditor from 'react-froala-wysiwyg';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import StudentAssignmentView from './StudentView';

const AssignmentSection = ({
  isTeacher = false,
  assignmentData = null,
  onAssignmentUpdate,
  isEditMode,
}) => {
  const { showAlert, alertTypes } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // State management for assignment details
  const [title, setTitle] = useState(assignmentData?.title || '');
  const [description, setDescription] = useState(
    assignmentData?.description || ''
  );
  const [criteria, setCriteria] = useState(assignmentData?.criteria || []);
  const [newCriterion, setNewCriterion] = useState('');
  const [deadline, setDeadline] = useState(
    assignmentData?.deadline ? new Date(assignmentData.deadline) : new Date()
  );

  // Update state when assignmentData changes
  useEffect(() => {
    if (assignmentData) {
      setTitle(assignmentData.title || '');
      setDescription(assignmentData.description || '');
      setCriteria(assignmentData.criteria || []);
      setDeadline(
        assignmentData.deadline ? new Date(assignmentData.deadline) : new Date()
      );
    }
  }, [assignmentData]);

  // Froala Editor configuration
  const froalaConfig = {
    placeholderText: 'Enter assignment description with formatting...',
    charCounterCount: true,
    toolbarButtons: [
      'bold',
      'italic',
      'underline',
      'strikeThrough',
      'subscript',
      'superscript',
      '|',
      'paragraphFormat',
      'align',
      'formatOL',
      'formatUL',
      'indent',
      'outdent',
      '|',
      'insertLink',
      'insertTable',
      '|',
      'clearFormatting',
      'undo',
      'redo',
      'html',
    ],
    pluginsEnabled: [
      'align',
      'charCounter',
      'codeBeautifier',
      'colors',
      'entities',
      'fontFamily',
      'fontSize',
      'lineBreaker',
      'lineHeight',
      'link',
      'lists',
      'paragraphFormat',
      'paragraphStyle',
      'table',
    ],
  };

  const addCriterion = () => {
    if (newCriterion.trim()) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const removeCriterion = (index) => {
    const updatedCriteria = [...criteria];
    updatedCriteria.splice(index, 1);
    setCriteria(updatedCriteria);
  };

  const handleSave = async () => {
    // Validation
    if (!description.trim()) {
      showAlert('Assignment description is required', alertTypes.ERROR);
      return;
    }

    setIsLoading(true);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const assignmentPayload = {
        description,
        criteria,
        deadline,
        title,
      };

      let updatedAssignment;

      // Update existing assignment or create new one
      if (assignmentData?._id) {
        const response = await axios.put(
          `${BACKEND_URL}/assignments/${assignmentData._id}`,
          assignmentPayload
        );
        updatedAssignment = response.data;

        // Preserve the assignment ID in the updated data
        updatedAssignment = {
          ...response.data,
          _id: assignmentData._id,
        };

        showAlert('Assignment updated successfully', alertTypes.SUCCESS);
      } else {
        // Handle creation of new assignment if needed
        // This would require additional module ID information
        showAlert('Assignment creation is not implemented', alertTypes.ERROR);
        return;
      }

      // Update parent component with the latest assignment data
      if (onAssignmentUpdate) {
        // Important: Include _id and use the full object structure expected by the parent
        const updatedAssignmentData = {
          _id: assignmentData._id,
          description,
          criteria,
          deadline,
          title,
        };

        onAssignmentUpdate(updatedAssignmentData);
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      showAlert(
        error.response?.data?.message || 'Failed to save assignment',
        alertTypes.ERROR
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render for teachers with full editing capabilities
  if (isTeacher && isEditMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="w-6 h-6 mr-3 text-orange-500" />
            Module Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Assignment Title</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter assignment title"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Assignment Description</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={'outline'}
                    size="sm"
                    onClick={() => setIsPreviewMode(false)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={'outline'}
                    size="sm"
                    onClick={() => setIsPreviewMode(true)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>

              {/* Froala Editor with Edit/Preview toggle */}
              <div className="border rounded-md overflow-hidden">
                {!isPreviewMode ? (
                  <FroalaEditor
                    tag="textarea"
                    model={description}
                    onModelChange={setDescription}
                    config={froalaConfig}
                  />
                ) : (
                  <div
                    className="fr-view bg-white p-3 min-h-40"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}
              </div>
            </div>

            <div>
              <Label>Submission Criteria</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  type="text"
                  placeholder="Add submission criterion"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCriterion()}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={addCriterion}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {criteria.map((criterion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded mb-1"
                  >
                    <span>{criterion}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCriterion(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Assignment Deadline</Label>
              <div className="mt-1">
                <DatePicker
                  selected={deadline}
                  onChange={(date) => setDeadline(date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="default"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Assignment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      { isTeacher ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="w-6 h-6 mr-3 text-orange-500" />
              Module Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!description ? (
              <p className="text-gray-500">No assignment available for this module.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Assignment Title</Label>
                  <p className="bg-gray-50 p-3 rounded border">
                    {title}
                  </p>
                </div>
                <div>
                  <Label>Assignment Description</Label>
                  <div
                    className="fr-view bg-white p-3 rounded border"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>

                {criteria.length > 0 && (
                  <div>
                    <Label>Submission Criteria</Label>
                    <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
                      <ul className="list-disc list-inside">
                        {criteria.map((criterion, index) => (
                          <li key={index}>{criterion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Assignment Deadline</Label>
                  <p className="bg-gray-50 p-3 rounded border">
                    {deadline?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>):
        <StudentAssignmentView assignmentData={assignmentData}/>
      }
        </>
  );
};

export default AssignmentSection;