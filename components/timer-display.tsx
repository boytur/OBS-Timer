"use client"

import { useEffect, useState } from "react"
import type { TimerMode, TimerTheme } from "@/lib/timer-session"
import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  mode: TimerMode
  isRunning: boolean
  duration?: number
  startTime?: number
  pausedAt?: number
  showMilliseconds: boolean
  fontSize: number
  theme: TimerTheme
  className?: string
}

export function TimerDisplay({
  mode,
  isRunning,
  duration = 0,
  startTime = 0,
  pausedAt = 0,
  showMilliseconds = true,
  fontSize = 48,
  theme = "dark",
  className,
}: TimerDisplayProps) {
  const [time, setTime] = useState<number>(0)

  useEffect(() => {
    if (mode === "clock") {
      // For clock mode, update every second
      const interval = setInterval(() => {
        setTime(Date.now())
      }, 1000)
      return () => clearInterval(interval)
    } else if (mode === "stopwatch") {
      if (!isRunning) {
        // If paused, show the paused time
        setTime(pausedAt > 0 ? pausedAt - startTime : 0)
        return
      }

      // For stopwatch, update based on start time
      const interval = setInterval(
        () => {
          setTime(Date.now() - startTime)
        },
        showMilliseconds ? 10 : 1000,
      )
      return () => clearInterval(interval)
    } else if (mode === "countdown") {
      if (!isRunning) {
        // If paused, show the remaining time
        setTime(pausedAt > 0 ? Math.max(0, duration - (pausedAt - startTime)) : duration)
        return
      }

      // For countdown, update based on remaining time
      const interval = setInterval(
        () => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, duration - elapsed)
          setTime(remaining)

          // Stop the interval when countdown reaches zero
          if (remaining <= 0) {
            clearInterval(interval)
          }
        },
        showMilliseconds ? 10 : 1000,
      )
      return () => clearInterval(interval)
    }
  }, [mode, isRunning, startTime, pausedAt, duration, showMilliseconds])

  // Format the time based on the mode
  const formatTime = () => {
    if (mode === "clock") {
      const date = new Date(time)
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(date)
    } else {
      // For stopwatch and countdown
      const totalSeconds = Math.floor(time / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      const milliseconds = Math.floor((time % 1000) / 10)

      let formattedTime = ""

      if (hours > 0) {
        formattedTime += `${hours.toString().padStart(2, "0")}:`
      }

      formattedTime += `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

      if (showMilliseconds) {
        formattedTime += `.${milliseconds.toString().padStart(2, "0")}`
      }

      return formattedTime
    }
  }

  const themeClasses = {
    light: "bg-white text-black",
    dark: "bg-black text-white",
    "green-screen": "bg-[#00FF00] text-black",
  }

  return (
    <div
      className={cn("flex items-center justify-center p-4 font-mono tabular-nums", themeClasses[theme], className)}
      style={{ fontSize: `${fontSize}px` }}
    >
      {formatTime()}
    </div>
  )
}

