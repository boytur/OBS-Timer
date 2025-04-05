"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { TimerMode } from "@/lib/timer-session"

export default function NewTimerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const mode = searchParams.get("mode") as TimerMode

    if (!mode || !["clock", "stopwatch", "countdown"].includes(mode)) {
      setError("Invalid timer mode. Please select a valid mode from the homepage.")
      setIsLoading(false)
      return
    }

    async function createSession() {
      try {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mode }),
        })

        if (!response.ok) {
          throw new Error("Failed to create timer session")
        }

        const data = await response.json()
        router.push(`/control/${data.session.id}`)
      } catch (err) {
        setError("Failed to create timer session. Please try again.")
        setIsLoading(false)
      }
    }

    createSession()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Something went wrong</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg">Creating your timer session...</p>
      </div>
    </div>
  )
}

