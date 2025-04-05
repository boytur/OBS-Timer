import { nanoid } from "nanoid"
import clientPromise from "./mongodb"

export type TimerMode = "clock" | "stopwatch" | "countdown"
export type TimerTheme = "light" | "dark" | "green-screen"

export interface TimerSession {
  id: string
  mode: TimerMode
  createdAt: Date
  updatedAt: Date
  duration?: number // for countdown
  startTime?: number // for stopwatch
  pausedAt?: number // for stopwatch/countdown
  isRunning: boolean
  showMilliseconds: boolean
  fontSize: number
  theme: TimerTheme
}

export async function createTimerSession(mode: TimerMode): Promise<TimerSession> {
  const client = await clientPromise
  const db = client.db("obs-timer")

  const session: TimerSession = {
    id: nanoid(10),
    mode,
    createdAt: new Date(),
    updatedAt: new Date(),
    isRunning: false,
    showMilliseconds: true,
    fontSize: 48,
    theme: "dark",
    duration: mode === "countdown" ? 5 * 60 * 1000 : undefined, // 5 minutes default
  }

  await db.collection("sessions").insertOne(session)
  return session
}

export async function getTimerSession(id: string): Promise<TimerSession | null> {
  const client = await clientPromise
  const db = client.db("obs-timer")

  const session = await db.collection("sessions").findOne({ id })
  return session as TimerSession | null
}

export async function updateTimerSession(id: string, updates: Partial<TimerSession>): Promise<TimerSession | null> {
  const client = await clientPromise
  const db = client.db("obs-timer")

  const result = await db.collection("sessions").findOneAndUpdate(
    { id },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )

  return result as unknown as TimerSession | null
}

