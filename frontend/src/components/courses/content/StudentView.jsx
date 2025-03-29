import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../ui/card';
import Button from '@/components/ui/button/Button';
import Label from '../../form/Label';
import { Loader2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../ui/table';

const StudentAssignmentView = ({ assignmentData }) => {
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [grades, setGrades] = useState(null);

  if (!assignmentData?.description) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No assignment available for this module.</p>
        </CardContent>
      </Card>
    );
  }

  const { title, description, criteria, deadline, totalPoints } = assignmentData;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      setSubmitted(true);
    } else {
      alert('Please select a PDF file to submit');
    }
  };

  const handleConfirmSubmission = () => {
    setConfirmed(true);
    setIsGrading(true);
    
    // Mock AI grading process with a timeout
    setTimeout(() => {
      setIsGrading(false);
      // Mock grades data
      setGrades({
        criteria: [
          { name: 'Understanding of concepts', score: 18, outOf: 20 },
          { name: 'Critical analysis', score: 16, outOf: 20 },
          { name: 'Structure and organization', score: 15, outOf: 15 },
          { name: 'Quality of writing', score: 13, outOf: 15 },
          { name: 'References and citations', score: 8, outOf: 10 }
        ],
        totalScore: 70,
        totalPossible: 80,
        feedback: "Good work overall. Your understanding of the core concepts is strong, but there's room for improvement in critical analysis."
      });
    }, 3000); // 3 seconds for the mock grading process
  };

  const renderSubmissionForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label htmlFor="assignment-file" className="block mb-2">Upload Assignment (PDF only)</Label>
        <input
          type="file"
          id="assignment-file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
      >
        Submit Assignment
      </Button>
    </form>
  );

  const renderConfirmation = () => (
    <div className="text-center py-4">
      <p className="mb-4">You've uploaded: <span className="font-semibold">{file?.name}</span></p>
      <p className="mb-6">Are you sure you want to submit this assignment? You won't be able to make changes after confirmation.</p>
      <Button 
        onClick={handleConfirmSubmission}
        className="bg-green-600 hover:bg-green-700"
      >
        Confirm Submission
      </Button>
    </div>
  );

  const renderGradingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <p className="text-lg font-medium">AI is grading your assignment...</p>
      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
    </div>
  );

  const renderGradingResults = () => (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Assignment Grades</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Criteria</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Out Of</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.criteria.map((criterion, index) => (
            <TableRow key={index}>
              <TableCell>{criterion.name}</TableCell>
              <TableCell className="font-medium">{criterion.score}</TableCell>
              <TableCell>{criterion.outOf}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-gray-50">
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="font-bold">{grades.totalScore}</TableCell>
            <TableCell>{grades.totalPossible}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-semibold mb-2">Feedback:</h4>
        <p>{grades.feedback}</p>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Module Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Assignment Title</h3>
          <p>{title}</p>
        </div>
        
        <div className="mb-4">
        <div
                    className="fr-view bg-white p-3 rounded border"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
        </div>
        
        {criteria?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Submission Criteria</h3>
            <ul className="list-disc pl-5">
              {criteria.map((criterion, index) => (
                <li key={index}>{criterion}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1">Assignment Deadline</h3>
          <p className="font-medium">
            {deadline ? new Date(deadline).toLocaleDateString() : 'No deadline provided'}
          </p>
        </div>
        
        {!submitted && renderSubmissionForm()}
        {submitted && !confirmed && renderConfirmation()}
        {confirmed && isGrading && renderGradingAnimation()}
        {confirmed && !isGrading && grades && renderGradingResults()}
      </CardContent>
    </Card>
  );
};

export default StudentAssignmentView;