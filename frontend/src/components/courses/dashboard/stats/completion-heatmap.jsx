"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// Sample data for the heatmap
const moduleNames = [
  "Intro to AI",
  "Math for ML",
  "Supervised Learning",
  "Unsupervised Learning",
  "Deep Learning",
  "CNNs",
  "RNNs",
  "Project Dev",
]

const weekdays = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]

// Generate random completion data (0-100%)
const generateHeatmapData = () => {
  const data = []
  for (let i = 0; i < moduleNames.length; i++) {
    const row = []
    for (let j = 0; j < weekdays.length; j++) {
      // Earlier modules have higher completion rates in earlier weeks
      const baseValue = Math.max(0, 100 - Math.abs(i - j) * 25)
      const randomVariation = Math.random() * 20 - 10 // -10 to +10
      row.push(Math.min(100, Math.max(0, baseValue + randomVariation)))
    }
    data.push(row)
  }
  return data
}

const getColorForValue = (value) => {
  // Color gradient from light to dark
  if (value < 10) return "bg-blue-50 dark:bg-blue-900/20"
  if (value < 30) return "bg-blue-100 dark:bg-blue-800/30"
  if (value < 50) return "bg-blue-200 dark:bg-blue-700/40"
  if (value < 70) return "bg-blue-300 dark:bg-blue-600/60"
  if (value < 90) return "bg-blue-400 dark:bg-blue-500/80"
  return "bg-blue-500 dark:bg-blue-400"
}

export default function CompletionHeatmap() {
  const [heatmapData, setHeatmapData] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setHeatmapData(generateHeatmapData())
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return <div className="h-[400px] flex items-center justify-center">Loading heatmap data...</div>
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="flex mb-2">
          <div className="w-32"></div>
          {weekdays.map((day, index) => (
            <div key={index} className="flex-1 text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        {moduleNames.map((module, moduleIndex) => (
          <motion.div
            key={moduleIndex}
            className="flex mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: moduleIndex * 0.05 }}
          >
            <div className="w-32 pr-2 flex items-center text-sm">{module}</div>
            {heatmapData[moduleIndex]?.map((value, dayIndex) => (
              <motion.div
                key={dayIndex}
                className={`flex-1 h-12 m-1 rounded-md flex items-center justify-center ${getColorForValue(value)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: moduleIndex * 0.05 + dayIndex * 0.03 }}
              >
                <span className="text-xs font-medium">{Math.round(value)}%</span>
              </motion.div>
            ))}
          </motion.div>
        ))}

        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs">Low</span>
            <div className="flex space-x-1">
              <div className="w-6 h-4 bg-blue-50 dark:bg-blue-900/20 rounded"></div>
              <div className="w-6 h-4 bg-blue-100 dark:bg-blue-800/30 rounded"></div>
              <div className="w-6 h-4 bg-blue-200 dark:bg-blue-700/40 rounded"></div>
              <div className="w-6 h-4 bg-blue-300 dark:bg-blue-600/60 rounded"></div>
              <div className="w-6 h-4 bg-blue-400 dark:bg-blue-500/80 rounded"></div>
              <div className="w-6 h-4 bg-blue-500 dark:bg-blue-400 rounded"></div>
            </div>
            <span className="text-xs">High</span>
          </div>
        </div>
      </div>
    </div>
  )
}

