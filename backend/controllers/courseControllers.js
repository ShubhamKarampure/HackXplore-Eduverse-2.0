import { CourseModel } from "../models/courseModel.js";
import { UserModel } from "../models/userModel.js";
import { QuizModel } from "../models/quizModel.js";
import { AssignmentModel } from "../models/assignmentModel.js";
import { uploadOnCloud ,deleteFromCloud } from "../utils/cloudinary.js";
import axios from "axios";

export const createCourse = async (req, res) => {
  const instructor = req.userId; 
  try {
    const { 
      name, 
      description, 
      enrollKey, 
      semester, 
      syllabus, 
      textbooks 
    } = req.body;

    // Validate required fields
    if (!name || !description || !enrollKey || !semester) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required course fields' 
      });
    }

    // Handle course image upload
    let imageUploadResult = null;
    if (req.files && req.files.image) {
      try {
        imageUploadResult = await uploadOnCloud (
          req.files.image.tempFilePath, 
          'course-images'
        );
      } catch (uploadError) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload course image',
          error: uploadError.message 
        });
      }
    }

    // Handle syllabus file upload
    let syllabusUploadResult = null;
    if (req.files && req.files.syllabus) {
      try {
        syllabusUploadResult = await uploadOnCloud (
          req.files.syllabus.tempFilePath, 
          'course-syllabi'
        );
      } catch (uploadError) {
        // Rollback image upload if it exists
        if (imageUploadResult) {
          await deleteFromCloud(imageUploadResult.public_id);
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload syllabus',
          error: uploadError.message 
        });
      }
    }

    // Process textbooks file uploads
    const processedTextbooks = [];
    if (req.files && req.files.textbooks) {
      const textbookFiles = Array.isArray(req.files.textbooks) 
        ? req.files.textbooks 
        : [req.files.textbooks];

      for (const textbook of textbookFiles) {
        try {
          const textbookUploadResult = await uploadOnCloud (
            textbook.tempFilePath, 
            'course-textbooks'
          );
        
          
          processedTextbooks.push({
            title: textbook.name,
            url: textbookUploadResult.url,
            publicId: textbookUploadResult.public_id
          });
        } catch (uploadError) {
          // Rollback previous uploads
          if (imageUploadResult) {
            await deleteFromCloud(imageUploadResult.public_id);
          }
          if (syllabusUploadResult) {
            await deleteFromCloud(syllabusUploadResult.public_id);
          }
          processedTextbooks.forEach(async (tb) => {
            await deleteFromCloud(tb.publicId);
          });

          return res.status(500).json({ 
            success: false, 
            message: 'Failed to upload textbooks',
            error: uploadError.message 
          });
        }
      }
    }

    // Create new course
const newCourse = new CourseModel({
  name,
  instructor,
  description,
  enrollKey,
  semester,
  image: imageUploadResult 
    ? { 
        url: imageUploadResult.url, 
        publicId: imageUploadResult.public_id 
      } 
    : undefined,
  syllabus: syllabusUploadResult 
    ? { 
        url: syllabusUploadResult.url, 
        publicId: syllabusUploadResult.public_id 
      } 
    : undefined,
  textbooks: processedTextbooks,
  students: [],
  modules: []
});

// Save the course
await newCourse.save();

const course = await CourseModel.populate(newCourse, {
  path: 'instructor',
  select: 'firstName lastName'
});

const selectedCourse = await CourseModel.findById(course._id).select("name instructor description semester image");
 
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course:selectedCourse,
    });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
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
          { path: 'contents.quiz',  select: 'questions passingScore' },
          { path: 'contents.assignment', select: 'description deadline criteria' }
        ]
      })
      .lean(); // Use .lean() for better performance

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    
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
