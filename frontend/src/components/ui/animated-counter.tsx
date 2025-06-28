"use client"
import { useState, useEffect, useRef } from "react"
import { useScroll } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  duration?: number
}

export const AnimatedCounter = ({ value, duration = 2 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(value)
  const countRef = useRef<HTMLDivElement>(null)
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
