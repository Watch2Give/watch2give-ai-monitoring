"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { QrCode, Camera, Menu, X, Trophy, Flame } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import QrScanner from "./qr-scanner"
import TokenActions from "./token-actions"
import PhotoUpload from "./photo-upload"
import { useMobile } from "@/hooks/use-mobile"
import TokenNotification from "./token-notification"
import TokenValue from "./token-value"
// Remove the TokenFlowExplainer import if it was added
import { apiService } from "@/services/api-service"

export default function VendorDashboard() {
  const [token, setToken] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [tokenBalance, setTokenBalance] = useState(125) // Mock token balance
  const { toast } = useToast()
  const isMobile = useMobile()
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })

  // Load streak data from localStorage on component mount
  useEffect(() => {
    const loadStreakData = () => {
      const storedStreak = localStorage.getItem("vendorStreak")
      if (storedStreak) {
        const streakData = JSON.parse(storedStreak)

        // Check if the streak is still valid (within 24 hours of last activity)
        const now = new Date()
        const lastActivity = new Date(streakData.lastActivity)
        const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)

        if (hoursSinceLastActivity <= 36) {
          // Give a 12-hour grace period
          // If it's a new day (more than 20 hours), increment the streak
          if (hoursSinceLastActivity >= 20 && !streakData.updatedToday) {
            const newCount = Math.min(streakData.count + 1, 5)
            setStreakCount(newCount)

            // Update localStorage with new streak count
            localStorage.setItem(
              "vendorStreak",
              JSON.stringify({
                count: newCount,
                lastActivity: now.toISOString(),
                updatedToday: true,
              }),
            )

            if (newCount === 5) {
              toast({
                title: "5-Day Streak Achieved!",
                description: "Congratulations on your dedication!",
              })
            }
          } else {
            // Just update the streak count from storage
            setStreakCount(streakData.count)
          }
        } else {
          // Streak broken - reset to 1 for today's activity
          setStreakCount(1)
          localStorage.setItem(
            "vendorStreak",
            JSON.stringify({
              count: 1,
              lastActivity: now.toISOString(),
              updatedToday: true,
            }),
          )
        }
      } else {
        // First time user - initialize streak at 1
        setStreakCount(1)
        localStorage.setItem(
          "vendorStreak",
          JSON.stringify({
            count: 1,
            lastActivity: new Date().toISOString(),
            updatedToday: true,
          }),
        )
      }
    }

    // Check if we're in a browser environment before using localStorage
    if (typeof window !== "undefined") {
      loadStreakData()
    }
  }, [toast])

  // Reset the "updatedToday" flag at midnight
  useEffect(() => {
    const resetDailyFlag = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const timeUntilMidnight = tomorrow.getTime() - now.getTime()

      const timer = setTimeout(() => {
        const streakData = localStorage.getItem("vendorStreak")
        if (streakData) {
          const data = JSON.parse(streakData)
          localStorage.setItem(
            "vendorStreak",
            JSON.stringify({
              ...data,
              updatedToday: false,
            }),
          )
        }
      }, timeUntilMidnight)

      return () => clearTimeout(timer)
    }

    if (typeof window !== "undefined") {
      return resetDailyFlag()
    }
  }, [])

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && menuOpen) {
      setMenuOpen(false)
    }
  }, [isMobile, menuOpen])

  const handleTokenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value)
  }

  const handleQrSuccess = async (result: string) => {
    try {
      // Validate the token
      const isValid = await apiService.validateToken(result)

      if (isValid) {
        setToken(result)
        setIsScanning(false)
        toast({
          title: "QR Code Scanned",
          description: `Token: ${result}`,
        })
      } else {
        toast({
          title: "Invalid Token",
          description: "The scanned token is not valid.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating token:", error)
      toast({
        title: "Error",
        description: "Failed to validate token. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleActionSelect = (action: string) => {
    setSelectedAction(action)
    toast({
      title: "Action Selected",
      description: `You selected: ${action}`,
    })
  }

  const handlePhotoUpload = async (photoUrl: string) => {
    try {
      // In a real implementation, this would upload the image to your backend
      const uploadedUrl = await apiService.uploadImage(photoUrl)
      setUploadedPhotos([...uploadedPhotos, uploadedUrl])
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      })
    }
  }

  const togglePhotoUpload = () => {
    setShowPhotoUpload(!showPhotoUpload)
  }

  const handleSubmit = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Please enter or scan a token",
        variant: "destructive",
      })
      setStatusMessage({ type: "error", message: "Please enter or scan a token" })
      return
    }

    if (!selectedAction) {
      toast({
        title: "Error",
        description: "Please select an action",
        variant: "destructive",
      })
      setStatusMessage({ type: "error", message: "Please select an action" })
      return
    }

    if (selectedAction === "Restock" && uploadedPhotos.length === 0) {
      toast({
        title: "Error",
        description: "Please upload proof of delivery",
        variant: "destructive",
      })
      setStatusMessage({ type: "error", message: "Please upload proof of delivery" })
      return
    }

    try {
      // Submit the action to the backend
      const response = await apiService.submitAction({
        tokenId: token,
        action: selectedAction,
        proofImages: uploadedPhotos,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        })

        setStatusMessage({
          type: "success",
          message: response.message,
        })

        // Reset form after a delay
        setTimeout(() => {
          setToken("")
          setSelectedAction(null)
          setUploadedPhotos([])
          setShowPhotoUpload(false)
          // Keep the success message visible
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })

        setStatusMessage({
          type: "error",
          message: response.message,
        })
      }
    } catch (error) {
      console.error("Error submitting action:", error)
      toast({
        title: "Error",
        description: "Failed to submit action. Please try again.",
        variant: "destructive",
      })

      setStatusMessage({
        type: "error",
        message: "Failed to submit action. Please try again.",
      })
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col relative"
      style={{ background: "linear-gradient(180deg, #FF8C4B 0%, #E05188 50%, #2C1668 100%)" }}
    >
      <header className="sticky top-0 z-20 bg-[#2D2A5E] shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center text-white">
                <span className="text-xl font-bold">Watch</span>
                <span className="text-xl font-bold">2</span>
                <span className="text-xl font-bold">Give</span>
              </div>
            </div>

            {/* Center: Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <h1 className="text-lg font-semibold text-white">Vendor Dashboard</h1>
            </div>

            {/* Right: Streak and Mobile menu button */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-xs text-white mr-1 hidden sm:inline">Streak:</span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Flame
                    key={i}
                    className={`h-5 w-5 ${i < streakCount ? "text-[#FF6B5B]" : "text-[#6A67A8]"}`}
                    fill={i < streakCount ? "#FF6B5B" : "#6A67A8"}
                  />
                ))}
              </div>

              {/* Notification at far right */}
              <TokenNotification />

              {/* Mobile menu button - only visible on small screens */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-[#3D3A7E]"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 bg-[#2D2A5E]/95 z-10 pt-16 px-4 flex flex-col space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start bg-[#3D3A7E] border-[#6A67A8] text-white hover:bg-[#4D4A9E]"
            onClick={() => {
              setMenuOpen(false)
              window.scrollTo(0, 0)
            }}
          >
            Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start bg-[#3D3A7E] border-[#6A67A8] text-white hover:bg-[#4D4A9E]"
            onClick={() => {
              setMenuOpen(false)
              setIsScanning(true)
              setTimeout(() => {
                const element = document.getElementById("token-section")
                if (element) element.scrollIntoView({ behavior: "smooth" })
              }, 100)
            }}
          >
            Scan QR Code
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start bg-[#3D3A7E] border-[#6A67A8] text-white hover:bg-[#4D4A9E]"
            onClick={() => {
              setMenuOpen(false)
              setShowPhotoUpload(true)
              setTimeout(() => {
                const element = document.getElementById("photo-upload-section")
                if (element) element.scrollIntoView({ behavior: "smooth" })
              }, 100)
            }}
          >
            Upload Proof
          </Button>

          {/* Streak indicator in mobile menu */}
          <div className="flex items-center justify-center mt-4 py-2">
            <div className="mr-2 text-sm text-white">Streak:</div>
            {Array.from({ length: 5 }).map((_, i) => (
              <Flame
                key={i}
                className={`h-5 w-5 ${i < streakCount ? "text-[#FF6B5B]" : "text-[#6A67A8]"}`}
                fill={i < streakCount ? "#FF6B5B" : "#6A67A8"}
              />
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 container px-4 py-6 mx-auto relative z-0">
        {/* Two column layout for desktop, single column for mobile */}
        <div className="flex flex-col md:flex-row md:gap-6">
          {/* Main content column */}
          <div className="md:w-2/3 space-y-6">
            {/* Token Flow Explainer - Added to explain the system workflow */}

            {/* Token Management */}
            <Card id="token-section" className="bg-[#2D2A5E] shadow-md border-0 rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl md:text-2xl">Token Management</CardTitle>
                <CardDescription className="text-[#B8B7D8]">Scan QR code or enter token manually</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {isScanning ? (
                  <div className="mb-4">
                    <QrScanner onScan={handleQrSuccess} onClose={() => setIsScanning(false)} />
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter token or scan QR"
                        value={token}
                        onChange={handleTokenInput}
                        className="flex-1 bg-[#3D3A7E] border-[#6A67A8] text-white focus-visible:ring-[#FFBB54]"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setIsScanning(true)}
                        className="bg-[#3D3A7E] border-[#6A67A8] text-white hover:bg-[#4D4A9E]"
                        aria-label="Scan QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                    {token && (
                      <div className="bg-[#3D3A7E] p-3 rounded-md border border-[#6A67A8]">
                        <p className="text-sm font-medium text-[#B8B7D8]">Active Token:</p>
                        <p className="text-lg font-bold text-white">{token}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="bg-[#2D2A5E] shadow-md border-0 rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl md:text-2xl">Select Action</CardTitle>
                <CardDescription className="text-[#B8B7D8]">Choose what to do with your $GIVES tokens</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <TokenActions selectedAction={selectedAction} onActionSelect={handleActionSelect} />
              </CardContent>
            </Card>

            {/* Proof of Image Button with Preview */}
            <div className="space-y-3">
              <Button
                onClick={togglePhotoUpload}
                className="w-full bg-[#26A69A] hover:bg-[#1E8E82] text-white border-0 rounded-lg shadow-md"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                {showPhotoUpload ? "Hide Proof Upload" : "Upload Proof of Giving"}
              </Button>

              {/* Photo Preview (always visible) */}
              {uploadedPhotos.length > 0 && (
                <div className="bg-[#2D2A5E] rounded-lg p-3 border border-[#6A67A8] shadow-sm">
                  <p className="text-xs text-[#B8B7D8] mb-2">
                    {uploadedPhotos.length} {uploadedPhotos.length === 1 ? "photo" : "photos"} uploaded
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={photo || "/placeholder.svg"}
                          alt={`Uploaded photo ${index + 1}`}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Photo Upload Section */}
            {showPhotoUpload && (
              <Card id="photo-upload-section" className="bg-[#2D2A5E] shadow-md border-0 rounded-xl overflow-hidden">
                <CardHeader className="pb-2 bg-[#26A69A]">
                  <CardTitle className="text-white text-xl md:text-2xl">Proof-of-Giving</CardTitle>
                  <CardDescription className="text-white/80">Take photos as proof of action</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <PhotoUpload
                    uploadedPhotos={uploadedPhotos}
                    onPhotoUpload={handlePhotoUpload}
                    onPhotoRemove={(index) => {
                      const newPhotos = [...uploadedPhotos]
                      newPhotos.splice(index, 1)
                      setUploadedPhotos(newPhotos)
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Submit Button - Centered */}
            <Button
              className="w-full bg-[#FFBB54] hover:bg-[#F5A742] text-[#2D2A5E] font-bold border-0 h-12 text-base rounded-lg shadow-md"
              onClick={handleSubmit}
              disabled={!token || !selectedAction}
            >
              Submit
            </Button>

            {/* Status Message */}
            {statusMessage.type && (
              <div
                className={`p-3 rounded-lg flex items-center ${
                  statusMessage.type === "success"
                    ? "bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]"
                    : "bg-[#FF6B5B]/20 text-[#FF6B5B] border border-[#FF6B5B]"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="text-sm">{statusMessage.message}</span>
              </div>
            )}
          </div>

          {/* Right sidebar for token balance and leaderboard */}
          <div className="md:w-1/3 space-y-6 mt-6 md:mt-0">
            {/* Token Balance and Value - Now on the right side */}
            <Card className="bg-[#2D2A5E] shadow-md border-0 rounded-xl overflow-hidden sticky top-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl">Your $GIVES Balance</CardTitle>
                <CardDescription className="text-[#B8B7D8]">Current balance and USD value</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#B8B7D8]">Available $GIVES:</span>
                    <span className="text-2xl font-bold text-white">{tokenBalance}</span>
                  </div>
                  <TokenValue amount={tokenBalance} />
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Teaser */}
            <Card className="bg-[#2D2A5E] shadow-md border-0 rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-[#FFBB54]" />
                  Leaderboard
                </CardTitle>
                <CardDescription className="text-[#B8B7D8]">Top 5 Vendors</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {[
                    { name: "Alice", points: 240 },
                    { name: "Bob", points: 200 },
                    { name: "Charlie", points: 180 },
                    { name: "Aliss", points: 140 },
                    { name: "Fmil.i", points: 55 },
                  ].map((vendor, index) => (
                    <div key={index} className="flex justify-between items-center text-white">
                      <div className="flex items-center">
                        <span className="w-6 text-[#FFBB54] font-bold">{index + 1}</span>
                        <span className="ml-4">{vendor.name}</span>
                      </div>
                      <span className="font-bold">{vendor.points}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[#6A67A8]">
                  <div className="flex justify-between items-center text-white mb-2">
                    <span>Your Rank:</span>
                    <span className="font-bold">#42</span>
                  </div>
                  <div className="w-full bg-[#3D3A7E] rounded-full h-2 mb-1">
                    <div className="bg-[#26A69A] h-2 rounded-full" style={{ width: "35%" }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-[#B8B7D8]">
                    <span>0</span>
                    <span>Next Rank: 15 more actions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
