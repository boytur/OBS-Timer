import { type NextRequest, NextResponse } from "next/server"
import { getTimerSession, updateTimerSession } from "@/lib/timer-session"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getTimerSession(params.id)

    if (!session) {
      return NextResponse.json({ error: "Timer session not found" }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error fetching timer session:", error)
    return NextResponse.json({ error: "Failed to fetch timer session" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const session = await updateTimerSession(params.id, updates)

    if (!session) {
      return NextResponse.json({ error: "Timer session not found" }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error updating timer session:", error)
    return NextResponse.json({ error: "Failed to update timer session" }, { status: 500 })
  }
}

