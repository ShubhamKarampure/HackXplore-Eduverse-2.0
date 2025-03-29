"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, FileText, Link as LinkIcon, Download, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react"
import { pdfjs } from 'pdfjs-dist'
import dynamic from "next/dynamic";

export function PresentationGenerator() {

  useEffect(() => {
    import("react-pdf").then((pdf) => {
      pdf.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdf.pdfjs.version}/pdf.worker.min.js`;
    });
  }, []);

  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("input")
  const [pdfData, setPdfData] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [pdfDocument, setPdfDocument] = useState(null)
  const [pageImages, setPageImages] = useState([])
  const [pdfTitle, setPdfTitle] = useState("Generated Presentation")
  const pdfViewerRef = useRef(null)
  const canvasRef = useRef(null)
  
  const generatePDF = async () => {
    if (!content.trim()) return

    setIsGenerating(true)

    try {
      // In a real implementation, this would be an API call to your backend
      // Mock API call simulation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock response from server with PDF URL
      const mockResponse = {
        pdfId: Math.random().toString(36).substring(2, 15),
        viewUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf", // Sample PDF URL
        downloadUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
        title: "Generated Presentation"
      }
      
      setPdfData(mockResponse)
      setPdfTitle(mockResponse.title)
      setActiveTab("preview")
      
      // Load the PDF once we have the URL
      loadPDF(mockResponse.viewUrl)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const loadPDF = async (url) => {
    try {
      // Load the PDF document
      const loadingTask = pdfjs.getDocument(url)
      const pdf = await loadingTask.promise
      
      setPdfDocument(pdf)
      setTotalPages(pdf.numPages)
      setCurrentPage(1)
      
      // Generate thumbnails for all pages
      const images = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const image = await renderPageToImage(pdf, i, 100) // Small size for thumbnails
        images.push(image)
      }
      setPageImages(images)
      
      // Render the first page
      renderPage(pdf, 1)
    } catch (error) {
      console.error("Error loading PDF:", error)
    }
  }
  
  const renderPageToImage = async (pdf, pageNumber, scale = 100) => {
    try {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: scale / 100 })
      
      // Create an offscreen canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      // Render the page to the canvas
      await page.render({ canvasContext: context, viewport }).promise
      
      return canvas.toDataURL()
    } catch (error) {
      console.error("Error rendering page to image:", error)
      return null
    }
  }
  
  const renderPage = async (pdfDoc, pageNumber) => {
    if (!pdfDoc) return
    
    try {
      const page = await pdfDoc.getPage(pageNumber)
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      // Calculate scale to fit the canvas
      const containerWidth = pdfViewerRef.current.clientWidth - 48 // Adjust for padding
      const viewport = page.getViewport({ scale: 1 })
      const scale = containerWidth / viewport.width
      const scaledViewport = page.getViewport({ scale })
      
      // Set canvas dimensions
      canvas.height = scaledViewport.height
      canvas.width = scaledViewport.width
      
      // Render the page
      await page.render({ canvasContext: context, viewport: scaledViewport }).promise
    } catch (error) {
      console.error("Error rendering page:", error)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      renderPage(pdfDocument, newPage)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      renderPage(pdfDocument, newPage)
    }
  }
  
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      renderPage(pdfDocument, pageNumber)
    }
  }

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (pdfViewerRef.current?.requestFullscreen) {
        pdfViewerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullScreen(!isFullScreen)
  }
  
  // Re-render current page if window is resized
  useEffect(() => {
    const handleResize = () => {
      if (pdfDocument && currentPage) {
        renderPage(pdfDocument, currentPage)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pdfDocument, currentPage])
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
      
      // Re-render the current page after fullscreen change
      if (pdfDocument && currentPage) {
        setTimeout(() => renderPage(pdfDocument, currentPage), 100)
      }
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [pdfDocument, currentPage])

  return (
    <div className="container mx-auto py-8 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">AI Document Generator</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Convert your content into professional PDF presentations with just a few clicks
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <TabsTrigger value="input" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 py-3">
              <FileText className="mr-2 h-4 w-4" />
              Content Input
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!pdfData} className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 py-3">
              <LinkIcon className="mr-2 h-4 w-4" />
              PDF Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <Card className="p-6 shadow-lg border-0 bg-white dark:bg-slate-800">
              <h2 className="text-xl font-semibold mb-4">Enter Your Content</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Type or paste your content below. Separate pages with blank lines. The first line of each section
                will be used as the page title.
              </p>
              <div className="min-h-[300px] mb-4 relative">
                <textarea
                  placeholder="Enter your content here..."
                  className="w-full min-h-[300px] p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={generatePDF}
                  disabled={isGenerating || !content.trim()}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      Generate PDF
                    </>
                  )}
                </button>
              </div>
            </Card>

            <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-medium mb-2 text-slate-800 dark:text-slate-200">Example Format:</h3>
              <pre className="bg-white dark:bg-slate-900 p-4 rounded-md overflow-x-auto border border-slate-200 dark:border-slate-700 text-sm">
                {`Introduction to Photosynthesis
Photosynthesis is the process used by plants to convert light energy into chemical energy.
Plants use this process to create their own food.

Key Components
Chlorophyll - The green pigment that captures light energy
Carbon Dioxide - Absorbed from the air
Water - Absorbed through the roots
Sunlight - Provides energy for the reaction

The Process
1. Light energy is captured by chlorophyll
2. Water molecules are split, releasing oxygen
3. Carbon dioxide is converted into glucose
4. Oxygen is released as a byproduct`}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            {pdfData && (
              <div className="space-y-6">
                {/* PDF Actions */}
                <Card className="p-4 shadow-lg border-0 bg-white dark:bg-slate-800">
                  <div className="flex flex-wrap gap-3 justify-between items-center">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">{pdfTitle}</h3>
                    <div className="flex gap-2">
                      <a 
                        href={pdfData?.downloadUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors text-sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                </Card>

                {/* PDF Viewer */}
                <div ref={pdfViewerRef} className="relative">
                  <Card className="shadow-lg border-0 bg-white dark:bg-slate-800 overflow-hidden">
                    {/* PDF Navigation Controls */}
                    <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={prevPage}
                          disabled={currentPage <= 1}
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button 
                          onClick={nextPage}
                          disabled={currentPage >= totalPages}
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                      <button 
                        onClick={toggleFullScreen}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {/* PDF Content */}
                    <div className="flex justify-center p-6 bg-slate-200 dark:bg-slate-900 min-h-[70vh]">
                      {!pdfDocument ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : (
                        <canvas 
                          ref={canvasRef} 
                          className="shadow-lg"
                        ></canvas>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Thumbnails */}
                <div className="overflow-x-auto py-4">
                  <div className="flex gap-4 min-w-max px-2">
                    {pageImages.map((thumbnail, index) => (
                      <div 
                        key={index} 
                        className={`cursor-pointer transition-all ${currentPage === index + 1 ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'}`}
                        onClick={() => goToPage(index + 1)}
                      >
                        <div className="w-24 aspect-[210/297] bg-white dark:bg-slate-800 shadow overflow-hidden rounded-md">
                          {thumbnail ? (
                            <img 
                              src={thumbnail} 
                              alt={`Page ${index + 1}`} 
                              className="w-full h-full object-contain" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="text-center text-xs mt-1 text-slate-500 dark:text-slate-400">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PresentationGenerator;