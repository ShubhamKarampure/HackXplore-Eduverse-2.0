"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LogIn, UserPlus } from "lucide-react"
import Image from "next/image"

export const NavBar = ({ onSignIn, onSignUp }) => {
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
                  src="/images/logo/logo-auth.svg"
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
