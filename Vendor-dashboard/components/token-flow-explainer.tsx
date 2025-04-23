"use client"

import { ArrowDown, ArrowRight, DollarSign, Coins } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TokenFlowExplainer() {
  return (
    <Card className="bg-[#2D2A5E] shadow-md border-0 rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-xl">Watch2Give Flow</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col items-center space-y-6 text-white">
          {/* Flow diagram */}
          <div className="w-full flex justify-between items-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#3D3A7E] flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-[#FFBB54]" />
              </div>
              <span className="mt-2 text-sm">Advertisers</span>
            </div>

            <div className="flex flex-col items-center">
              <ArrowRight className="h-6 w-6 text-[#B8B7D8]" />
              <span className="text-xs text-[#B8B7D8]">Deposit USDT</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-[#3D3A7E] flex items-center justify-center">
                <div className="w-10 h-10 rounded-lg bg-[#4D4A9E] flex items-center justify-center">
                  <Coins className="h-6 w-6 text-[#FFBB54]" />
                </div>
              </div>
              <span className="mt-2 text-sm">DeFi Vault</span>
            </div>

            <div className="flex flex-col items-center">
              <ArrowRight className="h-6 w-6 text-[#B8B7D8]" />
              <span className="text-xs text-[#B8B7D8]">Earns Yield</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#3D3A7E] flex items-center justify-center">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#FFBB54]"
                  >
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
              </div>
              <span className="mt-2 text-sm">Watchers</span>
            </div>
          </div>

          {/* Vendor part */}
          <div className="flex flex-col items-center">
            <ArrowDown className="h-6 w-6 text-[#B8B7D8]" />
            <span className="text-xs text-[#B8B7D8]">Receives $GIVES</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#3D3A7E] flex items-center justify-center">
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-lg font-bold text-[#FFBB54]">$G</span>
              </div>
            </div>
            <span className="mt-2 text-sm">Vendors (You)</span>
          </div>

          <div className="w-full bg-[#3D3A7E] rounded-lg p-3 text-sm">
            <p className="text-[#B8B7D8]">As a vendor, you receive $GIVES tokens that can be:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[#B8B7D8]">
              <li>Redeemed for USDT</li>
              <li>Staked for additional yield</li>
              <li>Used to restock inventory</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
