import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarsProps {
  calendars: {
    name: string
    items: string[]
  }[]
}

export function Calendars({ calendars }: CalendarsProps) {
  return (
    <div className="px-4 space-y-4">
      <div className="text-sm font-medium">Calendars</div>
      <div className="space-y-2">
        {calendars.map((calendar) => (
          <div key={calendar.name} className="space-y-2">
            <div className="flex items-center">
              <ChevronDown className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{calendar.name}</span>
            </div>
            <div className="ml-6 space-y-1">
              {calendar.items.map((item) => (
                <div key={item} className="flex items-center">
                  <div className={cn("w-3 h-3 mr-2 rounded-full bg-primary")} />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

