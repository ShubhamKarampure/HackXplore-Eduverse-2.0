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
import { useAlert } from '@/context/AlertContext';
import 'react-datepicker/dist/react-datepicker.css';
// Import Froala Editor
import FroalaEditor from 'react-froala-wysiwyg';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import StudentAssignmentView from './StudentView';
import axiosInstance from '@/lib/axiosInstance';

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
  const [criteria, setCriteria] = useState(
    assignmentData?.criteria || []
  );
  const [newCriterionName, setNewCriterionName] = useState('');
  const [newCriterionMaxScore, setNewCriterionMaxScore] = useState(10);
  const [totalPoints, setTotalPoints] = useState(
    assignmentData?.totalPoints || 100
  );
  const [deadline, setDeadline] = useState(
    assignmentData?.deadline ? new Date(assignmentData.deadline) : new Date()
  );

  // Update state when assignmentData changes
  useEffect(() => {
    if (assignmentData) {
      setTitle(assignmentData.title || '');
      setDescription(assignmentData.description || '');
      setCriteria(assignmentData.criteria || []);
      setTotalPoints(assignmentData.totalPoints || 100);
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
    if (newCriterionName.trim()) {
      const newCriteria = {
        name: newCriterionName.trim(),
        maxScore: parseInt(newCriterionMaxScore) || 10,
      };
      setCriteria([...criteria, newCriteria]);
      setNewCriterionName('');
      setNewCriterionMaxScore(10);
    }
  };

  const removeCriterion = (index) => {
    const updatedCriteria = [...criteria];
    updatedCriteria.splice(index, 1);
    setCriteria(updatedCriteria);
  };

  // Calculate total max score from all criteria
  const calculateTotalCriteriaScore = () => {
    return criteria.reduce((total, criterion) => total + criterion.maxScore, 0);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      showAlert('Assignment title is required', alertTypes.ERROR);
      return;
    }

    if (!description.trim()) {
      showAlert('Assignment description is required', alertTypes.ERROR);
      return;
    }

    if (criteria.length === 0) {
      showAlert('At least one criterion is required', alertTypes.ERROR);
      return;
    }

    setIsLoading(true);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const assignmentPayload = {
        title,
        description,
        criteria,
        totalPoints,
        deadline,
      };

      let updatedAssignment;

      // Update existing assignment or create new one
      if (assignmentData?._id) {
        const response = await axiosInstance.put(
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
          title,
          description,
          criteria,
          totalPoints,
          deadline,
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
              <div className="flex justify-between items-center mb-2">
                <Label>Total Assignment Points</Label>
                <Input
                  type="number"
                  className="w-24 text-right"
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(parseInt(e.target.value) || 100)}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label>Grading Criteria</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  type="text"
                  placeholder="Criterion name"
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCriterion()}
                  className="flex-grow"
                />
                <div className="flex items-center w-40">
                  <span className="mr-2">Max Score:</span>
                  <Input
                    type="number"
                    value={newCriterionMaxScore}
                    onChange={(e) => setNewCriterionMaxScore(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-20"
                  />
                </div>
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
                    <span className="flex-grow">{criterion.name}</span>
                    <span className="mx-4 text-gray-600">{criterion.maxScore} points</span>
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

              {criteria.length > 0 && (
                <div className="mt-2 text-right text-sm">
                  Total criteria points: <span className={calculateTotalCriteriaScore() > totalPoints ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                    {calculateTotalCriteriaScore()} / {totalPoints}
                  </span>
                  {calculateTotalCriteriaScore() > totalPoints && (
                    <p className="text-red-500 text-xs mt-1">
                      Warning: Criteria total exceeds assignment total points
                    </p>
                  )}
                </div>
              )}
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

  // View-only mode for teachers
  return (
    <>
      {isTeacher ? (
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

                <div>
                  <Label>Total Points</Label>
                  <p className="bg-gray-50 p-3 rounded border">
                    {totalPoints}
                  </p>
                </div>

                {criteria.length > 0 && (
                  <div>
                    <Label>Grading Criteria</Label>
                    <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left">Criterion</th>
                            <th className="text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {criteria.map((criterion, index) => (
                            <tr key={index}>
                              <td className="text-left">{criterion.name}</td>
                              <td className="text-right">{criterion.maxScore}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
        </Card>
      ) : (
        <StudentAssignmentView assignmentData={assignmentData} />
      )}
    </>
  );
};

export default AssignmentSection;