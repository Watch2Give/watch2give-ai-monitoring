"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { polkadotService } from "@/services/polkadot-service"
import { TOKEN_CONFIG } from "@/config/app-config"

interface TokenValueProps {
  tokenId?: string
  amount?: number
}

export default function TokenValue({ tokenId, amount = 0 }: TokenValueProps) {
  const [tokenData, setTokenData] = useState({
    priceUsd: TOKEN_CONFIG.defaultPriceUsd,
    change24h: 3.5,
    totalValue: 0,
    holdingMetric: 0,
    holdingSince: "",
  })
  const [loading, setLoading] = useState(false)

  // Fetch token price data
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true)

        // Get token price from Polkadot service
        const price = await polkadotService.getTokenPrice()

        // Get holding metric for mock vendor address
        const holdingMetric = await polkadotService.getHoldingMetric("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")

        // Calculate change (mock data)
        const mockChange = Math.random() * 8 - 2 // -2% to +6% range

        setTokenData({
          priceUsd: price,
          change24h: Number.parseFloat(mockChange.toFixed(1)),
          totalValue: Number.parseFloat((amount * price).toFixed(2)),
          holdingMetric: holdingMetric.score,
          holdingSince: holdingMetric.holdingSince.toLocaleDateString(),
        })
      } catch (error) {
        console.error("Error fetching token price:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenData()

    // Refresh price every minute
    const interval = setInterval(fetchTokenData, 60000)
    return () => clearInterval(interval)
  }, [amount])

  return (
    <div className="bg-[#3D3A7E] rounded-lg p-3 border border-[#6A67A8]">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-[#B8B7D8]">{TOKEN_CONFIG.symbol} Value (USD)</div>
        <div className="flex items-center text-xs">
          {tokenData.change24h >= 0 ? (
            <TrendingUp className="h-3 w-3 text-[#26E2A0] mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-[#FF6B5B] mr-1" />
          )}
          <span className={tokenData.change24h >= 0 ? "text-[#26E2A0]" : "text-[#FF6B5B]"}>
            {tokenData.change24h >= 0 ? "+" : ""}
            {tokenData.change24h}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline">
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-[#FFBB54]" />
          <span className="text-xl font-bold text-white">{tokenData.priceUsd}</span>
        </div>
        <span className="text-xs text-[#B8B7D8] ml-1">per token</span>
      </div>

      {amount > 0 && (
        <div className="mt-2 pt-2 border-t border-[#6A67A8]">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#B8B7D8]">Your {TOKEN_CONFIG.symbol}:</span>
            <span className="text-sm text-white">{amount}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-[#B8B7D8]">Total value:</span>
            <div className="flex items-center text-[#FFBB54]">
              <DollarSign className="h-3 w-3 mr-0.5" />
              <span className="font-medium">{tokenData.totalValue}</span>
            </div>
          </div>

          {/* Holding Metric - key part of Watch2Give ecosystem */}
          <div className="mt-3 pt-2 border-t border-[#6A67A8]">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-[#26E2A0]" />
                <span className="text-xs text-[#B8B7D8]">Holding Since:</span>
              </div>
              <span className="text-xs text-white">{tokenData.holdingSince}</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#B8B7D8]">Holding Metric:</span>
                <span className="text-[#26E2A0]">{tokenData.holdingMetric}/100</span>
              </div>
              <div className="w-full bg-[#2D2A5E] rounded-full h-1.5">
                <div className="bg-[#26E2A0] h-1.5 rounded-full" style={{ width: `${tokenData.holdingMetric}%` }}></div>
              </div>
              <div className="text-xs text-[#B8B7D8] mt-1">Higher holding metrics attract more Watcher support</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
