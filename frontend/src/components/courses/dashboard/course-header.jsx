"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Users, BookOpen, Award } from "lucide-react"

const courseData = {
  _id: "67e5c8d70b334e947778c738",
  name: "Introduction to AI",
  instructor: {
    _id: "67e4cd88db95232462e03ed0",
    email: "vipul@gmail.com",
    firstName: "Vipul",
    lastName: "Kushwaha",
  },
  description:
    "This beginner-friendly course is designed to introduce the basics of Artificial Intelligence (AI), with a special focus on Machine Learning (ML) and Deep Learning (DL). By the end of the course, learners will have a foundational understanding of these technologies and how they power modern AI applications.",
  enrollKey: "12345",
  image: {
    url: "https://res.cloudinary.com/dim3hi0jc/image/upload/v1743112408/eqbu5ayy4lqx66kdwcv8.webp",
    publicId: "eqbu5ayy4lqx66kdwcv8",
  },
  students: ["67e479d012f898b47fb7509f"],
  semester: 5,
}

export default function CourseHeader() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden">
        <div className="md:flex">
          <motion.div
            className="md:w-1/3 relative h-64 md:h-auto"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <img
              src={courseData.image.url || "/placeholder.svg"}
              alt={courseData.name}
              className="w-full h-full object-cover"
            />
            
          </motion.div>

          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{courseData.name}</h1>
                <p className="text-muted-foreground mb-4">
                  Instructor: {courseData.instructor.firstName} {courseData.instructor.lastName}
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Semester {courseData.semester}
              </Badge>
            </div>

            <p className="mb-6">{courseData.description}</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 bg-primary/5 rounded-lg">
                <Users className="h-6 w-6 text-primary mb-2" />
                <span className="text-lg font-semibold">25</span>
                <span className="text-xs text-muted-foreground">Students</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-primary/5 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary mb-2" />
                <span className="text-lg font-semibold">8</span>
                <span className="text-xs text-muted-foreground">Modules</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-primary/5 rounded-lg">
                <Award className="h-6 w-6 text-primary mb-2" />
                <span className="text-lg font-semibold">4.8</span>
                <span className="text-xs text-muted-foreground">Rating</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

