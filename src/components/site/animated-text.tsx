"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedTextProps {
  text: string
  className?: string
  mode?: "per-line" | "per-word"
  delay?: number
}

export function AnimatedText({ text, className, mode = "per-line", delay = 0 }: AnimatedTextProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: mode === "per-line" ? 0.1 : 0.05,
        delayChildren: delay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0 },
  }

  const splitText = mode === "per-line" ? text.split("\n").filter((line) => line.trim() !== "") : text.split(" ")

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("overflow-hidden", className)}
    >
      {splitText.map((item, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
          className={mode === "per-line" ? "block" : "inline-block mr-1"}
        >
          {item}
          {mode === "per-line" && index < splitText.length - 1 && <br />}
        </motion.span>
      ))}
    </motion.div>
  )
}
