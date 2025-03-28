"use client";

import React, { useState } from 'react';
import { 
  Video, 
  FileDown, 
  ClipboardList, 
  FileText, 
  Clock 
} from 'lucide-react';
import Button from '../ui/button/Button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ModuleContent = ({ selectedModule }) => {
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});

  if (!selectedModule)
    return (
      <div className="flex-grow flex items-center justify-center text-gray-500">
        Select a module to view its contents
      </div>
    );

  const renderVideo = () => {
    const videoUrl = selectedModule?.contents?.video?.url;
    const videoTitle = selectedModule?.contents?.video?.title;
    const videoDuration = selectedModule?.contents?.video?.duration ?? 0;

    if (!videoUrl) return null;

    const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Video className="w-6 h-6 mr-3 text-blue-500" />
          {videoTitle}
        </h2>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          {isYouTubeUrl ? (
            <iframe
              width="100%"
              height="480"
              src={
                videoUrl
                  .replace('watch?v=', 'embed/')
                  .replace('youtu.be/', 'youtube.com/embed/')
                  .split('&')[0]
              }
              title={videoTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video 
              controls 
              className="w-full"
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}
          <div className="p-4 flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="w-5 h-5 mr-2" />
            <span>
              Duration: {Math.floor(videoDuration / 60)} minutes
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleQuizAnswerChange = (questionIndex, selectedOption) => {
    setSelectedQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const handleQuizSubmit = () => {
    console.log('Selected Answers:', selectedQuizAnswers);
  };

  return (
    <div className="flex-grow p-6 max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {selectedModule.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {selectedModule.description}
        </p>
      </div>

      {/* Video Section */}
      {renderVideo()}

      {/* Resources Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileDown className="w-6 h-6 mr-3 text-green-500" />
            Course Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedModule?.contents?.resource ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">{selectedModule.contents.resource.title}</span>
                <Button 
                  variant="outline"
                  onClick={() => window.open(selectedModule.contents.resource.url, '_blank')}
                >
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No resources available for this module.</p>
          )}
        </CardContent>
      </Card>

      {/* Assignment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="w-6 h-6 mr-3 text-orange-500" />
            Module Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedModule?.contents?.assignment ? (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {selectedModule.contents.assignment.description}
              </p>
              <div>
                <h4 className="font-semibold mb-2">Submission Criteria:</h4>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
                  {selectedModule.contents.assignment.criteria?.map((criterion, index) => (
                    <li key={index}>{criterion}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-600">
                  Deadline: {new Date(selectedModule.contents.assignment.deadline).toLocaleDateString()}
                </span>
                <Button>Submit Assignment</Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No assignment available for this module.</p>
          )}
        </CardContent>
      </Card>

      {/* Quiz Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-6 h-6 mr-3 text-purple-500" />
            Module Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedModule?.contents?.quiz ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  Start Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{selectedModule.title} Quiz</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedModule.contents.quiz.questions?.map((question, index) => (
                    <div key={index} className="border-b pb-4">
                      <p className="font-medium mb-2">{question.question}</p>
                      <div className="space-y-2">
                        {Object.entries(question.options ?? {}).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <input 
                              type="radio" 
                              name={`question-${index}`} 
                              id={`${index}-${key}`} 
                              className="mr-2" 
                              checked={selectedQuizAnswers[index] === key}
                              onChange={() => handleQuizAnswerChange(index, key)}
                            />
                            <label htmlFor={`${index}-${key}`}>{value}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button 
                    className="w-full mt-4"
                    onClick={handleQuizSubmit}
                  >
                    Submit Quiz
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="text-gray-500">No quiz available for this module.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleContent;