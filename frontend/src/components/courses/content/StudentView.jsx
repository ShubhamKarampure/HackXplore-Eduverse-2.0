import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import Label from '../../form/Label';

const StudentAssignmentView = ({ assignmentData }) => {
    if (!assignmentData?.description) {
        return (
            <Card>
                <CardContent>
                    <p className="text-gray-500">No assignment available for this module.</p>
                </CardContent>
            </Card>
        );
    }

    const { title, description, criteria, deadline } = assignmentData;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Module Assignment</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label>Assignment Title</Label>
                        <p className="bg-gray-50 p-3 rounded border">{title}</p>
                    </div>
                    <div>
                        <Label>Assignment Description</Label>
                        <div
                            className="fr-view bg-white p-3 rounded border"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </div>

                    {criteria?.length > 0 && (
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
                            {deadline ? new Date(deadline).toLocaleDateString() : 'No deadline provided'}
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Submit Assignment
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default StudentAssignmentView;