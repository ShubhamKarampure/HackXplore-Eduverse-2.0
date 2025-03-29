"use client"; // Essential for using hooks like useState, useEffect

import { useState } from "react";
import { Loader2, FileText } from "lucide-react"; // Icons for button and loading
import axiosInstance from "@/lib/axiosInstance"; // Your configured Axios instance

// Import necessary components from @react-pdf-viewer
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles for the viewer and its default layout
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Reusable PdfViewer component (kept as is from your original code)
// Ensure its container allows it to expand (added h-full w-full)
const PdfViewer = ({ url }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  return (
    // This div wrapper ensures the Viewer can take up the intended space
    <div className="h-full w-full">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          plugins={[defaultLayoutPluginInstance]}
        />
      </Worker>
    </div>
  );
};

// A dedicated component for the loading animation
const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center space-y-4 text-center p-8">
    {/* Larger, centered spinner */}
    <Loader2 className="h-16 w-16 animate-spin text-blue-600 dark:text-blue-400" />
    <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
      Generating Your PDF Presentation...
    </p>
    <p className="text-md text-slate-500 dark:text-slate-400">
      The AI is working its magic. This might take a moment.
    </p>
    {/* Optional: Add a visual element like animated dots */}
    <div className="flex space-x-1 mt-2">
       <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
       <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
       <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span>
    </div>
  </div>
);

// Main Component Refactored
export function PresentationGenerator({ courseId }) {
  const [topic, setTopic] = useState(""); // Renamed 'content' to 'topic' for clarity
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null); // To display generation errors
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Make sure this is configured in your .env file

  const generatePDF = async () => {
    // Basic validation
    if (!topic.trim()) {
        setError("Please enter a topic for the presentation.");
        return;
    }
    if (!courseId) {
        setError("Course ID is missing. Cannot generate material.");
        return;
    }

    setIsGenerating(true);
    setPdfUrl(null); // Clear previous PDF URL if any
    setError(null);   // Clear previous errors

    try {
      const materialPayload = {
        course_id: courseId,
        topic: topic,
      };

      const response = await axiosInstance.post(
        `${BACKEND_URL}/course/material/generate`, // Ensure this endpoint is correct
        materialPayload
      );

      console.log("API Response:", response); // Log response for debugging

      // --- IMPORTANT ---
      // Adjust the line below based on the *actual* structure of your API response
      // For example, if the URL is directly in response.data.url, use that.
      const generatedPdfUrl = response.data?.material?.material_url;

      if (!generatedPdfUrl) {
        console.error("PDF URL not found in response data:", response.data);
        throw new Error("Received an invalid response from the server (missing PDF URL).");
      }

      setPdfUrl(generatedPdfUrl);

    } catch (err) {
      console.error("Error generating PDF:", err);
      // Provide more specific error feedback if possible
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred. Please try again.";
      setError(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    // Use flex column layout to structure the page
    <div className="flex flex-col min-h-screen container mx-auto py-8 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="text-center mb-8 shrink-0"> {/* shrink-0 prevents header from shrinking */}
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
          AI PPT Generator
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Enter a topic below, and the AI will generate a PPT presentation from study material for you.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-xl mx-auto w-full mb-6 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 shrink-0">
        <label htmlFor="topic-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Presentation Topic
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="topic-input"
            type="text"
            placeholder=""
            className="flex-grow p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating} // Disable input while generating
          />
          <button
            onClick={generatePDF}
            disabled={isGenerating || !topic.trim()} // Disable button if generating or topic is empty
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Generate PPT
              </>
            )}
          </button>
        </div>
        {/* Display Error Messages */}
        {error && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-3">{error}</p>
        )}
      </div>

      {/* Content Area: Shows Loading Animation or PDF Viewer */}
      {/* flex-grow allows this section to fill remaining vertical space */}
      <div className="flex-grow flex items-center justify-center w-full max-w-5xl mx-auto mt-4">
        {isGenerating ? (
          // Show the loading animation component when generating
          <LoadingAnimation />
        ) : pdfUrl ? (
          // Show the PDF Viewer when URL is available
          // Set a specific height or use flex-grow properties carefully
          // h-[70vh] gives it a large portion of the viewport height
          <div className="w-full h-[70vh] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
             <PdfViewer url={pdfUrl} />
          </div>
        ) : (
          // Initial state or message when no PDF is loaded/generated yet
          <div className="text-center text-slate-500 dark:text-slate-400 p-8">
            <p>Your generated PPT will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PresentationGenerator;