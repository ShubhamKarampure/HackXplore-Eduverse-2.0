import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";
import Button from "@/components/ui/button/Button";
import Label from "../../form/Label";
import { Loader2 } from "lucide-react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "../../ui/table";
import axiosInstance from "@/lib/axiosInstance";

const StudentAssignmentView = ({ assignmentData }) => {
    const [file, setFile] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [grades, setGrades] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState("not-submitted");

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        // Check if the student has already submitted this assignment
        const checkSubmissionStatus = async () => {
            if (!assignmentData?._id) return;
            
            try {
                const response = await axiosInstance.get(
                    `${BACKEND_URL}/assignments/status/${assignmentData._id}`,
                    { withCredentials: true }
                );
                
                if (response.data.success) {
                    if (response.data.hasSubmitted) {
                        setSubmissionStatus(response.data.isGraded ? "graded" : "submitted");
                        
                        // If graded, load the grades
                        if (response.data.isGraded && response.data.evaluation) {
                            setGrades({
                                criteria: response.data.evaluation.criteria_scores,
                                totalScore: response.data.evaluation.grade,
                                totalPossible: response.data.evaluation.max_grade,
                                feedback: response.data.evaluation.feedback,
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Error checking submission status:", err);
            }
        };
        
        checkSubmissionStatus();
    }, [assignmentData, BACKEND_URL]);

    if (!assignmentData?.description) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <p className="text-center text-gray-500">
                        No assignment available for this module.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { _id: assignmentId, title, description, deadline, totalPoints, criteria } = assignmentData;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
        } else {
            setError("Please upload a PDF file");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) {
            setSubmitted(true);
        } else {
            setError("Please select a PDF file to submit");
        }
    };

    const handleConfirmSubmission = async () => {
        setConfirmed(true);
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("submissionFile", file);
            formData.append("assignmentId", assignmentData._id);

            const submitResponse = await axiosInstance.post(
                `${BACKEND_URL}/assignments/student/submit`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            if (submitResponse.data.success) {
                setSubmissionStatus("submitted");
            }
        } catch (err) {
            console.error("Error submitting assignment:", err);
            setError(err.response?.data?.message || "Failed to submit assignment. Please try again.");
            setConfirmed(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckGrade = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const gradeResponse = await axiosInstance.post(
                `${BACKEND_URL}/assignments/grade/${assignmentId}`,
                {},
                {
                    withCredentials: true,
                }
            );

            if (gradeResponse.data.success) {
                const evaluation = gradeResponse.data.evaluation;
                
                setGrades({
                    criteria: evaluation.criteria_scores,
                    totalScore: evaluation.grade,
                    totalPossible: evaluation.max_grade,
                    feedback: evaluation.feedback,
                });
                
                setSubmissionStatus("graded");
            }
        } catch (err) {
            console.error("Error fetching grades:", err);
            setError(err.response?.data?.message || "Failed to fetch grades. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderSubmissionForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <Label htmlFor="assignment-file" className="block mb-2">
                    Upload Assignment (PDF only)
                </Label>
                <input
                    type="file"
                    id="assignment-file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <Button
                type="submit"
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                disabled={!file}
            >
                Submit Assignment
            </Button>
        </form>
    );

    const renderConfirmation = () => (
        <div className="text-center py-4">
            <p className="mb-4">
                You've uploaded: <span className="font-semibold">{file?.name}</span>
            </p>
            <p className="mb-6">
                Are you sure you want to submit this assignment? You won't be able to
                make changes after confirmation.
            </p>
            <div className="flex justify-center space-x-4">
                <Button
                    onClick={() => setSubmitted(false)}
                    className="bg-gray-500 hover:bg-gray-600"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirmSubmission}
                    className="bg-green-600 hover:bg-green-700"
                >
                    Confirm Submission
                </Button>
            </div>
        </div>
    );

    const renderLoadingAnimation = () => (
        <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium">Processing your request...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
    );

    const renderError = () => (
        <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <Button
                onClick={() => {
                    setConfirmed(false);
                    setSubmitted(false);
                    setError(null);
                }}
                className="bg-blue-600 hover:bg-blue-700"
            >
                Try Again
            </Button>
        </div>
    );

    const renderGradingResults = () => (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">Assignment Results</h3>
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
                            <TableCell>{criterion.criterion}</TableCell>
                            <TableCell className="font-medium">{criterion.score}</TableCell>
                            <TableCell>{criterion.max_score}</TableCell>
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
    
    const renderSubmissionStatus = () => (
        <div className="text-center py-4">
            <p className="mb-4 text-green-600 font-semibold">
                Your assignment has been submitted successfully!
            </p>
            <Button
                onClick={handleCheckGrade}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Grading...
                    </>
                ) : (
                    "Check Grade"
                )}
            </Button>
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
                                <li key={index}>
                                    {typeof criterion === 'object' ? criterion.name : criterion}
                                    {typeof criterion === 'object' && ` (Max: ${criterion.maxScore} points)`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-1">Assignment Deadline</h3>
                    <p className="font-medium">
                        {deadline
                            ? new Date(deadline).toLocaleDateString()
                            : "No deadline provided"}
                    </p>
                    {totalPoints && (
                        <p className="mt-2">
                            Total Points: <span className="font-medium">{totalPoints}</span>
                        </p>
                    )}
                </div>

                {submissionStatus === "not-submitted" && !submitted && !confirmed && renderSubmissionForm()}
                {submissionStatus === "not-submitted" && submitted && !confirmed && renderConfirmation()}
                {isLoading && renderLoadingAnimation()}
                {error && renderError()}
                {submissionStatus === "submitted" && !isLoading && !grades && renderSubmissionStatus()}
                {(submissionStatus === "graded" || grades) && !isLoading && renderGradingResults()}
            </CardContent>
        </Card>
    );
};

export default StudentAssignmentView;