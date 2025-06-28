"use client"

import { motion } from "framer-motion"
import { Globe, Zap, Award, ArrowUpRight } from "lucide-react"

const solutions = [
  {
    icon: <Globe className="w-8 h-8 text-brand-500" />,
    title: "Global Learning Platform",
    description: "Connect students and educators across geographical boundaries.",
  },
  {
    icon: <Zap className="w-8 h-8 text-brand-500" />,
    title: "Adaptive Learning",
    description: "Personalized learning paths tailored to individual student needs.",
  },
  {
    icon: <Award className="w-8 h-8 text-brand-500" />,
    title: "Performance Tracking",
    description: "Comprehensive analytics to monitor and improve student progress.",
  },
]

export const SolutionsSection = () => {
  return (
    <div id="solutions" className="py-24 bg-gray-50 dark:bg-gray-900/50 relative">
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
              <Zap className="mr-1 w-4 h-4" /> Smart Solutions
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Innovative Educational Solutions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Empowering educators and students with cutting-edge technological innovations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-brand-100 dark:bg-brand-900/30 rounded-full blur-lg transform -translate-y-1 translate-x-1 opacity-70 group-hover:scale-110 transition-transform duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 border border-gray-100 dark:border-gray-700">
                  {solution.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors duration-300">
                {solution.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{solution.description}</p>
              <motion.a
                href="#"
                className="inline-flex items-center mt-6 text-brand-500 font-medium"
                whileHover={{ x: 5 }}
              >
                Learn more <ArrowUpRight className="ml-1 w-4 h-4" />
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
