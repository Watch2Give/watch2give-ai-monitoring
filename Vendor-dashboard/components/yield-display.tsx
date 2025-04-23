"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Clock } from "lucide-react"

interface YieldDisplayProps {
  tokenId: string
}

export default function YieldDisplay({ tokenId }: YieldDisplayProps) {
  const [yieldData, setYieldData] = useState({
    current: 0,
    potential: 0,
    timeRemaining: "0 days",
  })

  // Simulate fetching yield data
  useEffect(() => {
    if (tokenId) {
      // In a real app, this would be an API call
      const mockYieldData = {
        current: Math.floor(Math.random() * 15) + 5,
        potential: Math.floor(Math.random() * 30) + 20,
        timeRemaining: `${Math.floor(Math.random() * 14) + 1} days`,
      }

      setYieldData(mockYieldData)
    }
  }, [tokenId])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#e8f5e9] p-3 rounded-lg border border-[#c8e6c9]">
          <div className="text-sm text-[#4a6572] mb-1">Current Yield</div>
          <div className="text-xl font-bold text-[#2e7d32] flex items-center">
            {yieldData.current}%
            <TrendingUp className="h-4 w-4 ml-1" />
          </div>
        </div>
        <div className="bg-[#e8f5e9] p-3 rounded-lg border border-[#c8e6c9]">
          <div className="text-sm text-[#4a6572] mb-1">Potential Yield</div>
          <div className="text-xl font-bold text-[#2e7d32]">{yieldData.potential}%</div>
        </div>
      </div>

      <div className="bg-[#f1f8e9] p-3 rounded-lg border border-[#dcedc8] flex items-center">
        <Clock className="h-5 w-5 mr-2 text-[#558b2f]" />
        <div>
          <div className="text-sm text-[#4a6572]">Time until next yield increase:</div>
          <div className="text-[#558b2f] font-medium">{yieldData.timeRemaining}</div>
        </div>
      </div>

      <div className="pt-2">
        <div className="text-sm text-[#4a6572] mb-2">Yield Growth Projection</div>
        <div className="h-16 flex items-end space-x-1">
          {Array.from({ length: 12 }).map((_, i) => {
            const height = 20 + i * 5 + Math.random() * 10
            const delay = i * 0.1
            return (
              <div
                key={i}
                className="yield-bar bg-green-400 rounded-t-sm w-full"
                style={{
                  height: `${height}%`,
                  animationDelay: `${delay}s`,
                  backgroundColor: `rgba(${102 - i * 3}, ${187 - i * 2}, ${106 + i * 2}, ${0.7 + i * 0.02})`,
                }}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-[#4a6572] mt-1">
          <span>Now</span>
          <span>6 mo</span>
          <span>1 yr</span>
        </div>
      </div>
    </div>
  )
}
