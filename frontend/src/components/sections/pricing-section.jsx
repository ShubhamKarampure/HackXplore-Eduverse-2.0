"use client"

import { motion } from "framer-motion"
import { CheckCircle, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: 29,
    features: ["AI-Powered Features", "Advanced Analytics", "Collaborative Tools"],
  },
  {
    name: "Pro",
    price: 58,
    features: [
      "AI-Powered Features",
      "Advanced Analytics",
      "Collaborative Tools",
      "Priority Support",
      "Custom Integrations",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 87,
    features: [
      "AI-Powered Features",
      "Advanced Analytics",
      "Collaborative Tools",
      "Priority Support",
      "Custom Integrations",
      "Dedicated Account Manager",
    ],
  },
]

export const PricingSection = () => {
  return (
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Flexible Pricing Plans</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan that fits your educational needs and budget.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border ${
                plan.popular ? "border-brand-500 dark:border-brand-400" : "border-gray-100 dark:border-gray-700"
              } relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{plan.name} Plan</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-extrabold text-brand-500">${plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="mr-3 text-green-500 w-5 h-5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                className={`w-full py-4 rounded-lg flex items-center justify-center font-medium transition-all duration-300 ${
                  plan.popular
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
  )
}
