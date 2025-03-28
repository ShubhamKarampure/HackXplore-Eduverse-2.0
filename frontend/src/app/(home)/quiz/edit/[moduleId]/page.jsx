"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Sparkles, Save, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TextArea from "@/components/form/input/TextArea"
import Button from "@/components/ui/button/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useAlert } from "@/context/AlertContext"
import { createQuiz, getModules } from "@/api/quizApi"
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getQuizByModuleId } from "@/api/quizApi"

const QuizCreationPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId')
  const moduleId = params?.moduleId;
  
  const [quizDuration, setQuizDuration] = useState(30)
  const [questions, setQuestions] = useState([])
  const [showAIModal, setShowAIModal] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const { showAlert, alertTypes } = useAlert()

  useEffect(() => {
      // Fetch quiz data
      const fetchQuiz = async () => {
        try {
          const data = await getQuizByModuleId(moduleId);
         console.log(data)
        } catch (error) {
          showAlert(
            "Failed to load quiz. Please try again.", 
            alertTypes.ERROR
          );
          console.error("Quiz fetch error:", error);
        }
      }
      
      if (moduleId) {
        fetchQuiz()
      }
  }, [moduleId])
  
  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: { a: "", b: "", c: "", d: "" },
      answer: [],
      difficulty: 1
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuestions(updatedQuestions)
  }

  const updateQuestionOption = (questionIndex, optionKey, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionKey] = value
    setQuestions(updatedQuestions)
  }

  const toggleAnswer = (questionIndex, optionKey) => {
    const updatedQuestions = [...questions]
    const currentAnswers = updatedQuestions[questionIndex].answer
    const newAnswers = currentAnswers.includes(optionKey)
      ? currentAnswers.filter(ans => ans !== optionKey)
      : [...currentAnswers, optionKey]
    
    updatedQuestions[questionIndex].answer = newAnswers
    setQuestions(updatedQuestions)
  }

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    setQuestions(updatedQuestions)
  }

  const handleSubmitQuiz = async () => {

    if (questions.length === 0) {
      showAlert("Please add at least one question", alertTypes.ERROR)
      return
    }

    try {
      const quizData = {
        module: selectedModule,
        questions,
        duration: quizDuration,
        totalMarks: questions.length
      }

      await createQuiz(moduleId,quizData)
      showAlert("Quiz created successfully!", alertTypes.SUCCESS)
      // Reset form or navigate
      setQuestions([])
      setSelectedModule(null)
      setQuizDuration(30)
    } catch (error) {
      showAlert("Failed to create quiz", alertTypes.ERROR)
    }
  }

  const openAIGenerationModal = () => {
    setShowAIModal(true)
  }

  return (
    <div className="w-4xl mx-auto p-6 ">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="dark:text-white">Create Quiz</CardTitle>
            <Button 
              variant="outline" 
              
              className="flex items-center"
            >
              <Sparkles className="mr-2 h-4 w-4" /> AI Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           
            <div>
              <Label>Quiz Duration (minutes)</Label>
              <Input 
                type="number" 
                value={quizDuration} 
                onChange={(e) => setQuizDuration(Number(e.target.value))}
                min={10} 
                max={120}
              />
            </div>
          </div>

          {questions.map((question, index) => (
            <Card key={index} className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <TextArea 
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="Enter question text"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['a', 'b', 'c', 'd'].map(optionKey => (
                      <div key={optionKey}>
                        <Label>Option {optionKey.toUpperCase()}</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            value={question.options[optionKey]}
                            onChange={(e) => updateQuestionOption(index, optionKey, e.target.value)}
                            placeholder={`Option ${optionKey.toUpperCase()}`}
                          />
                          <input 
                            type="checkbox" 
                            checked={question.answer.includes(optionKey)}
                            onChange={() => toggleAnswer(index, optionKey)}
                            className="h-5 w-5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select 
                      value={question.difficulty.toString()} 
                      onValueChange={(value) => updateQuestion(index, 'difficulty', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Easy</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={addQuestion}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
            <Button 
              variant="default" 
              onClick={handleSubmitQuiz}
              disabled={questions.length === 0}
              className="flex items-center"
            >
              <Save className="mr-2 h-4 w-4" /> Save Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Generation Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" /> 
              AI Quiz Generator
            </DialogTitle>
            <DialogDescription>
              Select the parameters for AI-generated quiz
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Number of Questions</Label>
              <Input 
                type="number" 
                defaultValue={5} 
                min={3} 
                max={20}
              />
            </div>
            <div>
              <Label>Difficulty Level</Label>
              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Easy</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAIModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
             
            >
              Generate Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizCreationPage