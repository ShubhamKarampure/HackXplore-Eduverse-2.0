"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Sparkles, Save, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Button from "@/components/ui/button/Button";
import { useAlert } from "@/context/AlertContext";
import { getQuizByModuleId, updateQuiz } from "@/api/quizApi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AIQuizGenerationModal from "@/components/quiz/AIQuiz";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextArea from "@/components/form/input/TextArea";
import { genearteQuiz } from "@/api/quizApi";

const QuizCreationPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const moduleId = params?.moduleId;

  const [quizDuration, setQuizDuration] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const { showAlert, alertTypes } = useAlert();
  const [quizId, setQuizId] = useState();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getQuizByModuleId(moduleId);
        if (data && data.questions) {
          setQuestions(data.questions);
          setQuizDuration(data.duration || 30);
          setQuizId(data._id);
        }
      } catch (error) {}
    };

    if (moduleId) {
      fetchQuiz();
    }
  }, []);

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: { a: "", b: "", c: "", d: "" },
      answer: [],
      difficulty: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (questionIndex, optionKey, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionKey] = value;
    setQuestions(updatedQuestions);
  };

  const toggleAnswer = (questionIndex, optionKey) => {
    const updatedQuestions = [...questions];
    const currentAnswers = updatedQuestions[questionIndex].answer;
    const newAnswers = currentAnswers.includes(optionKey)
      ? currentAnswers.filter((ans) => ans !== optionKey)
      : [...currentAnswers, optionKey];

    updatedQuestions[questionIndex].answer = newAnswers;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSubmitQuiz = async () => {
    if (questions?.length === 0) {
      showAlert("Please add at least one question", alertTypes.ERROR);
      return;
    }

    try {
      const quizData = {
        questions,
        duration: quizDuration,
      };
      await updateQuiz(quizId, quizData);
      showAlert("Quiz updated successfully!", alertTypes.SUCCESS);
    } catch (error) {
      showAlert("Failed to update quiz", alertTypes.ERROR);
    }
  };

  const openAIGenerationModal = () => {
    setShowAIModal(true);
  };

  const handleGenerateAIQuiz = async (config) => {
    setIsGenerating(true);
    try {
      // Call backend AI quiz generation API
      const generatedQuizData = await genearteQuiz(config);

      // Update questions and quiz duration from generated quiz
      setQuestions(generatedQuizData.quiz);

      showAlert("AI Quiz Generated Successfully!", alertTypes.SUCCESS);
      setShowAIModal(false);
    } catch (error) {
      showAlert(
        "Failed to generate AI quiz. Please try again.",
        alertTypes.ERROR
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToCourses = () => {
    router.push(`/my-courses/${courseId}?moduleId=${moduleId}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 ">
      {showAIModal ? (
        <AIQuizGenerationModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onGenerate={handleGenerateAIQuiz}
          isGenerating={isGenerating}
        />
      ) : (
        <>
          <Card className="w-full shadow-lg rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="p-6 border-b bg-slate-50 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center">
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Create Quiz
                  </CardTitle>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBackToCourses}
                    className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Course
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 border-none"
                    onClick={() => setShowAIModal(true)}
                  >
                    <Sparkles className="h-4 w-4" /> AI Generate
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
                  Quiz Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Quiz Duration (minutes)
                    </Label>
                    <Input
                      type="number"
                      value={quizDuration}
                      onChange={(e) => setQuizDuration(Number(e.target.value))}
                      min={10}
                      max={120}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-3 text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    Questions ({questions?.length})
                  </h3>
                  <Button
                    variant="outline"
                    onClick={addQuestion}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700"
                  >
                    <Plus className="h-4 w-4" /> Add Question
                  </Button>
                </div>

                {questions?.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      No questions added yet
                    </p>
                    <Button
                      variant="outline"
                      onClick={addQuestion}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add Your First Question
                    </Button>
                  </div>
                )}

                {questions?.map((question, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md rounded-xl transition-all hover:shadow-lg"
                  >
                    <CardHeader className="p-4 bg-slate-50 dark:bg-slate-900 border-b flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Question {index + 1}
                      </h3>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="h-8 px-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>

                    <CardContent className="p-5 space-y-6">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Question Text
                        </Label>
                        <TextArea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(index, "question", e.target.value)
                          }
                          placeholder="Enter your question here..."
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-3 min-h-[100px] text-base"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                          Answer Options
                        </Label>
                        <div className="grid grid-cols-1 gap-4 ">
                          {["a", "b", "c", "d"].map((optionKey) => (
                            <div
                              key={optionKey}
                              className={`p-4 rounded-lg border ${
                                question.answer.includes(optionKey)
                                  ? "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                                  : "border-slate-300 dark:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                                  {optionKey.toUpperCase()}
                                </div>
                                <TextArea
                                  value={question.options[optionKey]}
                                  onChange={(e) =>
                                    updateQuestionOption(
                                      index,
                                      optionKey,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Enter option ${optionKey.toUpperCase()}`}
                                  className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 p-3 text-base min-w-[500px] min-h-[80px]"
                                  rows={3}
                                />

                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`answer-${index}-${optionKey}`}
                                    checked={question.answer.includes(
                                      optionKey
                                    )}
                                    onChange={() =>
                                      toggleAnswer(index, optionKey)
                                    }
                                    className="h-5 w-5 rounded-sm accent-green-600 cursor-pointer"
                                  />
                                  <Label
                                    htmlFor={`answer-${index}-${optionKey}`}
                                    className="cursor-pointer text-sm font-medium"
                                  >
                                    Correct
                                  </Label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Difficulty Level
                        </Label>
                        <Select
                          value={question?.difficulty?.toString()}
                          onValueChange={(value) =>
                            updateQuestion(index, "difficulty", Number(value))
                          }
                        >
                          <SelectTrigger className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-3 text-base">
                            <SelectValue placeholder="Select Difficulty" />
                          </SelectTrigger>
                          <SelectContent className="rounded-md border p-1">
                            <SelectItem
                              value="1"
                              className="rounded-md cursor-pointer p-2 text-base"
                            >
                              Easy
                            </SelectItem>
                            <SelectItem
                              value="2"
                              className="rounded-md cursor-pointer p-2 text-base"
                            >
                              Medium
                            </SelectItem>
                            <SelectItem
                              value="3"
                              className="rounded-md cursor-pointer p-2 text-base"
                            >
                              Hard
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>

            <CardFooter className="p-6 border-t bg-slate-50 dark:bg-slate-900 flex justify-between">
              <Button
                variant="outline"
                onClick={addQuestion}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Question
              </Button>
              <Button
                variant="default"
                onClick={handleSubmitQuiz}
                disabled={questions?.length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
              >
                <Save className="h-4 w-4" /> Save Quiz
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default QuizCreationPage;
