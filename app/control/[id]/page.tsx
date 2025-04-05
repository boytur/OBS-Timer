"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { TimerDisplay } from "@/components/timer-display"
import type { TimerMode, TimerSession, TimerTheme } from "@/lib/timer-session"
import { Copy, Loader2, Play, Pause, RefreshCw, Clock, Timer, Hourglass } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ControlPanel() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [session, setSession] = useState<TimerSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // For countdown presets
  const presets = [
    { label: "5 min", value: 5 * 60 * 1000 },
    { label: "15 min", value: 15 * 60 * 1000 },
    { label: "30 min", value: 30 * 60 * 1000 },
    { label: "1 hour", value: 60 * 60 * 1000 },
  ]

  // Custom countdown input
  const [customHours, setCustomHours] = useState("0")
  const [customMinutes, setCustomMinutes] = useState("5")
  const [customSeconds, setCustomSeconds] = useState("0")

  // Fetch session data
  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch timer session")
      }

      const data = await response.json()
      setSession(data.session)
      setIsLoading(false)
    } catch (err) {
      setError("Failed to fetch timer session. Please try again.")
      setIsLoading(false)
    }
  }

  // Update session data
  const updateSession = async (updates: Partial<TimerSession>) => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update timer session")
      }

      const data = await response.json()
      setSession(data.session)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update timer settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Start polling for updates
  useEffect(() => {
    fetchSession()

    const interval = setInterval(fetchSession, 5000) // Poll every 5 seconds
    setPollingInterval(interval)

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [params.id])

  // Timer controls
  const startTimer = () => {
    if (!session) return

    const now = Date.now()
    const updates: Partial<TimerSession> = {
      isRunning: true,
    }

    if (session.mode === "stopwatch") {
      // If resuming from pause
      if (session.pausedAt && session.startTime) {
        const elapsedBeforePause = session.pausedAt - session.startTime
        updates.startTime = now - elapsedBeforePause
        updates.pausedAt = undefined
      } else {
        // Starting fresh
        updates.startTime = now
      }
    } else if (session.mode === "countdown") {
      // If resuming from pause
      if (session.pausedAt && session.startTime) {
        const elapsedBeforePause = session.pausedAt - session.startTime
        updates.startTime = now - elapsedBeforePause
        updates.pausedAt = undefined
      } else {
        // Starting fresh
        updates.startTime = now
      }
    }

    updateSession(updates)
  }

  const pauseTimer = () => {
    if (!session || !session.isRunning) return

    updateSession({
      isRunning: false,
      pausedAt: Date.now(),
    })
  }

  const resetTimer = () => {
    if (!session) return

    const updates: Partial<TimerSession> = {
      isRunning: false,
      startTime: undefined,
      pausedAt: undefined,
    }

    updateSession(updates)
  }

  const setCountdownDuration = (durationMs: number) => {
    if (!session || session.mode !== "countdown") return

    updateSession({
      duration: durationMs,
      isRunning: false,
      startTime: undefined,
      pausedAt: undefined,
    })
  }

  const applyCustomDuration = () => {
    const hours = Number.parseInt(customHours) || 0
    const minutes = Number.parseInt(customMinutes) || 0
    const seconds = Number.parseInt(customSeconds) || 0

    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000

    if (totalMs > 0) {
      setCountdownDuration(totalMs)
    }
  }

  const changeTimerMode = (mode: TimerMode) => {
    if (!session || session.mode === mode) return

    const updates: Partial<TimerSession> = {
      mode,
      isRunning: false,
      startTime: undefined,
      pausedAt: undefined,
    }

    if (mode === "countdown") {
      updates.duration = 5 * 60 * 1000 // 5 minutes default
    }

    updateSession(updates)
  }

  const copyEmbedUrl = () => {
    if (!session) return

    const url = `${window.location.origin}/view/${session.id}`
    navigator.clipboard.writeText(url)

    toast({
      title: "Copied!",
      description: "Embed URL copied to clipboard",
    })
  }

  const copyOBSInstructions = () => {
    if (!session) return

    const url = `${window.location.origin}/view/${session.id}`
    const instructions = `
OBS Setup Instructions:
1. In OBS, click on the + icon in the Sources panel
2. Select "Browser" from the list
3. Name your source (e.g., "Timer") and click OK
4. In the URL field, paste this URL: ${url}
5. Set the width to 800 and height to 200 (adjust as needed)
6. Check "Shutdown source when not visible" for better performance
7. Click OK to add the timer to your scene
    `.trim()

    navigator.clipboard.writeText(instructions)

    toast({
      title: "Copied!",
      description: "OBS instructions copied to clipboard",
    })
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg">Loading timer session...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Something went wrong</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error || "Session not found"}</p>
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
    <div className="container py-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Timer Control Panel</h1>
        <p className="text-muted-foreground">Manage your timer and customize its appearance</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Timer Preview</CardTitle>
              <CardDescription>This is how your timer will appear in OBS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden border rounded-md">
                <TimerDisplay
                  mode={session.mode}
                  isRunning={session.isRunning}
                  duration={session.duration}
                  startTime={session.startTime}
                  pausedAt={session.pausedAt}
                  showMilliseconds={session.showMilliseconds}
                  fontSize={session.fontSize}
                  theme={session.theme}
                  className="w-full h-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timer Controls</CardTitle>
              <CardDescription>Start, pause, and reset your timer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={session.isRunning ? pauseTimer : startTimer} className="flex-1">
                  {session.isRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button size="lg" variant="outline" onClick={resetTimer} className="flex-1">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              {session.mode === "countdown" && (
                <div className="space-y-4">
                  <div>
                    <Label>Quick Presets</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
                      {presets.map((preset) => (
                        <Button key={preset.value} variant="outline" onClick={() => setCountdownDuration(preset.value)}>
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Custom Duration</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="hours">Hours</Label>
                        <Input
                          id="hours"
                          type="number"
                          min="0"
                          max="23"
                          value={customHours}
                          onChange={(e) => setCustomHours(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minutes">Minutes</Label>
                        <Input
                          id="minutes"
                          type="number"
                          min="0"
                          max="59"
                          value={customMinutes}
                          onChange={(e) => setCustomMinutes(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seconds">Seconds</Label>
                        <Input
                          id="seconds"
                          type="number"
                          min="0"
                          max="59"
                          value={customSeconds}
                          onChange={(e) => setCustomSeconds(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={applyCustomDuration} className="w-full mt-2">
                      Apply Custom Duration
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
              <CardDescription>Customize your timer's appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Timer Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={session.mode === "clock" ? "default" : "outline"}
                    onClick={() => changeTimerMode("clock")}
                    className="justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Clock
                  </Button>
                  <Button
                    variant={session.mode === "stopwatch" ? "default" : "outline"}
                    onClick={() => changeTimerMode("stopwatch")}
                    className="justify-start"
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Stopwatch
                  </Button>
                  <Button
                    variant={session.mode === "countdown" ? "default" : "outline"}
                    onClick={() => changeTimerMode("countdown")}
                    className="justify-start"
                  >
                    <Hourglass className="w-4 h-4 mr-2" />
                    Countdown
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={session.theme} onValueChange={(value) => updateSession({ theme: value as TimerTheme })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="green-screen">Green Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-milliseconds">Show Milliseconds</Label>
                  <Switch
                    id="show-milliseconds"
                    checked={session.showMilliseconds}
                    onCheckedChange={(checked) => updateSession({ showMilliseconds: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="font-size">Font Size: {session.fontSize}px</Label>
                </div>
                <Slider
                  id="font-size"
                  min={24}
                  max={120}
                  step={4}
                  value={[session.fontSize]}
                  onValueChange={(value) => updateSession({ fontSize: value[0] })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OBS Integration</CardTitle>
              <CardDescription>Add this timer to your OBS stream</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Embed URL</Label>
                <div className="flex space-x-2">
                  <Input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/view/${session.id}`}
                  />
                  <Button variant="outline" size="icon" onClick={copyEmbedUrl}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={copyOBSInstructions}>
                Copy OBS Instructions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

