"use client"
import { useState, useEffect, useRef } from "react"
import {
  ChevronRight,
  BookOpen,
  Brain,
  Calendar,
  Globe,
  Zap,
  ArrowRight,
  LogIn,
  CheckCircle,
  UserPlus,
  Award,
  Star,
  Sparkles,
  ArrowUpRight,
  MousePointer,
  BarChart3,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import ThemeTogglerTwo from "@/components/courses/dashboard/stats/common/ThemeTogglerTwo"
import { motion, useScroll, useTransform } from "framer-motion"

// Custom cursor component
const CustomCursor = () => {
  const cursorRef = useRef(null)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e) => {
      if (
        e.target.tagName === "BUTTON" ||
        e.target.tagName === "A" ||
        e.target.closest("button") ||
        e.target.closest("a")
      ) {
        setIsPointer(true)
      } else {
        setIsPointer(false)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseover", handleMouseOver)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseover", handleMouseOver)
    }
  }, [])

  return (
    <motion.div
      ref={cursorRef}
      className="fixed w-6 h-6 rounded-full pointer-events-none z-50 mix-blend-difference"
      style={{
        left: cursorPosition.x - 12,
        top: cursorPosition.y - 12,
        backgroundColor: "white",
      }}
      animate={{
        scale: isPointer ? 1.5 : 1,
        opacity: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
      }}
    />
  )
}

// Animated gradient background
const GradientBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-slow" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_100%_200px,rgba(120,119,198,0.3),transparent)]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_600px_at_0%_300px,rgba(195,127,230,0.3),transparent)]" />
    </div>
  )
}

// Floating elements animation
const FloatingElement = ({ children, delay = 0, duration = 10, className = "" }) => {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

// Navbar with glass morphism effect
const NavBar = ({ onSignIn, onSignUp }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 backdrop-blur-md z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 dark:bg-gray-900/80 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <div className="flex items-center space-x-4">
          <div className="flex gap-5 items-center space-x-4">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Image className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={180} height={40} />
                             <Image
                               className="hidden dark:block"
                               src="/images/logo/logo-dark.svg"
                               alt="Logo"
                               width={180}
                               height={40}
                             />
              </motion.div>
              
            </div>

            <div className="hidden md:flex space-x-6 text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-brand-500 transition-all duration-300 relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#solutions" className="hover:text-brand-500 transition-all duration-300 relative group">
                Solutions
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#pricing" className="hover:text-brand-500 transition-all duration-300 relative group">
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onSignIn}
            className="flex items-center text-brand-500 hover:bg-brand-50 px-4 py-2 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogIn className="mr-2 w-5 h-5" /> Sign In
          </motion.button>
          <motion.button
            onClick={onSignUp}
            className="flex items-center bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-all duration-300"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="mr-2 w-5 h-5" /> Sign Up
          </motion.button>
        </div>
      </div>
    </nav>
  )
}

// 3D Tilt Card component
const TiltCard = ({ children, className }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const tiltX = (y - 0.5) * 20 // -10 to 10 degrees
    const tiltY = (0.5 - x) * 20 // -10 to 10 degrees

    setRotation({ x: tiltX, y: tiltY })
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setRotation({ x: 0, y: 0 })
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
        scale: isHovered ? 1.05 : 1,
        z: isHovered ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
      }}
    >
      <div style={{ transform: "translateZ(20px)" }}>{children}</div>
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-purple-500/10 rounded-lg -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ transform: "translateZ(10px)" }}
        />
      )}
    </motion.div>
  )
}

// Animated counter
const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(value)
  const countRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: countRef,
    offset: ["start bottom", "end bottom"],
  })

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((progress) => {
      if (progress > 0) {
        const timer = setTimeout(() => {
          setCount(Math.min(Math.floor(value * progress * 2), value))
        }, 100)
        return () => clearTimeout(timer)
      }
    })

    return () => unsubscribe()
  }, [scrollYProgress, value])

  return (
    <div ref={countRef} className="text-5xl font-bold text-brand-500">
      {count}+
    </div>
  )
}

// Main landing page component
const LandingPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

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

  const stats = [
    { value: 98, label: "Satisfaction Rate" },
    { value: 250, label: "Educational Institutions" },
    { value: 50000, label: "Active Users" },
    { value: 35, label: "Countries" },
  ]

  const handleSignIn = () => {
    router.push("/signin")
  }

  const handleSignUp = () => {
    router.push("/signup")
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-500`}
    >
      {/* Custom cursor for desktop */}
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      {/* Background effects */}
      <GradientBackground />

      {/* Floating elements */}
      <FloatingElement className="top-[20%] left-[10%]" delay={0}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-300/20 to-pink-300/20 backdrop-blur-md" />
      </FloatingElement>
      <FloatingElement className="top-[60%] right-[15%]" delay={2}>
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-300/20 to-teal-300/20 backdrop-blur-md" />
      </FloatingElement>
      <FloatingElement className="bottom-[20%] left-[20%]" delay={4}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-300/20 to-orange-300/20 backdrop-blur-md" />
      </FloatingElement>

      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
                  <ThemeTogglerTwo />
                </div>

      {/* Navigation Bar */}
      <NavBar onSignIn={handleSignIn} onSignUp={handleSignUp} />

      {/* Hero Section with Spacing for Navbar */}
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
                src="/placeholder.svg?height=600&width=1200"
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

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-900 py-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <AnimatedCounter value={stat.value} />
                <p className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
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

      {/* Solutions Section */}
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

      {/* Pricing Section */}
      <div id="pricing" className="py-24 relative">
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
                <CheckCircle className="mr-1 w-4 h-4" /> Flexible Plans
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Flexible Pricing Plans
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan that fits your educational needs and budget.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {["Basic", "Pro", "Enterprise"].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border ${
                  index === 1 ? "border-brand-500 dark:border-brand-400" : "border-gray-100 dark:border-gray-700"
                } relative ${index === 1 ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {index === 1 && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{plan} Plan</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-extrabold text-brand-500">${(index + 1) * 29}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "AI-Powered Features",
                    "Advanced Analytics",
                    "Collaborative Tools",
                    index >= 1 ? "Priority Support" : null,
                    index >= 1 ? "Custom Integrations" : null,
                    index === 2 ? "Dedicated Account Manager" : null,
                  ]
                    .filter(Boolean)
                    .map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="mr-3 text-green-500 w-5 h-5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                </ul>
                <motion.button
                  className={`w-full py-4 rounded-lg flex items-center justify-center font-medium transition-all duration-300 ${
                    index === 1
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Choose Plan <ArrowRight className="ml-2" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-purple-700" />
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            </svg>
          <defs>
            
          </defs>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Transform Your Educational Experience</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join EduVerse and unlock the potential of AI-driven education management.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.button
                className="bg-white text-brand-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Request Demo
              </motion.button>
              <motion.button
                className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Case Studies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">© 2025 EduVerse. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

