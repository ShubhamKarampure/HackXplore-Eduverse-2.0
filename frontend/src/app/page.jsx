"use client"
import React, { useState } from 'react';
import { 
  ChevronRight, 
  BookOpen, 
  Brain, 
  Calendar, 
  Code, 
  Users, 
  TrendingUp, 
  Award,
  Globe,
  Zap,
  ArrowRight,
  Lock,
  LogIn,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const NavBar = ({ onSignIn, onSignUp }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <div className="flex items-center space-x-4">
         
          <div className="hidden md:flex space-x-6 text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-brand-500 transition">EDUVERSE</a>
            <a href="#features" className="hover:text-brand-500 transition">Features</a>
            <a href="#solutions" className="hover:text-brand-500 transition">Solutions</a>
            <a href="#pricing" className="hover:text-brand-500 transition">Pricing</a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onSignIn}
            className="flex items-center text-brand-500 hover:bg-brand-50 px-4 py-2 rounded-lg transition"
          >
            <LogIn className="mr-2 w-5 h-5" /> Sign In
          </button>
          <button 
            onClick={onSignUp}
            className="flex items-center bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition"
          >
            <UserPlus className="mr-2 w-5 h-5" /> Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-brand-500" />,
      title: "AI Grading Assistant",
      description: "Automate grading with NLP and pattern recognition for instant, accurate feedback."
    },
    {
      icon: <Calendar className="w-6 h-6 text-brand-500" />,
      title: "Smart Scheduling Engine",
      description: "Optimize timetables, resolve conflicts, and sync updates automatically."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-brand-500" />,
      title: "Dynamic Course Builder",
      description: "Generate course materials using AI-curated resources, reducing preparation time."
    }
  ];

  const solutions = [
    {
      icon: <Globe className="w-6 h-6 text-brand-500" />,
      title: "Global Learning Platform",
      description: "Connect students and educators across geographical boundaries."
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-500" />,
      title: "Adaptive Learning",
      description: "Personalized learning paths tailored to individual student needs."
    },
    {
      icon: <Award className="w-6 h-6 text-brand-500" />,
      title: "Performance Tracking",
      description: "Comprehensive analytics to monitor and improve student progress."
    }
  ];

  const handleSignIn = () => {
    router.push('/signin')
  };

  const handleSignUp = () => {
    router.push('/signup')
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Navigation Bar */}
      <NavBar onSignIn={handleSignIn} onSignUp={handleSignUp} />

      {/* Hero Section with Spacing for Navbar */}
      <div className="container mx-auto px-4 pt-32 pb-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-6 text-gray-900 dark:text-white"
        >
          EduVerse: AI-Powered Education Transformation
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
        >
          Revolutionize academic workflows with intelligent automation, real-time collaboration, and predictive analytics.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center space-x-4"
        >
          <button className="bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-600 transition flex items-center">
            Get Started <ChevronRight className="ml-2" />
          </button>
          <button className="border border-brand-500 text-brand-500 px-6 py-3 rounded-lg hover:bg-brand-50 transition">
            Learn More
          </button>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Comprehensive AI-Driven Features
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              EduVerse integrates cutting-edge AI technologies to transform educational experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-theme-sm hover:shadow-theme-lg transition"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <div id="solutions" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Innovative Educational Solutions
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Empowering educators and students with cutting-edge technological innovations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {solutions.map((solution, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800 hover:shadow-lg transition"
            >
              <div className="mb-4">{solution.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {solution.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {solution.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Flexible Pricing Plans
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan that fits your educational needs and budget.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {['Basic', 'Pro', 'Enterprise'].map((plan, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {plan} Plan
                </h3>
                <p className="text-4xl font-extrabold text-brand-500 mb-4">
                  ${(index + 1) * 29}<span className="text-base">/month</span>
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 text-green-500 w-5 h-5" />
                    AI-Powered Features
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 text-green-500 w-5 h-5" />
                    Advanced Analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 text-green-500 w-5 h-5" />
                    Collaborative Tools
                  </li>
                </ul>
                <button className="w-full bg-brand-500 text-white py-3 rounded-lg hover:bg-brand-600 transition flex items-center justify-center">
                  Choose Plan <ArrowRight className="ml-2" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-brand-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Transform Your Educational Experience
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join EduVerse and unlock the potential of AI-driven education management.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-brand-500 px-8 py-3 rounded-lg hover:bg-gray-100 transition">
              Request Demo
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-brand-600 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;