"use client"

import { motion } from "framer-motion"
import { Brain, Calendar, BookOpen, Star, ArrowUpRight } from "lucide-react"
import { TiltCard } from "@/components/ui/tilt-card"

const features = [
  {
    icon: <Brain className="w-8 h-8 text-brand-500" />,
    title: "AI Grading Assistant",
    description: "Automate grading with NLP and pattern recognition for instant, accurate feedback.",
  },
  {
    icon: <Calendar className="w-8 h-8 text-brand-500" />,
    title: "Smart Scheduling Engine",
    description: "Optimize timetables, resolve conflicts, and sync updates automatically.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-brand-500" />,
    title: "Dynamic Course Builder",
    description: "Generate course materials using AI-curated resources, reducing preparation time.",
  },
]

export const FeaturesSection = () => {
  return (
    <div id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200">
              <Star className="mr-1 w-4 h-4" /> Powerful Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Comprehensive AI-Driven Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            EduVerse integrates cutting-edge AI technologies to transform educational experiences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <TiltCard key={index} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl h-full border border-gray-100 dark:border-gray-700"
              >
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-brand-100 dark:bg-brand-900/30 rounded-full blur-lg transform -translate-y-1 translate-x-1 opacity-70" />
                  <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 border border-gray-100 dark:border-gray-700">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                <motion.a
                  href="#"
                  className="inline-flex items-center mt-6 text-brand-500 font-medium"
                  whileHover={{ x: 5 }}
                >
                  Learn more <ArrowUpRight className="ml-1 w-4 h-4" />
                </motion.a>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  )
}
