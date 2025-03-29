"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, XCircle, ArrowRight, ArrowLeft, AlertTriangle, Check, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Button from "@/components/ui/button/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAlert } from "@/context/AlertContext"
import { getQuizByModuleId } from "@/api/quizApi"
import { useParams, useRouter, useSearchParams } from "next/navigation"

const QuizViewPage = () => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId")
  const moduleId = params?.moduleId

  const [quiz, setQuiz] = useState(null)
  const { showAlert, alertTypes } = useAlert()
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
        const data = await getQuizByModuleId(moduleId)
        setQuiz(data)
      } catch (error) {
        showAlert("Failed to load quiz. Please try again.", alertTypes.ERROR)
        console.error("Quiz fetch error:", error)
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

          showAlert(`You switched tabs or minimized the window. Warning ${newWarningCount}/3`, alertTypes.ERROR)

          if (newWarningCount >= 3) {
            failQuiz()
          }
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)

      return () => {
        // Cleanup
        document.removeEventListener("visibilitychange", handleVisibilityChange)
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
    showAlert("Quiz completed successfully.", alertTypes.SUCCESS)

    calculateResults()
  }

  const calculateResults = () => {
    const totalQuestions = quiz.questions.length
    const correctAnswers = quiz.questions.filter((q) => selectedAnswers[q._id] === q.answer[0]).length

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
    const isSelected = selectedAnswers[questionId] === key

    return (
      <Button
        key={key}
        variant={isSelected ? "default" : "outline"}
        className={`
        w-full justify-start text-left h-auto py-2 px-4 relative rounded-lg
        ${isSelected
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-500 dark:border-indigo-400"
            : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          }
        hover:border-blue-400 dark:hover:border-indigo-400
        transition-all duration-200 ease-in-out
        group mb-2
      `}
        onClick={() => handleAnswerSelect(questionId, key)}
      >
        <span className="flex items-center w-full">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium mr-2 text-sm">
            {key.toUpperCase()}
          </span>
          <span className="flex-grow text-sm dark:text-slate-300">{value}</span>
          {isSelected && (
            <Check
              className="
              w-4 h-4 
              text-blue-500 
              dark:text-indigo-400 
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
    )
  }

  const handleBackToCourses = () => {
    router.push(`/my-courses/${courseId}?moduleId=${moduleId}`)
  }

  if (!quiz) {
    return (
      <div className="w-full max-w-4xl mx-auto p-3 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (quizStatus === "failed") {
    return (
      <div className="w-full max-w-4xl mx-auto p-3 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="p-3 border-b bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">Quiz Failed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-center">
            <div className="mb-3">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">Quiz Terminated</h2>
              <p className="text-sm mb-2 text-slate-600 dark:text-slate-300">
                Your quiz has been terminated due to multiple violations of the quiz rules.
              </p>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50 mb-3">
                <p className="text-sm text-red-600 dark:text-red-300">
                  You received 3 or more warnings for switching tabs or exiting full-screen mode.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t bg-slate-50 dark:bg-slate-900 flex justify-center">
            <Button
              variant="default"
              onClick={handleBackToCourses}
              className="px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Back to Course
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (quizStatus === "completed") {
    const results = calculateResults()
    const isPass = results.percentage >= 70

    return (
      <div className="w-full max-w-4xl mx-auto p-3 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader
            className={`p-3 border-b ${isPass ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20"
              }`}
          >
            <CardTitle
              className={`text-xl font-bold ${isPass ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                }`}
            >
              Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-center">
            <div className="mb-3">
              <div
                className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${isPass ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"
                  }`}
              >
                {isPass ? (
                  <Check className="w-10 h-10 text-green-500 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-amber-500 dark:text-amber-400" />
                )}
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">
                {isPass ? "Congratulations! 🎉" : "Keep Practicing 📚"}
              </h2>
              <p className="text-base mb-3 text-slate-600 dark:text-slate-300">
                You scored {results.correctAnswers} out of {results.totalQuestions} ({results.percentage}%)
              </p>

              <div className="mb-3">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isPass
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gradient-to-r from-amber-400 to-amber-500"
                      }`}
                    style={{ width: `${results.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border mb-3 ${isPass
                    ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50"
                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50"
                  }`}
              >
                <p
                  className={`text-sm ${isPass ? "text-green-600 dark:text-green-300" : "text-amber-600 dark:text-amber-300"
                    }`}
                >
                  {isPass
                    ? "You've successfully passed this quiz! You can now proceed to the next module."
                    : "You need to score at least 70% to pass this quiz. Try again after reviewing the material."}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t bg-slate-50 dark:bg-slate-900 flex justify-center">
            <Button
              variant="default"
              onClick={handleBackToCourses}
              className="px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Back to Course
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (quizStatus === "not-started") {
    return (
      <div className="w-full max-w-4xl mx-auto p-3 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="p-3 border-b bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {quiz.module.title} Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-3 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Play className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>

              <h2 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100">Ready to Begin</h2>

              <p className="text-base mb-3 text-slate-600 dark:text-slate-300">
                This quiz consists of {quiz.questions.length} questions. You have {formatTime(quiz.duration * 60)} to
                complete it.
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
                <h3 className="flex items-center text-amber-800 dark:text-amber-300 font-medium mb-2 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Important Quiz Rules
                </h3>
                <ul className="list-disc pl-4 text-amber-700 dark:text-amber-200 text-sm space-y-1">
                  <li>Do not switch to other tabs or applications</li>
                  <li>After 3 warnings, your quiz will be automatically terminated</li>
                  <li>Answer all questions to the best of your ability</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t bg-slate-50 dark:bg-slate-900 flex justify-center">
            <Button
              variant="default"
              onClick={startQuiz}
              className="px-6 py-2 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Play className="mr-1 h-4 w-4" /> Start Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
     <div className="w-full max-w-4xl mx-auto p-6 ">
     <Card className="w-full shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
             <CardHeader className="p-3 border-b bg-slate-50 dark:bg-slate-900 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {quiz.module.title} Quiz
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-1" />
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatTime(timeRemaining)}</span>
          </div>
        </CardHeader>

        <div className="p-2 border-b bg-slate-50 dark:bg-slate-900">
          <div className="relative">
            <div className="flex mb-1 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-0.5 px-1.5 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                  {Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-1.5 mb-0.5 text-xs flex rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-600"
              ></div>
            </div>
          </div>
        </div>

        <CardContent className="p-3">
          <div className="mb-3">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
              <h2 className="text-base font-semibold mb-1 text-slate-800 dark:text-slate-100">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-0.5">
              {Object.entries(currentQuestion.options).map(([key, value]) =>
                renderAnswerButton(key, value, currentQuestion._id),
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-3 border-t bg-slate-50 dark:bg-slate-900 flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigateQuestion("prev")}
            disabled={currentQuestionIndex === 0}
            className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm py-1 px-2"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Previous
          </Button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              variant="default"
              onClick={handleQuizSubmit}
              disabled={!selectedAnswers[currentQuestion._id]}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm py-1 px-3"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => navigateQuestion("next")}
              disabled={!selectedAnswers[currentQuestion._id]}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm py-1 px-3"
            >
              Next <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showFailDialog} onOpenChange={setShowFailDialog}>
        <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-400">Quiz Failed</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col items-center py-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                  <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <p className="text-center mb-2 text-slate-800 dark:text-slate-200 text-sm">
                  Your quiz has been terminated due to multiple violations of the quiz rules.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
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

