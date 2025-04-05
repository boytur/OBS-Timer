import { type NextRequest, NextResponse } from "next/server"
import { createTimerSession, type TimerMode } from "@/lib/timer-session"

export async function POST(request: NextRequest) {
  try {
    const { mode } = await request.json()

    if (!mode || !["clock", "stopwatch", "countdown"].includes(mode)) {
      return NextResponse.json({ error: "Invalid timer mode" }, { status: 400 })
    }

    const session = await createTimerSession(mode as TimerMode)

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error creating timer session:", error)
    return NextResponse.json({ error: "Failed to create timer session" }, { status: 500 })
  }
}

