"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import { useRouter } from 'next/navigation';

const QuizGeneratePage = ({ moduleId }) => {
  const router = useRouter();
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: { a: '', b: '', c: '', d: '' },
      correctAnswer: ''
    }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions, 
      {
        question: '',
        options: { a: '', b: '', c: '', d: '' },
        correctAnswer: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionKey, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionKey] = value;
    setQuestions(updatedQuestions);
  };

  const handleSaveQuiz = async () => {
    // Validate quiz
    const isValid = questions.every(q => 
      q.question.trim() !== '' && 
      Object.values(q.options).every(opt => opt.trim() !== '') &&
      q.correctAnswer
    );

    if (!isValid) {
      alert('Please fill in all question details');
      return;
    }

    try {
      // TODO: Replace with actual API call to save quiz
      // const response = await saveQuizToAPI(moduleId, { questions });
      
      // Simulated save
      console.log('Quiz saved:', { moduleId, questions });
      
      // Redirect to module page or quiz page
      router.push(`/module/${moduleId}`);
    } catch (error) {
      console.error('Failed to save quiz', error);
      alert('Failed to save quiz');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generate Quiz for Module</span>
            <Button 
              variant="primary" 
              onClick={addQuestion}
            >
              <Plus className="mr-2 w-4 h-4" /> Add Question
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.map((question, questionIndex) => (
            <div 
              key={questionIndex} 
              className="border p-4 rounded-lg space-y-3 mb-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Question {questionIndex + 1}</h3>
                {questions.length > 1 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <Trash2 className="mr-2 w-4 h-4" /> Remove
                  </Button>
                )}
              </div>

              <div>
                <Label>Question Text</Label>
                <TextArea 
                  placeholder="Enter question text"
                  value={question.question}
                  onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                />
              </div>

              {Object.entries(question.options).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder={`Option ${key.toUpperCase()}`}
                    value={value}
                    onChange={(e) => updateOption(questionIndex, key, e.target.value)}
                  />
                  <input 
                    type="radio" 
                    name={`correct-${questionIndex}`}
                    checked={question.correctAnswer === key}
                    onChange={() => updateQuestion(questionIndex, 'correctAnswer', key)}
                  />
                  <Label>Correct Answer</Label>
                </div>
              ))}
            </div>
          ))}

          <div className="flex space-x-4 mt-6">
            <Button 
              variant="outline"
              onClick={() => router.push(`/module/${moduleId}`)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveQuiz}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Save className="mr-2 w-4 h-4" /> Save Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizGeneratePage;