import { TestModel } from "../models/testModel.js";
import dotenv from "dotenv";
import axios from "axios";
import { ProgressModel } from "../models/progressModel.js";
dotenv.config();

export const evaluationController = async (req, res) => {
  try {
    const { course, questions, marks, student } = req.body;
    console.log(questions);
    const response = await axios.post(
      `${process.env.FLASK_URL}/quiz/feedback`,
      { questions },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log(response.data.feedback);
    const evaluation = await TestModel.create({
      course,
      student,
      marks,
      evaluation: response.data.feedback,
    });

    const progress = await ProgressModel.findOne({
      student: student,
      course: course,
    });

    const submittedQuizzes = progress.completedQuizzes;
    const quizId = evaluation._id;
    if (!submittedQuizzes.includes(quizId)) {
      submittedQuizzes.push(quizId);
      await progress.save();
    }

    res.status(201).json({
      success: true,
      message: "Quiz evaluated successfully",
      evaluation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
