"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Button from "../ui/button/Button"
import { Sparkles, X } from "lucide-react"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import TextArea from "@/components/form/input/TextArea"

const AIQuizGenerationCard = ({ isOpen, onClose, onGenerate, isGenerating, course_id }) => {
  const [description, setDescription] = useState("")

  const [totalQuestions, setTotalQuestions] = useState(10)
  const [questionLevels, setQuestionLevels] = useState({
    beginner: 3,
    intermediate: 5,
    advanced: 2,
  })
  const [duration, setDuration] = useState(30)

  const handleGenerate = () => {
    onGenerate({
      description,
      totalQuestions,
      questionLevels,
      duration,
      course_id,
    })
  }

  const updateQuestionLevels = (level, value) => {
    const newLevels = { ...questionLevels, [level]: Number.parseInt(value, 10) || 0 }

    // Ensure total questions match
    const currentTotal = Object.values(newLevels).reduce((a, b) => a + b, 0)
    if (currentTotal > totalQuestions) {
      // Adjust other levels proportionally
      const diffToReduce = currentTotal - totalQuestions
      Object.keys(newLevels).forEach((key) => {
        if (key !== level && newLevels[key] > 0) {
          newLevels[key] = Math.max(0, newLevels[key] - Math.floor(diffToReduce / 2))
        }
      })
    }

    setQuestionLevels(newLevels)
  }

  if (!isOpen) {
    return null
  }

  return (
      <Card className="w-full shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="p-6 border-b bg-slate-50 dark:bg-slate-900">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-2xl font-bold text-slate-800 dark:text-slate-100">
              <Sparkles className="mr-3 h-6 w-6 text-indigo-500" /> AI Quiz Generator
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
              disabled={isGenerating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="mt-2 text-slate-600 dark:text-slate-400 text-base">
            Configure your AI-generated quiz by providing a description, number of questions, and difficulty levels.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quiz Description</Label>
            <TextArea
              placeholder="Enter quiz description (e.g., A quiz on JavaScript Basics covering variables, functions, and objects)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-3 min-h-[120px] text-base"
            />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Provide a detailed description for better AI-generated questions
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Quiz Configuration</h3>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Questions</Label>
                <Input
                  type="number"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Number.parseInt(e.target.value, 10) || 0)}
                  min={5}
                  max={20}
                  step={1}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-3 text-base"
                />
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex items-center">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (totalQuestions / 20) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 whitespace-nowrap">{totalQuestions} questions</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Question Level Distribution
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "beginner", color: "bg-green-500" },
                    { key: "intermediate", color: "bg-yellow-500" },
                    { key: "advanced", color: "bg-red-500" },
                  ].map(({ key, color }) => (
                    <div key={key} className="p-4 rounded-lg border border-slate-300 dark:border-slate-700">
                      <Label className="block mb-2 capitalize text-slate-700 dark:text-slate-300">
                        {key} Questions
                      </Label>
                      <Input
                        type="number"
                        value={questionLevels[key]}
                        onChange={(e) => updateQuestionLevels(key, e.target.value)}
                        min={0}
                        max={totalQuestions}
                        step={1}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-3 text-base"
                      />
                      <div className="mt-3 flex items-center">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`${color} h-full rounded-full`}
                            style={{ width: `${Math.min(100, (questionLevels[key] / totalQuestions) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {questionLevels[key]} questions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Total Distribution:</span>
                  <span
                    className={`font-medium ${
                      Object.values(questionLevels).reduce((a, b) => a + b, 0) === totalQuestions
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {Object.values(questionLevels).reduce((a, b) => a + b, 0)} / {totalQuestions} questions
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Quiz Duration (minutes)
                </Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number.parseInt(e.target.value, 10) || 0)}
                  min={10}
                  max={120}
                  step={5}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-3 text-base"
                />
                <div className="mt-2 flex items-center">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (duration / 120) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {duration} minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 border-t bg-slate-50 dark:bg-slate-900 flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
            className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!description || isGenerating}
            className={`flex items-center gap-2 ${
              isGenerating
                ? "bg-slate-400 dark:bg-slate-700"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            } text-white px-6`}
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Quiz
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

  )
}

export default AIQuizGenerationCard

