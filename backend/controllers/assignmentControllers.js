import { CourseModel } from "../models/courseModel.js";
import { AssignmentModel } from "../models/assignmentModel.js";
import { ModuleModel } from "../models/moduleModel.js";
import { uploadOnCloud, deleteFromCloud } from "../utils/cloudinary.js";
import { UserModel } from "../models/userModel.js";
import { ProgressModel } from "../models/progressModel.js";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// Create a new assignment
export const createAssignmentController = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { deadline, description, criteria } = req.body;
    
    // Validate required fields
    if (!deadline || !description || !criteria) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: deadline, description, and criteria"
      });
    }
    
    // Ensure module exists
    const moduleExists = await ModuleModel.findById(moduleId);
    if (!moduleExists) {
      return res.status(404).json({ 
        success: false, 
        message: "Module not found" 
      });
    }
    
    // Create the assignment linked to the module
    const assignment = new AssignmentModel({ 
      module: moduleId,
      description,
      deadline,
      criteria
    });
    
    await assignment.save();
    
    // Link assignment to module
    await ModuleModel.findByIdAndUpdate(moduleId, 
      { $set: { "contents.assignment": assignment._id } }
    );
    
    // Also link to course if needed
    const courseId = moduleExists.course;
    if (courseId) {
      await CourseModel.findByIdAndUpdate(courseId, 
        { $push: { assignments: assignment._id } }
      );
    }
    
    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Delete an assignment
export const deleteAssignmentController = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    
    // Find and delete the assignment
    const deletedAssignment = await AssignmentModel.findByIdAndDelete(assignmentId);
    
    if (!deletedAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
    
    // Remove assignment reference from the module
    await ModuleModel.updateOne(
      { "contents.assignment": assignmentId }, 
      { $unset: { "contents.assignment": "" } }
    );
    
    // Remove from course if needed
    if (deletedAssignment.module) {
      const module = await ModuleModel.findById(deletedAssignment.module);
      if (module && module.course) {
        await CourseModel.findByIdAndUpdate(
          module.course,
          { $pull: { assignments: assignmentId } }
        );
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
      deletedAssignment
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Update an assignment
export const updateAssignmentController = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    
    // Find and update the assignment
    const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
      assignmentId,
      req.body,
      { new: true }
    );
    
    if (!updatedAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
    
    // Update late status for submissions if deadline changed
    if (req.body.deadline) {
      const newDeadline = new Date(req.body.deadline);
      updatedAssignment.submissions.forEach((submission) => {
        const submissionDate = new Date(submission.submissionDate);
        submission.late = submissionDate > newDeadline;
      });
      
      await updatedAssignment.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment: updatedAssignment
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get assignment by module ID
export const getAssignmentByModuleId = async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const assignment = await AssignmentModel.findOne({ module: moduleId })
      .populate("module");
      
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: "Assignment not found for this module" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Assignment fetched successfully",
      assignment
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Submit an assignment// Submit an assignment
export const submitAssignment = async (req, res) => {
  try {
    const studentId = req.userId;
    
    const { submissionFile } = req.files;
    const { assignmentId } = req.body;
    
    // Find the assignment by ID
    const assignment = await AssignmentModel.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
    
    // Check if the file is a PDF
    if (submissionFile.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF format is accepted"
      });
    }
    
    // Upload the submission file to the cloud
    const { public_id, url } = await uploadOnCloud(submissionFile.tempFilePath);
    
    // Check if student already submitted
    const index = assignment.submissions.findIndex(
      (submission) => submission.student.toString() === studentId
    );
    
    const now = new Date();
    const isLate = now > assignment.deadline;
    
    if (index === -1) {
      // New submission
      assignment.submissions.push({
        student: studentId,
        submission: url,
        public_id,
        submissionDate: now,
        late: isLate,
        grade: null,
        criteriaScores: [],
        feedback: ""
      });
    } else {
      // Update existing submission
      const existingSubmission = assignment.submissions[index];
      
      // Delete old file from cloud
      await deleteFromCloud(existingSubmission.public_id);
      
      // Update submission
      assignment.submissions[index] = {
        ...existingSubmission,
        submission: url,
        public_id,
        submissionDate: now,
        late: isLate,
        grade: null, // Reset grade on resubmission
        criteriaScores: [], // Reset criteria scores
        feedback: "" // Reset feedback
      };
    }
    
    // Save the updated assignment
    await assignment.save();
    
    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      assignment
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get assignments by course
export const getAssignmentsByCourseController = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const assignments = await AssignmentModel.find({
      module: { $in: await ModuleModel.find({ course: courseId }).distinct('_id') }
    }).populate('module');
    
    res.status(200).json({
      success: true,
      message: "Assignments fetched successfully",
      assignments
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Grade an assignment// Grade an assignment
export const gradeAssignmentController = async (req, res) => {
  try {
    const studentId = req.userId;
    const { assignmentId } = req.params;
    
    const assignment = await AssignmentModel.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
    
    // Find the student's submission
    const submissionIndex = assignment.submissions.findIndex(
      (submission) => submission.student.toString() === studentId
    );
    
    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Submission not found for this student"
      });
    }
    
    const submission = assignment.submissions[submissionIndex];
    const pdf_url = submission.submission;
    
    // Convert criteria array of objects to array of strings for the AI service
    const criteriaNames = assignment.criteria.map(criterion => criterion.name);
    const criteriaMaxScores = assignment.criteria.map(criterion => criterion.maxScore);
    
    // Call the Flask AI grading service
    const response = await axios.post(
      `${process.env.FLASK_URL}/grade`,
      { 
        pdf_url, 
        criteria: criteriaNames,
        maxScores: criteriaMaxScores
      },
      {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }
    );
    
    const evaluation = response.data;
    
    // Prepare criteria scores
    const criteriaScores = [];
    let totalScore = 0;
    
    for (let i = 0; i < criteriaNames.length; i++) {
      const criterionName = criteriaNames[i];
      const maxScore = criteriaMaxScores[i];
      const score = evaluation[criterionName] ? 
        Math.min(Math.max(parseInt(evaluation[criterionName]), 0), maxScore) : 0;
      
      criteriaScores.push({
        criterion: criterionName,
        score: score,
        max_score: maxScore
      });
      
      totalScore += score;
    }
    
    // Update submission with grade and criteria scores
    assignment.submissions[submissionIndex].grade = totalScore;
    assignment.submissions[submissionIndex].criteriaScores = criteriaScores;
    assignment.submissions[submissionIndex].feedback = evaluation.feedback || "";
    
    await assignment.save();
    
    res.status(200).json({
      success: true,
      message: "Assignment evaluated successfully",
      evaluation: {
        criteria_scores: criteriaScores,
        grade: totalScore,
        max_grade: assignment.totalPoints,
        feedback: evaluation.feedback || ""
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get assignments for a student
export const getAssignmentByStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await UserModel.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    let deadlines = [];

    // Get all courses the student is enrolled in
    for (const courseId of student.enrolledCourses) {
      const course = await CourseModel.findById(courseId).populate('assignments');
      
      if (course) {
        // Get all modules for this course
        const modules = await ModuleModel.find({ course: courseId });
        
        // Collect assignments from modules
        for (const module of modules) {
          const assignment = await AssignmentModel.findOne({ 
            module: module._id 
          });
          
          if (assignment) {
            // Check if student has submitted
            const hasSubmitted = assignment.submissions.some(
              (submission) => submission.student.toString() === studentId
            );
            
            deadlines.push({
              title: course.name,
              moduleTitle: module.title,
              description: assignment.description,
              deadline: assignment.deadline,
              submitted: hasSubmitted,
              column: hasSubmitted ? "done" : "backlog",
              id: assignment._id
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Assignments fetched successfully",
      deadlines
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get submission status for a student
export const getSubmissionStatus = async (req, res) => {
  try {
    const studentId = req.userId;
    const { assignmentId } = req.params;
    
    const assignment = await AssignmentModel.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
    
    // Find the student's submission
    const submission = assignment.submissions.find(
      (sub) => sub.student.toString() === studentId
    );
    
    if (!submission) {
      return res.status(200).json({
        success: true,
        hasSubmitted: false,
        isGraded: false
      });
    }
    
    // Determine if the submission is graded
    const isGraded = submission.grade !== null && submission.grade !== undefined;
    
    // If graded, include evaluation data
    let evaluation = null;
    if (isGraded) {
      evaluation = {
        criteria_scores: submission.criteriaScores || [],
        grade: submission.grade,
        max_grade: assignment.totalPoints,
        feedback: submission.feedback || ""
      };
    }
    
    res.status(200).json({
      success: true,
      hasSubmitted: true,
      isGraded,
      evaluation
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};