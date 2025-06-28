"use client"
import { useState, useRef, type ReactNode } from "react"
import type React from "react"

import { motion } from "framer-motion"

interface TiltCardProps {
  children: ReactNode
  className?: string
}

export const TiltCard = ({ children, className }: TiltCardProps) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const tiltX = (y - 0.5) * 20
    const tiltY = (0.5 - x) * 20

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
