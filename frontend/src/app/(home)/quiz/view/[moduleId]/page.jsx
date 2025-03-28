"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, XCircle, ArrowRight, ArrowLeft, AlertTriangle, Maximize, Check, Play} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Button from "@/components/ui/button/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAlert } from "@/context/AlertContext"
import { getQuizByModuleId } from "@/api/quizApi"
import { useParams, useRouter, useSearchParams } from 'next/navigation';


const QuizViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
const courseId = searchParams.get('courseId')
  const moduleId = params?.moduleId;
  
  const [quiz, setQuiz] = useState(null)
  const { showAlert, alertTypes } = useAlert();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [quizStatus, setQuizStatus] = useState("not-started")
  
  const [warningCount, setWarningCount] = useState(0)
  const [showFailDialog, setShowFailDialog] = useState(false)
  
  const documentRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    // Fetch quiz data
    const fetchQuiz = async () => {
      try {
        const data = await getQuizByModuleId(moduleId);
        setQuiz(data);
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

  useEffect(() => {
    // Timer logic
    if (quiz && quizStatus === "in-progress") {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleQuizSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [quiz, quizStatus])

  useEffect(() => {
    if (quizStatus === "in-progress") {
      // Add visibility change listener
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          const newWarningCount = warningCount + 1
          setWarningCount(newWarningCount)
          
          showAlert(
            `You switched tabs or minimized the window. Warning ${newWarningCount}/3`, 
            alertTypes.ERROR
          )

          if (newWarningCount >= 3) {
            failQuiz()
          }
        }
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        // Cleanup
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [quizStatus, warningCount])

  const startQuiz = async () => {
    setQuizStatus("in-progress")
    setTimeRemaining(quiz.duration * 60) // Convert minutes to seconds
  }

  const failQuiz = () => {
    // Stop timers
    if (timerRef.current) clearInterval(timerRef.current)
    
    // Set quiz status
    setQuizStatus("failed")
    setShowFailDialog(true)

    
  }

  const handleAnswerSelect = (questionId, selectedOption) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }))
  }

  const handleQuizSubmit = () => {
    setQuizStatus("completed")
    showAlert(
          "Quiz completed successfully.", 
          alertTypes.SUCCESS
        );
    
    calculateResults()
  }

  const calculateResults = () => {
    const totalQuestions = quiz.questions.length
    const correctAnswers = quiz.questions.filter((q) => 
      selectedAnswers[q._id] === q.answer[0]
    ).length

    return {
      totalQuestions,
      correctAnswers,
      percentage: ((correctAnswers / totalQuestions) * 100).toFixed(2),
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const navigateQuestion = (direction) => {
    if (direction === "next" && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else if (direction === "prev" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const renderAnswerButton = (key, value, questionId) => {
    const isSelected = selectedAnswers[questionId] === key;
    
    return (
      <Button
        key={key}
        variant={isSelected ? "default" : "outline"}
        className={`
          w-full justify-start text-left h-auto py-3 relative
          ${isSelected 
            ? "bg-primary/10 dark:bg-primary/20 border-2 border-primary dark:border-primary-foreground" 
            : "border border-gray-300 dark:border-gray-600"}
          hover:border-primary dark:hover:border-primary-foreground
          transition-all duration-200 ease-in-out
          group
        `}
        onClick={() => handleAnswerSelect(questionId, key)}
      >
        <span className="flex items-center w-full">
          <span className="font-medium mr-2 dark:text-white">
            {key.toUpperCase()}.
          </span> 
          <span className="flex-grow dark:text-gray-300">
            {value}
          </span>
          {isSelected && (
            <Check 
              className="
                w-5 h-5 
                text-primary 
                dark:text-primary-foreground 
                absolute 
                right-3 
                top-1/2 
                -translate-y-1/2
                opacity-100 
                group-hover:scale-110 
                transition-all
              "
            />
          )}
        </span>
      </Button>
    );
  };

  const handleBackToCourses = () => {
    router.push(`/my-courses/${courseId}?moduleId=${moduleId}`);
  }

  if (!quiz) {
    return <div className="flex justify-center items-center h-screen">Loading quiz...</div>
  }

  if (quizStatus === "failed") {
    return (
      <div className="max-w-2xl mx-auto p-6 h-screen flex items-center justify-center">
        <Card className="w-full max-h-[600px] overflow-auto">
          <CardHeader>
            <CardTitle className="text-red-500 dark:text-red-400">Quiz Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <XCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Quiz Terminated</h2>
              <p className="text-lg mb-4 dark:text-gray-300">
                Your quiz has been terminated due to multiple violations of the quiz rules.
              </p>
              <p className="text-md text-muted-foreground dark:text-gray-400">
                You received 3 or more warnings for switching tabs or exiting full-screen mode.
              </p>
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="default" 
                  onClick={handleBackToCourses}
                  className="dark:bg-primary-foreground dark:text-primary"
                >
                  Back to Course
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizStatus === "completed") {
    const results = calculateResults()
    return (
      <div className="max-w-2xl mx-auto p-6 h-screen flex items-center justify-center">
        <Card className="w-full max-h-[600px] overflow-auto">
          <CardHeader>
            <CardTitle className="dark:text-white">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 dark:text-white">
                {results.percentage >= 70 ? "Congratulations! 🎉" : "Keep Practicing 📚"}
              </h2>
              <p className="text-lg dark:text-gray-300">
                You scored {results.correctAnswers} out of {results.totalQuestions}
              </p>
              <Progress 
                value={(results.correctAnswers / results.totalQuestions) * 100} 
                className="mt-4 dark:bg-gray-700" 
              />
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="default" 
                  onClick={handleBackToCourses}
                  className="dark:bg-primary-foreground dark:text-primary"
                >
                  Back to Course
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizStatus === "not-started") {
    return (
      <div className="max-w-2xl mx-auto p-6 h-screen flex items-center justify-center">
        <Card className="w-full max-h-[600px] overflow-auto">
          <CardHeader>
            <CardTitle className="dark:text-white">{quiz.module.title} Quiz</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <p className="text-lg mb-4 dark:text-gray-300">
                This quiz consists of {quiz.questions.length} questions. You have {formatTime(quiz.duration * 60)} to
                complete it.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md p-4 mb-6">
                <h3 className="flex items-center text-amber-800 dark:text-amber-300 font-medium mb-2">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Important Quiz Rules
                </h3>
                <ul className="list-disc pl-5 text-amber-700 dark:text-amber-200 text-sm space-y-1">
                  <li>Do not switch to other tabs or applications</li>
                  <li>After 3 warnings, your quiz will be automatically terminated</li>
                </ul>
              </div>
              <Button variant="default" onClick={startQuiz} className="w-full">
                <Play className="mr-2 h-4 w-4" /> Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="w-4xl mx-auto p-6 h-screen flex items-center justify-center">
      <Card className="w-full overflow-y-auto">
        <CardHeader className="flex flex-row justify-between items-center border-b p-5 dark:border-gray-700">
          <CardTitle className="dark:text-white">{quiz.module.title} Quiz</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-500 dark:text-white-400" />
              <span className="font-bold text-blue-500 dark:text-white-400">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} 
            className="mb-4 dark:bg-gray-700" 
          />

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </h2>
            <p className="text-lg mb-4 dark:text-gray-300">{currentQuestion.question}</p>

            <div className="space-y-3">
              <div className="space-y-3">
                {Object.entries(currentQuestion.options).map(([key, value]) => 
                  renderAnswerButton(key, value, currentQuestion._id)
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigateQuestion("prev")} 
              disabled={currentQuestionIndex === 0}
              className="dark:text-white dark:hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2" /> Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button 
                variant="default" 
                onClick={handleQuizSubmit} 
                disabled={!selectedAnswers[currentQuestion._id]}
                className="dark:bg-primary-foreground dark:text-primary"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => navigateQuestion("next")}
                disabled={!selectedAnswers[currentQuestion._id]}
                className="dark:bg-primary-foreground dark:text-primary"
              >
                Next <ArrowRight className="ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFailDialog} onOpenChange={setShowFailDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-red-500 dark:text-red-400">Quiz Failed</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col items-center py-4">
                <XCircle className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" />
                <p className="text-center mb-2 dark:text-white">
                  Your quiz has been terminated due to multiple violations of the quiz rules.
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400 text-center">
                  You received 3 warnings for switching tabs or exiting full-screen mode.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizViewPage