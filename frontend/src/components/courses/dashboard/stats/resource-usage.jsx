"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Sample data for the resource usage chart
const resourceData = [
  { name: "Videos", views: 120, downloads: 45, color: "#3b82f6" },
  { name: "PDFs", views: 85, downloads: 62, color: "#10b981" },
  { name: "Quizzes", views: 97, downloads: 0, color: "#f59e0b" },
  { name: "Assignments", views: 65, downloads: 38, color: "#ef4444" },
  { name: "Code Samples", views: 72, downloads: 51, color: "#8b5cf6" },
]

export default function ResourceUsage() {
  const [data, setData] = useState([])

  useEffect(() => {
    // Animate the data
    const animateData = () => {
      setData([])

      resourceData.forEach((item, index) => {
        setTimeout(() => {
          setData((prev) => [...prev, item])
        }, index * 300)
      })
    }

    animateData()
  }, [])

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="views" name="Views" fill="#3b82f6" />
          <Bar dataKey="downloads" name="Downloads" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">Views</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Downloads</span>
        </div>
      </div>
    </div>
  )
}

