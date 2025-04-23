import { NextResponse } from "next/server"
import { analyzeToken } from "@/lib/token-analysis"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tokenId, amount, transactionHistory, marketData } = body

    if (!tokenId || !amount) {
      return NextResponse.json({ error: "Missing required fields: tokenId and amount" }, { status: 400 })
    }

    const analysis = await analyzeToken({
      tokenId,
      amount,
      transactionHistory,
      marketData,
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error in token analysis API:", error)
    return NextResponse.json({ error: "Failed to analyze token" }, { status: 500 })
  }
}
