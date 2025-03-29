import { QuizModel } from "../models/quizModel.js";
import { ModuleModel } from "../models/moduleModel.js";
import axios from "axios";
// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const quizData = req.body;

    // Ensure module exists
    const moduleExists = await ModuleModel.findById(moduleId);
    if (!moduleExists) return res.status(404).json({ error: "Module not found" });

    const quiz = new QuizModel({ module: moduleId, ...quizData });
    await quiz.save();

    // Link quiz to module
    await ModuleModel.findByIdAndUpdate(moduleId, { $set: { "contents.quiz": quiz._id } });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Retrieve a quiz by module ID
export const getQuizByModuleId = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const quiz = await QuizModel.findOne({ module: moduleId }).populate("module");
    if (!quiz) return res.status(404).json({ error: "Quiz not found for this module" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a quiz
export const updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await QuizModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedQuiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await QuizModel.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Remove quiz reference from the module
    await ModuleModel.updateOne({ "contents.quiz": req.params.id }, { $unset: { "contents.quiz": "" } });
    
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const generateQuiz = async (req, res) => {
  const instructor = req.userId;
  try {
    const quizConfig = req.body;
    // Call Flask API to generate modules
    const response = await axios.post(`${process.env.FLASK_URL}/quiz`, { quizConfig }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    res.status(200).json({
      success: true,
      message: "AI generated quiz successfully",
      quiz: response.data.quiz,
    });
  } catch (error) {
    console.error("Module generation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};