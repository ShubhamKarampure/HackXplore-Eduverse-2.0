import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import axios from "axios";
import StudyMaterialModel from "../models/studyMaterialModel.js";
import { uploadOnCloud } from "../utils/cloudinary.js";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateAndSavePPT = async (req, res) => {
  try {
    const { teacher_id, course_id, topic } = req.body;
    
    // Validate required fields
    if (!teacher_id || !course_id || !topic) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: teacher_id, course_id, or topic",
      });
    }

    // Make a request to the Flask API with responseType: 'arraybuffer' for binary data
    const flaskResponse = await axios.post(
      `${process.env.FLASK_URL}/materials/generate`,
      {
        topic,
        teacher_id,
        output_format: "pdf",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer" // This is crucial for binary data
      }
    );

    // Log only the size, not the content (which is binary)
    console.log(`Received binary data of size: ${flaskResponse.data.byteLength} bytes`);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save the received PDF file locally
    const pdfFileName = `course_${course_id}_teacher_${teacher_id}.pdf`;
    const pdfFilePath = path.join(tempDir, pdfFileName);
    fs.writeFileSync(pdfFilePath, flaskResponse.data);

    console.log(`PDF saved to: ${pdfFilePath}`);
    
    // Check if the file exists and has content
    if (fs.existsSync(pdfFilePath)) {
      const stats = fs.statSync(pdfFilePath);
      console.log(`PDF file size: ${stats.size} bytes`);
      
      if (stats.size > 0) {
        // Upload the PDF file to Cloudinary
        try {
          const uploadResult = await uploadOnCloud(pdfFilePath, "course-materials");
          console.log("Upload result:", uploadResult);

          if (uploadResult && uploadResult.url) {
            // Save the material in the database
            const studyMaterial = new StudyMaterialModel({
              teacher_id,
              course_id,
              material_url: uploadResult.url,
              format: "pdf",
            });

            await studyMaterial.save();
            console.log("Study material saved in database");


            return res.status(201).json({
              success: true,
              message: "PDF generated and saved successfully",
              material: studyMaterial,
            });
          } else {
            throw new Error("Invalid upload result from Cloudinary");
          }
        } catch (uploadError) {
          console.error("Error uploading to Cloudinary:", uploadError);
          throw new Error(`Cloudinary upload failed: ${uploadError.message}`);
        }
      } else {
        throw new Error("Generated PDF file is empty");
      }
    } else {
      throw new Error("Failed to save PDF file");
    }
  } catch (error) {
    console.error("Error generating and saving PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate and save PDF",
      error: error.message,
    });
  }
};

export const getMaterialsByCourseTutor = async (req, res) => {
  try {
    const { course_id, teacher_id } = req.body;

    // Validate required parameters
    if (!course_id || !teacher_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: course_id and teacher_id are required",
      });
    }

    // Find all materials matching the course_id and teacher_id
    const materials = await StudyMaterialModel.find({
      course_id,
      teacher_id,
    }).sort({ createdAt: -1 }); // Sort by creation date, newest first

    // If no materials found, return appropriate message
    if (!materials || materials.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No study materials found for the specified course and teacher",
      });
    }

    // Return the materials
    return res.status(200).json({
      success: true,
      message: "Study materials retrieved successfully",
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error("Error retrieving study materials:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve study materials",
      error: error.message,
    });
  }
};


