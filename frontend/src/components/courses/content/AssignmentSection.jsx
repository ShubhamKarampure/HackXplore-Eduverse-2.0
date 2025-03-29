import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import Label from '../../form/Label';
import TextArea from '../../form/input/TextArea';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles

const AssignmentSection = ({ 
  isTeacher = false, 
  assignmentData = null, 
  onAssignmentUpdate,
  isEditMode
}) => {
  
  // State management for assignment details
  const [description, setDescription] = useState(assignmentData?.description || '');
  const [criteria, setCriteria] = useState(assignmentData?.criteria || []);
  const [newCriterion, setNewCriterion] = useState('');
  const [deadline, setDeadline] = useState(
    assignmentData?.deadline ? new Date(assignmentData.deadline) : new Date()
  );

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
              <Label>Assignment Description</Label>
              <TextArea 
                placeholder="Enter assignment details" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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

            <div>
              <Label>Assignment Deadline</Label>
              <DatePicker 
                selected={deadline}
                onChange={(date) => setDeadline(date)}
                dateFormat="yyyy-MM-dd" // Set the date format
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardList className="w-6 h-6 mr-3 text-orange-500" />
          Module Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!description? ( <p className="text-gray-500">No assignment available for this module.</p>
          ):(
        <div className="space-y-4">
          <div>
            <Label>Assignment Description</Label>
            <p className="bg-gray-50 p-3 rounded border">
              {description || 'No description provided'}
            </p>
          </div>

          {criteria.length > 0 && (
            <div>
              <Label>Submission Criteria</Label>
              <ul className="list-disc list-inside bg-gray-50 p-3 rounded border">
                {criteria.map((criterion, index) => (
                  <li key={index}>{criterion}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <Label>Assignment Deadline</Label>
            <p className="bg-gray-50 p-3 rounded border">
              {deadline?.toLocaleDateString()}
            </p>
          </div>

          {!isTeacher && <div className="flex justify-end">
            <Button variant="default">
              Submit Assignment
            </Button>
          </div>}
        </div>)}
      </CardContent>
    </Card>
  );
};

export default AssignmentSection;