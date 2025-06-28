import { CourseModel } from "../models/courseModel.js";
import { UserModel } from "../models/userModel.js";
import { QuizModel } from "../models/quizModel.js";
import { AssignmentModel } from "../models/assignmentModel.js";
import { uploadOnCloud, deleteFromCloud } from "../utils/cloudinary.js";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";


export const createCourse = async (req, res) => {
  const instructorId = req.userId;
  const { name, description, enrollKey, semester } = req.body;

  if (!name || !description || !enrollKey || !semester) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required course fields: name, description, enrollKey, semester.",
    });
  }

  let newCourse;
  let imageUploadResult;

  try {
    newCourse = new CourseModel({
      name,
      instructor: instructorId,
      description,
      enrollKey,
      semester,
    });
    await newCourse.save();

    // Handle course image upload
    if (req.files && req.files.image) {
      imageUploadResult = await uploadOnCloud(
        req.files.image.tempFilePath,
        "course-images"
      );
      newCourse.image = {
        url: imageUploadResult.url,
        publicId: imageUploadResult.public_id,
      };
    }

    // Handle syllabus file upload
    if (req.files && req.files.syllabus) {
      const syllabusFile = req.files.syllabus;

      const syllabusFormData = new FormData();
      syllabusFormData.append(
        "file",
        fs.createReadStream(syllabusFile.tempFilePath),
        syllabusFile.name
      );
      syllabusFormData.append("course_id", newCourse._id.toString());

      // 1. Upload to Cloudinary
      const syllabusUploadResult = await uploadOnCloud(
        syllabusFile.tempFilePath,
        "course-syllabi"
      );
      newCourse.syllabus = {
        url: syllabusUploadResult.url,
        publicId: syllabusUploadResult.public_id,
      };

      // 2. Send to Flask for Vector DB Ingestion
      await axios.post(
        `${process.env.FLASK_URL}/material/syllabus/add`,
        syllabusFormData,
        { headers: { ...syllabusFormData.getHeaders() } }
      );
    }

    // Process textbooks file uploads
    if (req.files && req.files.textbooks) {
      const textbookFiles = Array.isArray(req.files.textbooks)
        ? req.files.textbooks
        : [req.files.textbooks];

      const processedTextbooks = [];
      for (const textbook of textbookFiles) {
        
        const textbookFormData = new FormData();
        textbookFormData.append(
          "file",
          fs.createReadStream(textbook.tempFilePath),
          textbook.name
        );
        textbookFormData.append("course_id", newCourse._id.toString());
    
        // 1. Upload to Cloudinary
        const textbookUploadResult = await uploadOnCloud(
          textbook.tempFilePath,
          "course-textbooks"
        );
        processedTextbooks.push({
          title: textbook.name,
          url: textbookUploadResult.url,
          publicId: textbookUploadResult.public_id,
        });

        // 2. Send to Flask for Vector DB Ingestion
        await axios.post(
          `${process.env.FLASK_URL}/material/reference/add`,
          textbookFormData,
          { headers: { ...textbookFormData.getHeaders() } }
        );
      }
      newCourse.textbooks = processedTextbooks;
    }

    // --- Step 4: Save the Updated Course with File Info ---
    await newCourse.save();

    const populatedCourse = await CourseModel.findById(newCourse._id)
      .populate("instructor", "firstName lastName")
      .select("name instructor description semester image");

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (error) {
    if (newCourse && newCourse._id) {
      // Delete any files uploaded to Cloudinary
      try {
        if (newCourse.image && newCourse.image.publicId) {
          await deleteFromCloud(newCourse.image.publicId);
        }
        if (newCourse.syllabus && newCourse.syllabus.publicId) {
          await deleteFromCloud(newCourse.syllabus.publicId);
        }
        if (newCourse.textbooks && newCourse.textbooks.length > 0) {
          for (const tb of newCourse.textbooks) {
            await deleteFromCloud(tb.publicId);
          }
        }
      } catch (cleanupError) {
        console.error(
          "Cleanup Error: Failed to delete assets from cloud.",
          cleanupError
        );
      }

      // Delete the course from MongoDB
      await CourseModel.findByIdAndDelete(newCourse._id);
    }

    console.error("Course creation error:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An internal server error occurred.";
    res.status(500).json({
      success: false,
      message: `Failed to create course: ${errorMessage}`,
      error: error.message,
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
      return res.status(404).json({ message: "Course not found" });
    }

    // Check enrollment key
    if (course.enrollKey !== enrollKey) {
      return res.status(403).json({ message: "Invalid enrollment key" });
    }

    // Check if already enrolled
    if (course.students.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Check user exists and is a student
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "Student") {
      return res
        .status(403)
        .json({ message: "Only students can enroll in courses" });
    }

    // Add student to course
    course.students.push(userId);
    await course.save();

    // Add course to user's enrolled courses
    user.enrolledCourses.push(courseId);
    await user.save();

    res.status(200).json({
      message: "Successfully enrolled in course",
      course: {
        _id: course._id,
        name: course.name,
      },
    });
  } catch (error) {
    console.error("Course enrollment error:", error);
    res.status(500).json({
      message: "Error enrolling in course",
      error: error.message,
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
    })
      .populate("instructor", "firstName lastName profile.image") // Only populate instructor name
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
    if (user.role === "Student") {
      // For students, fetch the courses they are enrolled in with specific fields
      courses = await CourseModel.find({
        _id: { $in: user.enrolledCourses },
      })
        .populate("instructor", "firstName lastName profile.image")
        .select("name instructor description semester image");
    } else if (user.role === "Teacher") {
      // For teachers, fetch the courses they are teaching with specific fields
      courses = await CourseModel.find({
        instructor: userId,
      })
        .populate("instructor", "firstName lastName")
        .select("name instructor description semester image");
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid user role",
      });
    }

    res.status(200).json({
      success: true,
      message:
        user.role === "Student"
          ? "Successfully retrieved enrolled courses"
          : "Successfully retrieved courses you are teaching",
      courses,
      role: user.role,
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
      .populate("instructor", "firstName lastName email")
      .populate({
        path: "modules",
        select: "_id title order", 
      })
      .lean(); 

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Get course details error:", error);
    res.status(500).json({
      message: "Error retrieving course details",
      error: error.message,
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
          "Content-Type": "application/json",
        },
      }
    );

    // Return the similar courses from the Flask API
    return res.status(200).json({
      success: true,
      message: "Similar courses found successfully",
      similarCourses: flaskResponse.data.similarCourses,
    });
  } catch (error) {
    console.error("Error finding similar courses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};
