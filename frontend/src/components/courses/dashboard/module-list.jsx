"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, CheckCircle, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const moduleData = [
  {
    _id: "67e61fd06a08337244d17a99",
    title: "Introduction to Artificial Intelligence",
    description: "Understanding the basics of AI, its history, and its applications.",
    order: 1,
    progress: 100,
    status: "completed",
  },
  {
    _id: "67e61fd06a08337244d17a9a",
    title: "Mathematics for Machine Learning",
    description: "Reviewing the mathematical concepts required for ML, including linear algebra and calculus.",
    order: 2,
    progress: 85,
    status: "in-progress",
  },
  {
    _id: "67e61fd06a08337244d17a9b",
    title: "Supervised Learning",
    description: "Learning the fundamentals of supervised learning, including regression and classification.",
    order: 3,
    progress: 60,
    status: "in-progress",
  },
  {
    _id: "67e61fd06a08337244d17a9c",
    title: "Unsupervised Learning",
    description: "Understanding unsupervised learning techniques, including clustering and dimensionality reduction.",
    order: 4,
    progress: 30,
    status: "in-progress",
  },
  {
    _id: "67e61fd06a08337244d17a9d",
    title: "Deep Learning Fundamentals",
    description: "Learning the basics of deep learning, including neural networks and backpropagation algorithm.",
    order: 5,
    progress: 10,
    status: "in-progress",
  },
  {
    _id: "67e61fd06a08337244d17a9e",
    title: "Convolutional Neural Networks",
    description: "Understanding the application of CNNs in image and signal processing.",
    order: 6,
    progress: 0,
    status: "upcoming",
  },
  {
    _id: "67e61fd06a08337244d17a9f",
    title: "Recurrent Neural Networks",
    description: "Learning the application of RNNs in sequence processing and time series analysis.",
    order: 7,
    progress: 0,
    status: "upcoming",
  },
  {
    _id: "67e61fd06a08337244d17aa0",
    title: "Project Development and Deployment",
    description: "Applying AI and ML concepts to real-world projects and deploying them using popular frameworks.",
    order: 8,
    progress: 0,
    status: "upcoming",
  },
]

export default function ModuleList() {
  const [expandedModule, setExpandedModule] = useState(null)

  const toggleModule = (id) => {
    setExpandedModule(expandedModule === id ? null : id)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "in-progress":
        return "text-blue-500"
      case "upcoming":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "upcoming":
        return <Clock className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {moduleData.map((module, index) => (
        <motion.div
          key={module._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="border rounded-lg overflow-hidden"
        >
          <div
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => toggleModule(module._id)}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(module.status)}
              <span className="font-medium">
                {module.order}. {module.title}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block w-32">
                <Progress value={module.progress} className="h-2" />
                <p className="text-xs text-right mt-1">{module.progress}% complete</p>
              </div>
              {expandedModule === module._id ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>

          <AnimatePresence>
            {expandedModule === module._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t">
                  <p className="text-muted-foreground">{module.description}</p>

                  <div className="mt-4 md:hidden">
                    <Progress value={module.progress} className="h-2" />
                    <p className="text-xs text-right mt-1">{module.progress}% complete</p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button className="text-sm text-primary hover:underline">View Module Details</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

