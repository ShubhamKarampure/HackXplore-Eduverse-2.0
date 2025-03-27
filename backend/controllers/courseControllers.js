import { CourseModel } from "../models/courseModel.js";
import { AssignmentModel } from "../models/assignmentModel.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import axios from "axios";
import { UserModel } from "../models/userModel.js";
import { ProgressModel } from "../models/progressModel.js";
import mongoose from 'mongoose';

export const createCourse = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      enrollKey, 
      instructor, 
      semester, 
      syllabus, 
      textbooks, 
      modules 
    } = req.body;

    // Validate instructor exists
    const instructorUser = await UserModel.findById(instructor);
    if (!instructorUser) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Check instructor role
    if (instructorUser.role !== 'Teacher') {
      return res.status(403).json({ message: 'Only teachers can create courses' });
    }

    // Optional: Image upload handling (assuming middleware like multer)
    const image = req.file ? {
      url: req.file.path,
      publicId: req.file.filename
    } : null;

    // Create new course
    const newCourse = new CourseModel({
      name,
      description,
      enrollKey,
      instructor,
      semester,
      syllabus,
      textbooks: textbooks || [],
      modules: modules || [],
      image,
      students: [],
      assignments: []
    });

    // Save course
    const savedCourse = await newCourse.save();

    res.status(201).json({
      message: 'Course created successfully',
      course: savedCourse
    });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ 
      message: 'Error creating course', 
      error: error.message 
    });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId, enrollKey } = req.body;
    const userId = req.userId; 

    // Validate course exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check enrollment key
    if (course.enrollKey !== enrollKey) {
      return res.status(403).json({ message: 'Invalid enrollment key' });
    }

    // Check if already enrolled
    if (course.students.includes(userId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Check user exists and is a student
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    // Add student to course
    course.students.push(userId);
    await course.save();

    // Add course to user's enrolled courses
    user.enrolledCourses.push(courseId);
    await user.save();

    res.status(200).json({
      message: 'Successfully enrolled in course',
      course: {
        _id: course._id,
        name: course.name
      }
    });
  } catch (error) {
    console.error('Course enrollment error:', error);
    res.status(500).json({ 
      message: 'Error enrolling in course', 
      error: error.message 
    });
  }
};

export const getAllCourses = async (req, res) => {   
  try {     
    const userId = req.userId;        
    // Fetch the user's enrolled courses     
    const user = await UserModel.findById(userId).select("enrolledCourses");      
    
    if (!user) {       
      return res.status(404).json({         
        success: false,         
        message: "User not found",       
      });     
    }      
    
    // Get courses that the user is NOT enrolled in, with specific fields
    const courses = await CourseModel.find({       
      _id: { $nin: user.enrolledCourses },     
    }).populate("instructor",'firstName lastName')  // Only populate instructor name
    .select("name instructor description semester image"); // Select only specific fields
      
    res.status(200).json({       
      success: true,       
      message: "Found available courses",       
      courses,     
    });   
  } catch (error) {     
    console.error(error);     
    res.status(500).json({       
      success: false,       
      message: "Internal server error",     
    });   
  } 
};  

export const getMyCourses = async (req, res) => {   
  try {     
    const userId = req.userId;      
    // Find the user to check their role     
    const user = await UserModel.findById(userId);      
    
    if (!user) {       
      return res.status(404).json({         
        success: false,         
        message: "User not found",       
      });     
    }      
    
    let courses;      
    if (user.role === 'Student') {       
      // For students, fetch the courses they are enrolled in with specific fields
      courses = await CourseModel.find({         
        _id: { $in: user.enrolledCourses }       
      }).populate('instructor','firstName lastName')
      .select("name instructor description semester image");     
    } else if (user.role === 'Teacher') {       
      // For teachers, fetch the courses they are teaching with specific fields
      courses = await CourseModel.find({         
        instructor: userId       
      }).populate('instructor', 'firstName lastName')
      .select("name instructor description semester image");     
    } else {       
      return res.status(403).json({         
        success: false,         
        message: "Invalid user role",       
      });     
    }      
    
    res.status(200).json({       
      success: true,       
      message: user.role === 'Student'          
        ? "Successfully retrieved enrolled courses"          
        : "Successfully retrieved courses you are teaching",       
      courses,       
      role: user.role     
    });   
  } catch (error) {     
    console.error("Error in getMyCourses:", error);     
    res.status(500).json({       
      success: false,       
      message: "Internal server error",     
    });   
  } 
};
export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;      

    // Find course and populate instructor, modules, and nested content
    const course = await CourseModel.findById(courseId)
      .populate('instructor', 'firstName lastName email')
      .populate({
        path: 'modules',
        populate: [
          { path: 'contents.quiz', select: 'questions passingScore' },
          { path: 'contents.assignment', select: 'description deadline criteria' }
        ]
      })
      .lean(); // Use .lean() for better performance

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled or is the instructor
    const isEnrolled = course.students.some(studentId => 
      studentId.toString() === userId.toString()
    );
    const isInstructor = course.instructor._id.toString() === userId.toString();

    res.status(200).json(course);
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({ 
      message: 'Error retrieving course details', 
      error: error.message 
    });
  }
};


export const findSimilarCoursesController = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // First, find the course by ID to get its title and description
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Prepare data for the Flask API
    const courseData = {
      courseTitle: course.name,
      courseDescription: course.description,
    };

    // Call Flask API to find similar courses
    const flaskResponse = await axios.post(
      `${process.env.FLASK_URL}/find-similar-courses`,
      courseData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Return the similar courses from the Flask API
    return res.status(200).json({
      success: true,
      message: "Similar courses found successfully",
      similarCourses: flaskResponse.data.similarCourses
    });

  } catch (error) {
    console.error("Error finding similar courses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message
    });
  }
};

export const generateQuizController = async (req, res) => {
  try {
    const { id, idx } = req.params;
    const courseId = id;
    const ModuleIndex = idx;
    const course = await CourseModel.findById(courseId);
    const description = course.modules[ModuleIndex].description;
    const response = await axios.post(
      `${process.env.FLASK_URL}/quiz`,
      { description },
      {
        headers: {
          "Content-type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log(response.data);
    course.modules[ModuleIndex].quiz.questions = response.data.quiz;
    course.save();
    res.status(200).json({
      success: true,
      message: "Generated quiz",
      course,
      quiz: response.data.questions,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getQuizController = async (req, res) => {
  try {
    const { id, idx } = req.params;
    const courseId = id;
    const ModuleIndex = idx;
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }
    const module = course.modules[ModuleIndex];
    if (!module) {
      return res.status(400).json({
        success: false,
        message: "Module not found",
      });
    }
    const quiz = module.quiz;
    if (!quiz) {
      return res.status(400).json({
        success: false,
        message: "Quiz not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Quiz found",
      quiz,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);
    // Initialize leaderboard with students and marks set to 0
    let leaderboard = [];
    for (let i = 0; i < course.students.length; i++) {
      let student = course.students[i];
      const Student = await UserModel.findById(student);
      leaderboard.push({ name: Student.name, student: student, marks: 0 });
    }
    // Loop through assignments
    for (let i = 0; i < course.assignments.length; i++) {
      let assignment = await AssignmentModel.findById(course.assignments[i]);
      // Ensure the assignment has submissions
      if (!assignment.submissions) continue;
      // Debug: Log the assignment and its submissions
      console.log("Processing assignment:", assignment._id);
      console.log("Submissions:", assignment.submissions);
      // Loop through submissions in each assignment
      for (let j = 0; j < assignment.submissions.length; j++) {
        let submission = assignment.submissions[j];
        // Ensure the submission has a student field and a grade
        if (!submission || !submission.student || !submission.grade) {
          console.log(`Invalid submission:`, submission);
          continue;
        }
        // Debug: Log each submission student and grade
        console.log(
          `Submission student ID: ${submission.student}, Grade: ${submission.grade}`
        );
        // Find the student in the leaderboard by comparing their ID
        let index = leaderboard.findIndex(
          (entry) => entry.student.toString() == submission.student.toString()
        );
        // Ensure student is found in the leaderboard
        if (index !== -1) {
          leaderboard[index].marks += submission.grade; // Add the student's grade to their total marks
          console.log(
            `Updated marks for student ${submission.student}: ${leaderboard[index].marks}`
          );
        } else {
          console.log(
            `Student not found in leaderboard: ${submission.student.toString()}`
          );
        }
      }
    }
    // Return the leaderboard
    res.status(200).json({
      success: true,
      message: "Leaderboard generated",
      leaderboard,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createRoadmapController = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);
    const description = course.description;
    const response = await axios.post(
      `${process.env.FLASK_URL}/roadmap`,
      { description },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log(response.data);
    course.modules = response.data.modules;
    course.save();
    res.status(200).json({
      success: true,
      message: "Created roadmap successfully",
      roadmap: course.roadmap,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const uploadContentController = async (request, response) => {
  try {
    const courseId = request.params.id;
    const roadmapId = request.headers.roadmapid;

    // Ensure request.files is defined and check for the expected key 'content'
    if (!request.files || !request.files.content) {
      return response.status(400).json({
        success: false,
        message: "Please provide a video file in the 'content' field",
      });
    }

    const { content } = request.files;

    const course = await CourseModel.findById(courseId);
    if (!course) {
      return response.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check video MIME type
    if (!["video/mp4", "video/webm", "video/ogg"].includes(content.mimetype)) {
      return response.status(401).json({
        success: false,
        message: "Use only video formats (mp4, webm, ogg)",
      });
    }

    // Upload video to cloud and get URL
    const { public_id, url } = await uploadOnCloud(content.tempFilePath);
    console.log("public_id, url", public_id, url);

    // Update the specific roadmap item to add the video URL
    const updatedCourse = await CourseModel.updateOne(
      { _id: courseId, "roadmap._id": roadmapId },
      { $push: { "roadmap.$.links": url } }
    );

    if (updatedCourse.nModified === 0) {
      return response.status(400).json({
        success: false,
        message: "Roadmap item not found",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Video link added successfully",
      url,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
