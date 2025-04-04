import { ProgressModel } from "../models/progressModel.js";

// Create a new progress record
export const createProgress = async (req, res) => {
  try {
    const { student, course } = req.body;

    // Check if progress already exists
    const existingProgress = await ProgressModel.findOne({ student, course });
    if (existingProgress) {
      return res.status(400).json({ success: false, message: "Progress already exists for this student and course." });
    }

    const progress = new ProgressModel(req.body);
    await progress.save();

    res.status(201).json({ success: true, message: "Progress created successfully.", progress });
  } catch (error) {
    console.error("Error creating progress:", error);
    res.status(500).json({ success: false, message: "Failed to create progress.", error: error.message });
  }
};

// Read a progress record
export const getProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const progress = await ProgressModel.findOne({ student: studentId, course: courseId })
      .populate("quizAttempts.quizId")
      .populate("course");

    if (!progress) {
      return res.status(404).json({ success: false, message: "Progress not found." });
    }

    res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ success: false, message: "Failed to fetch progress.", error: error.message });
  }
};

// Update a progress record
export const updateProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const updates = req.body;

    const progress = await ProgressModel.findOneAndUpdate(
      { student: studentId, course: courseId },
      { $set: updates },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({ success: false, message: "Progress not found." });
    }

    res.status(200).json({ success: true, message: "Progress updated successfully.", progress });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ success: false, message: "Failed to update progress.", error: error.message });
  }
};

// Delete a progress record
export const deleteProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const progress = await ProgressModel.findOneAndDelete({ student: studentId, course: courseId });

    if (!progress) {
      return res.status(404).json({ success: false, message: "Progress not found." });
    }

    res.status(200).json({ success: true, message: "Progress deleted successfully." });
  } catch (error) {
    console.error("Error deleting progress:", error);
    res.status(500).json({ success: false, message: "Failed to delete progress.", error: error.message });
  }
};