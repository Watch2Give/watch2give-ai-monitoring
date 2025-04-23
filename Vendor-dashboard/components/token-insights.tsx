"use client"

import { useState, useEffect } from "react"
import { Lightbulb, AlertTriangle, TrendingUp, Lock, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyzeToken, type TokenAnalysisResponse } from "@/lib/token-analysis"

interface TokenInsightsProps {
  tokenId?: string
  amount?: number
}

export default function TokenInsights({ tokenId = "", amount = 0 }: TokenInsightsProps) {
  const [insights, setInsights] = useState<TokenAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getInsights = async () => {
      if (!tokenId || amount <= 0) return

      setLoading(true)
      try {
        // Mock transaction history and market data
        const mockHistory = [
          { date: "2023-04-01", price: 1.15 },
          { date: "2023-04-02", price: 1.18 },
          { date: "2023-04-03", price: 1.2 },
        ]

        const mockMarketData = {
          volume24h: 1250000,
          marketCap: 45000000,
          circulatingSupply: 37500000,
        }

        const analysis = await analyzeToken({
          tokenId,
          amount,
          transactionHistory: mockHistory,
          marketData: mockMarketData,
        })

        setInsights(analysis)
      } catch (error) {
        console.error("Error getting token insights:", error)
      } finally {
        setLoading(false)
      }
    }

    getInsights()
  }, [tokenId, amount])

  if (!tokenId || amount <= 0) {
    return null
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec.toLowerCase()) {
      case "hold":
        return <Lock className="h-4 w-4 text-[#FFBB54]" />
      case "sell":
        return <TrendingDown className="h-4 w-4 text-[#FF6B5B]" />
      case "stake":
        return <TrendingUp className="h-4 w-4 text-[#26A69A]" />
      default:
        return <Lock className="h-4 w-4 text-[#FFBB54]" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "text-[#26A69A]"
      case "medium":
        return "text-[#FFBB54]"
      case "high":
        return "text-[#FF6B5B]"
      default:
        return "text-[#FFBB54]"
    }
  }

  return (
    <Card className="bg-[#2D2A5E] shadow-md border-0 rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-xl flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-[#FFBB54]" />
          Token Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="py-4 flex justify-center">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-[#FFBB54] rounded-full"></div>
              <div className="h-2 w-2 bg-[#FFBB54] rounded-full"></div>
              <div className="h-2 w-2 bg-[#FFBB54] rounded-full"></div>
            </div>
          </div>
        ) : insights ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {getRecommendationIcon(insights.recommendation)}
                <span className="ml-2 text-white font-medium">Recommendation:</span>
              </div>
              <span className="text-white capitalize">{insights.recommendation}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-[#FFBB54]" />
                <span className="ml-2 text-white font-medium">Risk Level:</span>
              </div>
              <span className={`capitalize font-medium ${getRiskColor(insights.riskLevel)}`}>{insights.riskLevel}</span>
            </div>

            <div className="pt-2 border-t border-[#6A67A8]">
              <div className="text-white font-medium mb-2">Key Insights:</div>
              <ul className="space-y-2">
                {insights.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-[#B8B7D8] flex">
                    <span className="text-[#FFBB54] mr-2">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-[#B8B7D8] text-center py-4">No insights available</p>
        )}
      </CardContent>
    </Card>
  )
}
