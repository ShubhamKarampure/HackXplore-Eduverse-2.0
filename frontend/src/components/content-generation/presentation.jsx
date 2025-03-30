"use client"

import { useState, useEffect } from "react"
import { Loader2, FileText, Download, Eye, Plus, Search, X, ChevronLeft } from "lucide-react"
import axiosInstance from "@/lib/axiosInstance"
import { useAlert } from "@/context/AlertContext"

// Import necessary components from @react-pdf-viewer
import { Viewer, Worker } from "@react-pdf-viewer/core"
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout"

// Import styles for the viewer and its default layout
import "@react-pdf-viewer/core/lib/styles/index.css"
import "@react-pdf-viewer/default-layout/lib/styles/index.css"

// Reusable PdfViewer component
const PdfViewer = ({ url }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin()
  return (
    <div className="h-full w-full">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
        <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  )
}

// A dedicated component for the loading animation
const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center space-y-4 text-center p-8">
    <div className="relative h-20 w-20">
      <div className="absolute inset-0 flex items-center justify-center">
        <FileText className="h-10 w-10 text-primary/50" />
      </div>
      <Loader2 className="h-20 w-20 animate-spin text-primary" />
    </div>
    <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Creating Your Presentation</p>
    <p className="text-md text-slate-500 dark:text-slate-400 max-w-md">
      Our AI is working its magic to generate a high-quality presentation on your topic.
    </p>
    <div className="flex space-x-2 mt-2">
      <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
    </div>
  </div>
)

// Material Card Component
const MaterialCard = ({ material, onPreview, onDownload }) => {
  // Generate a random pastel color for the card thumbnail
  const colors = [
    "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
    "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
    "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
    "from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900",
    "from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900",
    "from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900",
    "from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900",
  ]

  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      {/* Thumbnail Preview */}
      <div className={`aspect-video bg-gradient-to-br ${randomColor} flex items-center justify-center p-4 group-hover:saturate-150 transition-all duration-300`}>
        <FileText className="w-16 h-16 text-slate-600 dark:text-slate-300 opacity-75 transition-transform group-hover:scale-110 duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 h-12">{material.topic}</h3>

        {/* Actions */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => onPreview(material.url)}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            aria-label={`Preview ${material.topic}`}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </button>

          <button
            onClick={() => onDownload(material.url, material.topic)}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 transition-colors"
            aria-label={`Download ${material.topic}`}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

// Create Presentation Card
const CreatePresentationCard = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 transition-all duration-300 hover:shadow-lg hover:border-primary dark:hover:border-primary h-full flex flex-col items-center justify-center p-6 disabled:opacity-50 disabled:pointer-events-none group"
  >
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
      <Plus className="w-8 h-8 text-primary" />
    </div>
    <h3 className="font-medium text-slate-800 dark:text-slate-200 text-center">Create New Presentation</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2 max-w-[200px]">
      Generate an AI-powered presentation in minutes
    </p>
  </button>
)

// No Results Component
const NoResults = ({ searchTerm }) => (
  <div className="col-span-full p-12 text-center rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700">
    <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
      <Search className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
      No presentations found
    </h3>
    {searchTerm ? (
      <p className="text-slate-500 dark:text-slate-400">
        No presentations matching "<span className="font-medium">{searchTerm}</span>" were found.
      </p>
    ) : (
      <p className="text-slate-500 dark:text-slate-400">
        You haven't created any presentations yet. Create your first one!
      </p>
    )}
  </div>
)

// Main Component Refactored
export function PresentationGenerator({ courseId }) {
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [error, setError] = useState(null)
  const [existingMaterials, setExistingMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  const { showAlert, alertTypes } = useAlert()

  useEffect(() => {
    // Fetch previous material urls
    const fetchMaterials = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.post(`${BACKEND_URL}/course/material/get`, { course_id: courseId })
        if (response.data && response.data.success) {
          // Assuming the API returns materials in the proper format
          setExistingMaterials(response.data.materials || [])
        } else {
          console.log("No materials found or unexpected response format:", response)
          setExistingMaterials([])
        }
      } catch (error) {
        console.error("Materials fetch error:", error)
        setExistingMaterials([])
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchMaterials()
    }
  }, [courseId])

  const generatePDF = async () => {
    // Basic validation
    if (!topic.trim()) {
      setError("Please enter a topic for the presentation.")
      return
    }
    if (!courseId) {
      setError("Course ID is missing. Cannot generate material.")
      return
    }

    setIsGenerating(true)
    setPdfUrl(null) // Clear previous PDF URL if any
    setError(null) // Clear previous errors

    try {
      const materialPayload = {
        course_id: courseId,
        topic: topic,
      }

      const response = await axiosInstance.post(`${BACKEND_URL}/course/material/generate`, materialPayload)

      console.log("API Response:", response)

      if (response.data && response.data.success) {
        // Find the material in the response
        const material = response.data.material

        // Find the newly added material URL from the material_material array
        // We assume the latest added material will be the last one in the array
        if (material && material.material_material && material.material_material.length > 0) {
          const newMaterial = material.material_material.find((m) => m.topic === topic)

          if (newMaterial) {
            setPdfUrl(newMaterial.url)

            // Update the existing materials list to include the new one
            // This avoids having to make another API call
            setExistingMaterials((prevMaterials) => {
              // Check if we already have this course material record
              const existingIndex = prevMaterials.findIndex((m) => m._id === material._id)

              if (existingIndex >= 0) {
                // Update existing material entry
                const updatedMaterials = [...prevMaterials]
                updatedMaterials[existingIndex] = material
                return updatedMaterials
              } else {
                // Add new material entry
                return [...prevMaterials, material]
              }
            })

            showAlert("Presentation generated successfully!", alertTypes.SUCCESS)
            setShowCreateForm(false) // Hide the form after successful generation
          } else {
            throw new Error("Generated material not found in response.")
          }
        } else {
          throw new Error("No material data found in response.")
        }
      } else {
        throw new Error(response.data?.message || "Failed to generate presentation.")
      }
    } catch (err) {
      // Provide more specific error feedback if possible
      const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred. Please try again."
      showAlert(`Failed to generate PDF: ${errorMessage}`, alertTypes.ERROR)
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = (url) => {
    setPdfUrl(url)
  }

  const handleDownload = (url, topicName) => {
    // Create a temp link to download the file
    const link = document.createElement("a")
    link.href = url
    link.download = `${topicName.replace(/\s+/g, "-").toLowerCase()}.pdf` // Format filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter materials based on search term
  const filteredMaterials = existingMaterials.flatMap((material) =>
    material.material_material
      .filter((item) => item.topic.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((item) => ({
        ...item,
        materialId: material._id,
      })),
  )

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600 dark:from-primary dark:to-violet-400 inline-block">
            AI Presentation Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Create professional-quality presentations with the power of AI
          </p>
        </div>

        {/* Create Form (Conditionally Rendered) */}
        {showCreateForm && (
          <div className="max-w-xl mx-auto w-full mb-12 p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="mr-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Go back"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </button>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">New Presentation</h2>
              </div>
            </div>

            <label htmlFor="topic-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What would you like to create a presentation about?
            </label>
            <div className="mb-6">
              <input
                id="topic-input"
                type="text"
                placeholder="Enter a topic, subject or title..."
                className="w-full p-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 text-slate-800 dark:text-slate-200"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
              {/* Error Messages */}
              {error && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
                  {error}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                For best results, be specific about the subject matter and target audience
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={generatePDF}
                disabled={isGenerating || !topic.trim()}
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Presentation...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Presentation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Materials Gallery Section */}
        {!pdfUrl && !isGenerating && (
          <div className="w-full max-w-6xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Your Presentations</h2>

              {/* Search and Create Controls */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search presentations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                </div>

                {!showCreateForm && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors duration-200 ease-in-out whitespace-nowrap shadow-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Presentation
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-12 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <p className="text-slate-600 dark:text-slate-300">Loading your presentations...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Create Card (only show when not in create mode and no search term) */}
                {!showCreateForm && !searchTerm && (
                  <CreatePresentationCard onClick={() => setShowCreateForm(true)} disabled={isGenerating} />
                )}

                {/* Material Cards */}
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((item, index) => (
                    <MaterialCard
                      key={`${item.materialId}-${index}`}
                      material={item}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                    />
                  ))
                ) : (
                  <NoResults searchTerm={searchTerm} />
                )}
              </div>
            )}
          </div>
        )}

        {/* PDF Viewer Section */}
        {(isGenerating || pdfUrl) && (
          <div className="w-full max-w-6xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {isGenerating ? "Generating Presentation..." : "Presentation Preview"}
                </h2>

                {pdfUrl && !isGenerating && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(pdfUrl, topic || "presentation")}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Download
                    </button>
                    <button
                      onClick={() => setPdfUrl(null)}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Close Preview
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full h-[70vh]">
                {isGenerating ? (
                  <LoadingAnimation />
                ) : pdfUrl ? (
                  <PdfViewer url={pdfUrl} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                    <p>Select a presentation to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PresentationGenerator