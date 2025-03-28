import React, { useState } from 'react';
import { 
  FileText, 
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import Label from '../../form/Label';
import TextArea from '../../form/input/TextArea';


const QuizEditSection = ({ 
  quizData, 
  onQuizUpdate 
}) => {
  const [questions, setQuestions] = useState(
    quizData?.questions || []
  );

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

  const handleSave = () => {
    onQuizUpdate({ questions });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-6 h-6 mr-3 text-purple-500" />
          Module Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={addQuestion}
          >
            <Plus className="mr-2 w-4 h-4" /> Add Quiz Question
          </Button>

          {questions.map((question, questionIndex) => (
            <div 
              key={questionIndex} 
              className="border p-4 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Question {questionIndex + 1}</h3>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeQuestion(questionIndex)}
                >
                  <Trash2 className="mr-2 w-4 h-4" /> Remove
                </Button>
              </div>

              <div>
                <Label>Question</Label>
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
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizEditSection;