import { ModuleModel } from "../models/moduleModel.js";
import { CourseModel } from "../models/courseModel.js";
import { QuizModel } from "../models/quizModel.js";
import { AssignmentModel } from "../models/assignmentModel.js";
import { uploadOnCloud, deleteFromCloud } from "../utils/cloudinary.js";
import axios from "axios";

export const createModule = async (req, res) => {
  const instructor = req.userId;
  try {
    const { 
      courseId, 
      title, 
      description, 
      order 
    } = req.body;

    // Validate required fields
    if (!courseId || !title || !description || order === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required module fields' 
      });
    }

    // Verify course exists and user is the instructor
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Verify instructor owns the course
    if (course.instructor.toString() !== instructor.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to add module to this course' 
      });
    }

    // Create quiz and assignment
    const newQuiz = new QuizModel({
      moduleId: null, // Will be updated later
      questions: [],
      passingScore: 0
    });
    await newQuiz.save();

    const newAssignment = new AssignmentModel({
      moduleId: null, // Will be updated later
      description: '',
      deadline: null,
      criteria: ''
    });
    await newAssignment.save();

    // Handle video upload
    let videoUploadResult = null;
    if (req.files && req.files.video) {
      try {
        videoUploadResult = await uploadOnCloud(
          req.files.video.tempFilePath, 
          'module-videos'
        );
      } catch (uploadError) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload video',
          error: uploadError.message 
        });
      }
    }

    // Handle resource upload
    let resourceUploadResult = null;
    if (req.files && req.files.resource) {
      try {
        resourceUploadResult = await uploadOnCloud(
          req.files.resource.tempFilePath, 
          'module-resources'
        );
      } catch (uploadError) {
        // Rollback video upload if it exists
        if (videoUploadResult) {
          await deleteFromCloud(videoUploadResult.public_id);
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload resource',
          error: uploadError.message 
        });
      }
    }

    // Create new module
    const newModule = new ModuleModel({
      course: courseId,
      title,
      description,
      order,
      contents: {
        video: videoUploadResult 
          ? { 
              title: req.files.video.name,
              url: videoUploadResult.url,
              publicId: videoUploadResult.public_id,
            } 
          : undefined,
        resource: resourceUploadResult 
          ? { 
              title: req.files.resource.name,
              url: resourceUploadResult.url
            } 
          : undefined,
        quiz: newQuiz._id,
        assignment: newAssignment._id
      }
    });

    // Save the module
    await newModule.save();

    // Update quiz and assignment with module reference
    await QuizModel.findByIdAndUpdate(newQuiz._id, { moduleId: newModule._id });
    await AssignmentModel.findByIdAndUpdate(newAssignment._id, { moduleId: newModule._id });

    // Update course modules
    course.modules.push(newModule._id);
    await course.save();

    // Populate the module with full details
    const populatedModule = await ModuleModel.findById(newModule._id)
      .populate('contents.quiz')
      .populate('contents.assignment');

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      module: populatedModule
    });
  } catch (error) {
    console.error('Module creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

export const updateModule = async (req, res) => {
  const instructor = req.userId;
  
  try {
    const { moduleId } = req.params;
    const { 
      title, 
      description, 
      order,
      videoTitle,
    } = req.body;
   // Find existing module and verify ownership
    const existingModule = await ModuleModel.findById(moduleId)
      .populate('course');
    
    if (!existingModule) {
      return res.status(404).json({ 
        success: false, 
        message: 'Module not found' 
      });
    }

    // Prepare update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (order !== undefined) updateData.order = order;

    // Handle video upload
    let videoUploadResult = null;

    if (req.files && req.files.video) {
      try {
        // Delete existing video if exists
        if (existingModule.contents.video && existingModule.contents.video.publicId) {
          await deleteFromCloud(existingModule.contents.video.publicId);
        }

        videoUploadResult = await uploadOnCloud(
          req.files.video.tempFilePath, 
          'module-videos'
        );

        updateData['contents.video'] = {
          title: videoTitle || req.files.video.name,
          url: videoUploadResult.url,
          publicId: videoUploadResult.public_id,
        
        };
      } catch (uploadError) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload video',
          error: uploadError.message 
        });
      }
    }

    // Handle resource upload
    let resourceUploadResult = null;
    if (req.files && req.files.resource) {
      try {
        // Delete existing resource if exists
        if (existingModule.contents.resource && existingModule.contents.resource.url) {
          await deleteFromCloud(existingModule.contents.resource.publicId);
        }

        resourceUploadResult = await uploadOnCloud(
          req.files.resource.tempFilePath, 
          'module-resources'
        );

        updateData['contents.resource'] = {
          title: req.files.resource.name,
          url: resourceUploadResult.url
        };
      } catch (uploadError) {
        // Rollback video upload if it exists
        if (videoUploadResult) {
          await deleteFromCloud(videoUploadResult.public_id);
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload resource',
          error: uploadError.message 
        });
      }
    }

    // Update module
    const updatedModule = await ModuleModel.findByIdAndUpdate(
      moduleId, 
      { $set: updateData }, 
      { new: true }
    ).populate('contents.quiz')
     .populate('contents.assignment');

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      module: updatedModule
    });
  } catch (error) {
    console.error('Module update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

export const deleteModule = async (req, res) => {
  const instructor = req.userId;
  try {
    const { moduleId } = req.params;

    // Find existing module and verify ownership
    const existingModule = await ModuleModel.findById(moduleId)
      .populate('course');
    
    if (!existingModule) {
      return res.status(404).json({ 
        success: false, 
        message: 'Module not found' 
      });
    }

    // Verify instructor owns the course
    if (existingModule.course.instructor.toString() !== instructor.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to delete this module' 
      });
    }

    // Delete cloud resources if they exist
    if (existingModule.contents.video && existingModule.contents.video.publicId) {
      await deleteFromCloud(existingModule.contents.video.publicId);
    }

    if (existingModule.contents.resource && existingModule.contents.resource.url) {
      await deleteFromCloud(existingModule.contents.resource.publicId);
    }

    // Remove module from course
    await CourseModel.findByIdAndUpdate(
      existingModule.course._id, 
      { $pull: { modules: moduleId } }
    );

    // Delete associated quiz and assignment
    if (existingModule.contents.quiz) {
      await QuizModel.findByIdAndDelete(existingModule.contents.quiz);
    }

    if (existingModule.contents.assignment) {
      await AssignmentModel.findByIdAndDelete(existingModule.contents.assignment);
    }

    // Delete the module
    await ModuleModel.findByIdAndDelete(moduleId);

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Module deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

export const getModuleDetails = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.userId;

    // Find module and populate details
    const module = await ModuleModel.findById(moduleId)
      .populate('course')
      .populate('contents.quiz')
      .populate('contents.assignment')
      .lean();

    if (!module) {
      return res.status(404).json({ 
        success: false,
        message: 'Module not found' 
      });
    }

    // Check if user is enrolled or is the instructor
    const isEnrolled = module.course.students.some(studentId => 
      studentId.toString() === userId.toString()
    );
    const isInstructor = module.course.instructor.toString() === userId.toString();

    if (!isEnrolled && !isInstructor) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized to access this module' 
      });
    }

    res.status(200).json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Get module details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

export const generateModules = async (req, res) => {
  const instructor = req.userId;
  try {
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);

    // Verify course exists and user is the instructor
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

   

    const description = course.description;
    
    // Call Flask API to generate modules
    const response = await axios.post(`${process.env.FLASK_URL}/modules`, { description }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Create modules with associated quizzes and assignments
    const generatedModules = await Promise.all(
      response.data.modules.map(async (moduleData) => {
        // Create quiz for the module
        const newQuiz = new QuizModel({
          moduleId: null, // Will be updated later
          questions: [],
          passingScore: 0
        });
        await newQuiz.save();

        // Create assignment for the module
        const newAssignment = new AssignmentModel({
          moduleId: null, // Will be updated later
          description: '',
          deadline: null,
          criteria: ''
        });
        await newAssignment.save();

        // Create new module
        const newModule = new ModuleModel({
          title: moduleData.title,
          description: moduleData.description,
          order: moduleData.order,
          course: courseId,
          contents: {
            quiz: newQuiz._id,
            assignment: newAssignment._id
          }
        });

        // Save the module
        const savedModule = await newModule.save();

        // Update quiz and assignment with module reference
        await QuizModel.findByIdAndUpdate(newQuiz._id, { moduleId: savedModule._id });
        await AssignmentModel.findByIdAndUpdate(newAssignment._id, { moduleId: savedModule._id });

        // Add module to course's modules array
        course.modules.push(savedModule._id);

        // Populate the module with quiz and assignment details
        return await ModuleModel.findById(savedModule._id)
          .populate('contents.quiz')
          .populate('contents.assignment');
      })
    );

    // Save the updated course with new modules
    await course.save();

    res.status(200).json({
      success: true,
      message: "AI generated modules successfully",
      modules: generatedModules,
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