"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Sample data for student activity
const generateActivityData = () => {
  const data = []
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  for (let i = 0; i < daysOfWeek.length; i++) {
    // More activity on weekdays, less on weekends
    const morningFactor = i < 5 ? 0.8 : 0.4
    const afternoonFactor = i < 5 ? 1 : 0.5
    const eveningFactor = i < 5 ? 0.7 : 0.6

    data.push({
      day: daysOfWeek[i],
      morning: Math.floor(Math.random() * 15 + 5) * morningFactor,
      afternoon: Math.floor(Math.random() * 20 + 10) * afternoonFactor,
      evening: Math.floor(Math.random() * 18 + 7) * eveningFactor,
    })
  }

  return data
}

export default function StudentActivity() {
  const [data, setData] = useState([])

  useEffect(() => {
    setData(generateActivityData())
  }, [])

  return (
    <div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="morning" stackId="1" stroke="#8884d8" fill="#8884d8" name="Morning" />
            <Area type="monotone" dataKey="afternoon" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Afternoon" />
            <Area type="monotone" dataKey="evening" stackId="1" stroke="#ffc658" fill="#ffc658" name="Evening" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {["Morning", "Afternoon", "Evening"].map((time, index) => (
          <motion.div
            key={time}
            className="p-3 rounded-lg"
            style={{
              backgroundColor: index === 0 ? "#8884d820" : index === 1 ? "#82ca9d20" : "#ffc65820",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <p className="text-xs text-muted-foreground mb-1">{time} Activity</p>
            <p
              className="text-xl font-bold"
              style={{
                color: index === 0 ? "#8884d8" : index === 1 ? "#82ca9d" : "#ffc658",
              }}
            >
              {data.reduce((sum, item) => sum + item[time.toLowerCase()], 0)} sessions
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

