import { ModuleModel } from "../models/moduleModel.js";
import { CourseModel } from "../models/courseModel.js";
import axios from "axios";

// Create a new module
export const createModule = async (req, res) => {
  try {
    const { course: courseId } = req.body;
    
    // Validate course exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Create new module
    const newModule = new ModuleModel({ ...req.body });
    const savedModule = await newModule.save();

    // Add module to course's modules array
    course.modules.push(savedModule._id);
    await course.save();

    res.status(201).json(savedModule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all modules
export const getAllModules = async (req, res) => {
  try {
    const modules = await ModuleModel.find().populate("course quiz assignment");
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single module by ID
export const getModuleById = async (req, res) => {
  try {
    const module = await ModuleModel.findById(req.params.id).populate("course quiz assignment");
    if (!module) return res.status(404).json({ message: "Module not found" });
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a module by ID
export const updateModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const { course: newCourseId } = req.body;

    // Find the current module
    const currentModule = await ModuleModel.findById(moduleId);
    if (!currentModule) return res.status(404).json({ message: "Module not found" });

    // If course is being changed
    if (newCourseId && newCourseId !== currentModule.course.toString()) {
      // Remove module from old course
      if (currentModule.course) {
        await CourseModel.findByIdAndUpdate(
          currentModule.course, 
          { $pull: { modules: moduleId } }
        );
      }

      // Add module to new course
      const newCourse = await CourseModel.findById(newCourseId);
      if (!newCourse) return res.status(404).json({ message: "New course not found" });
      
      newCourse.modules.push(moduleId);
      await newCourse.save();
    }

    // Update the module
    const updatedModule = await ModuleModel.findByIdAndUpdate(
      moduleId, 
      req.body, 
      { new: true }
    );

    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a module by ID
export const deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    
    // Find the module to delete
    const deletedModule = await ModuleModel.findByIdAndDelete(moduleId);
    if (!deletedModule) return res.status(404).json({ message: "Module not found" });

    // Remove module reference from the associated course
    if (deletedModule.course) {
      await CourseModel.findByIdAndUpdate(
        deletedModule.course, 
        { $pull: { modules: moduleId } }
      );
    }

    res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate modules 
export const generateModules = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const description = course.description;

    const response = await axios.post(`${process.env.FLASK_URL}/modules`, { description }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Create modules and associate with the course
    const generatedModules = await Promise.all(
      response.data.modules.map(async (moduleData) => {
        // Create new module
        const newModule = new ModuleModel({
          title: moduleData.title,
          description: moduleData.description,
          order: moduleData.order,
          course: courseId, // Associate module with the course
        });

        // Save the module
        const savedModule = await newModule.save();

        // Add module to course's modules array
        course.modules.push(savedModule._id);

        return {
          ...savedModule.toObject(),
        };
      })
      );
      

    // Save the updated course with new modules
    await course.save();
    
    res.status(200).json({
      success: true,
      message: "AI generated modules successfully",
      module:  response.data.modules,
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