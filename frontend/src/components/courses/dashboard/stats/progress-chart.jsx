"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

// Sample data for the line chart
const generateProgressData = () => {
  const data = []
  let cumulativeProgress = 0

  for (let week = 1; week <= 8; week++) {
    // Progress increases more in the middle weeks
    let weeklyProgress
    if (week <= 2) {
      weeklyProgress = 5 + Math.random() * 5
    } else if (week <= 6) {
      weeklyProgress = 10 + Math.random() * 8
    } else {
      weeklyProgress = 5 + Math.random() * 7
    }

    cumulativeProgress += weeklyProgress
    cumulativeProgress = Math.min(100, cumulativeProgress)

    data.push({
      week: `W${week}`,
      progress: Math.round(cumulativeProgress),
      target: Math.min(100, week * 12.5), // Linear target line
    })
  }

  return data
}

export default function ProgressChart() {
  const [data, setData] = useState([])
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const progressData = generateProgressData()

    // Animate the data
    const animateData = () => {
      const animatedData = []
      for (let i = 0; i < progressData.length; i++) {
        animatedData.push({
          ...progressData[i],
          progress: 0,
          target: progressData[i].target,
        })
      }
      setData(animatedData)

      let step = 0
      const totalSteps = 20

      const interval = setInterval(() => {
        step++

        const newData = animatedData.map((item, index) => ({
          ...item,
          progress: Math.round((progressData[index].progress * step) / totalSteps),
        }))

        setData(newData)

        if (step >= totalSteps) {
          clearInterval(interval)
          setIsAnimating(false)
        }
      }, 50)

      return () => clearInterval(interval)
    }

    animateData()
  }, [])

  const currentProgress = data.length > 0 ? data[data.length - 1].progress : 0
  const targetProgress = data.length > 0 ? data[data.length - 1].target : 0
  const progressDifference = currentProgress - targetProgress

  return (
    <div className="flex flex-col h-full">
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} width={30} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#9ca3af"
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="progress"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 3, fill: "#3b82f6" }}
              activeDot={{ r: 5, fill: "#3b82f6" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <motion.div
          className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{currentProgress}%</p>
        </motion.div>

        <motion.div
          className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="text-xs text-muted-foreground">Target</p>
          <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{targetProgress}%</p>
        </motion.div>

        <motion.div
          className={`p-2 rounded-lg ${progressDifference >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <p className="text-xs text-muted-foreground">Diff</p>
          <p
            className={`text-lg font-bold ${progressDifference >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {progressDifference >= 0 ? "+" : ""}
            {progressDifference}%
          </p>
        </motion.div>
      </div>
    </div>
  )
}