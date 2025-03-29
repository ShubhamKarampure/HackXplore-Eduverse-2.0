"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { motion } from "framer-motion"

// Sample data for the pie chart
const initialData = [
  { name: "Active", value: 0, color: "#3b82f6" },
  { name: "Occasional", value: 0, color: "#10b981" },
  { name: "Inactive", value: 0, color: "#f59e0b" },
  { name: "At Risk", value: 0, color: "#ef4444" },
]

const finalData = [
  { name: "Active", value: 12, color: "#3b82f6" },
  { name: "Occasional", value: 8, color: "#10b981" },
  { name: "Inactive", value: 3, color: "#f59e0b" },
  { name: "At Risk", value: 2, color: "#ef4444" },
]

export default function EngagementChart() {
  const [data, setData] = useState(initialData)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Animate the data values
    const animationDuration = 1500
    const startTime = Date.now()

    const animateData = () => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / animationDuration, 1)

      const newData = initialData.map((item, index) => ({
        ...item,
        value: Math.floor(progress * finalData[index].value),
      }))

      setData(newData)

      if (progress < 1) {
        requestAnimationFrame(animateData)
      } else {
        setIsAnimating(false)
      }
    }

    animateData()

    return () => {
      setIsAnimating(false)
    }
  }, [])

  const totalStudents = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1500}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${value} students (${Math.round((Number(value) / totalStudents) * 100)}%)`,
                "Count",
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            className="flex items-center justify-between p-2 rounded-md"
            style={{ backgroundColor: `${item.color}20` }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="font-semibold text-sm">{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}