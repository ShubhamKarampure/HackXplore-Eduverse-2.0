"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronRight, Sparkles, MousePointer, Brain, BarChart3 } from "lucide-react"
import Image from "next/image"

export const HeroSection = () => {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <motion.div
      ref={heroRef}
      style={{ opacity, scale }}
      className="container mx-auto px-4 pt-32 pb-24 text-center relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="inline-block mb-4">
          <motion.span
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Sparkles className="mr-1 w-4 h-4" /> The Future of Education
          </motion.span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
          EduVerse: AI-Powered Education Transformation
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Revolutionize academic workflows with intelligent automation, real-time collaboration, and predictive
          analytics.
        </p>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <motion.button
            className="group bg-brand-500 text-white px-8 py-4 rounded-lg hover:bg-brand-600 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center">
              Get Started
              <motion.span
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              >
                <ChevronRight />
              </motion.span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </motion.button>

          <motion.button
            className="border-2 border-brand-500 text-brand-500 dark:text-brand-400 px-8 py-4 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Watch Demo
            <motion.span
              className="ml-2 bg-brand-100 dark:bg-brand-900/50 rounded-full p-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-500"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </motion.span>
          </motion.button>
        </div>

        {/* Hero image/mockup */}
        <motion.div
          className="relative mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-purple-500/10 mix-blend-overlay" />
            <Image
              src="https://res.cloudinary.com/dim3hi0jc/image/upload/v1743356678/Screenshot_2025-03-30_231308_diicvv.png"
              width={1200}
              height={600}
              alt="EduVerse Platform"
              className="w-full h-auto rounded-xl"
            />

            {/* Animated cursor pointer */}
            <motion.div
              className="absolute"
              initial={{ x: "80%", y: "30%" }}
              animate={{
                x: ["80%", "60%", "40%", "60%", "80%"],
                y: ["30%", "50%", "70%", "50%", "30%"],
              }}
              transition={{
                duration: 15,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <MousePointer className="w-6 h-6 text-brand-500" />
            </motion.div>
          </div>

          {/* Floating badges */}
          <motion.div
            className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-brand-500" />
              <span className="font-medium">AI-Powered</span>
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-brand-500" />
              <span className="font-medium">Real-time Analytics</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
