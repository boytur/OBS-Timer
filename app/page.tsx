import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Hourglass, Timer } from "lucide-react"

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">OBS Timer</h1>
        <p className="max-w-[600px] text-muted-foreground">
          Real-time countdown and stopwatch for streamers. Create a timer session and embed it in your OBS stream.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center gap-4">
            <div className="grid w-12 h-12 place-items-center rounded-full bg-primary/10">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Clock</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <CardDescription>Display the current time in various formats for your viewers.</CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/new?mode=clock" className="w-full">
              <Button className="w-full">Create Clock</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center gap-4">
            <div className="grid w-12 h-12 place-items-center rounded-full bg-primary/10">
              <Timer className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Stopwatch</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <CardDescription>Count up from zero with start, pause, and reset functionality.</CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/new?mode=stopwatch" className="w-full">
              <Button className="w-full">Create Stopwatch</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center gap-4">
            <div className="grid w-12 h-12 place-items-center rounded-full bg-primary/10">
              <Hourglass className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Countdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <CardDescription>Count down from a specified time to zero with customizable presets.</CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/new?mode=countdown" className="w-full">
              <Button className="w-full">Create Countdown</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

