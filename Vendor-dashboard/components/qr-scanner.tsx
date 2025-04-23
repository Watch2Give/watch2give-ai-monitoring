"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"

interface QrScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(true)
  const isMobile = useMobile()

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationFrameId: number | null = null
    let jsQR: any = null

    // Function to load the jsQR library dynamically
    const loadJsQR = async () => {
      try {
        // In a real app, you would import the jsQR library properly
        // For this demo, we'll simulate the library
        jsQR = {
          decode: (imageData: ImageData) => {
            // Simulate finding a QR code after 3 seconds
            setTimeout(() => {
              if (scanning) {
                const mockToken = `TKN${Math.floor(Math.random() * 1000000)
                  .toString()
                  .padStart(6, "0")}`
                onScan(mockToken)
                setScanning(false)
              }
            }, 3000)
            return null
          },
        }

        startCamera()
      } catch (err) {
        setError("Failed to load QR scanner library")
        console.error("Failed to load jsQR:", err)
      }
    }

    // Function to start the camera
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Camera access not supported by your browser")
          return
        }

        // Try to use the environment-facing camera on mobile devices
        const constraints = {
          video: isMobile ? { facingMode: { exact: "environment" } } : { facingMode: "environment" },
        }

        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch (err) {
          // Fallback to any available camera
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()

          // Start scanning once video is playing
          videoRef.current.onloadedmetadata = () => {
            scanQRCode()
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setError("Camera access denied. Please allow camera access to scan QR codes.")
          } else {
            setError("Failed to access camera: " + err.message)
          }
        } else {
          setError("Failed to access camera")
        }
        console.error("Error accessing camera:", err)
      }
    }

    // Function to scan for QR codes
    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || !jsQR) return

      const canvas = canvasRef.current
      const video = videoRef.current

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas dimensions to match video
        canvas.height = video.videoHeight
        canvas.width = video.videoWidth

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get image data for QR code detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Attempt to decode QR code
        const code = jsQR.decode(imageData)

        if (code) {
          // QR code found
          onScan(code.data)
          setScanning(false)
        } else if (scanning) {
          // Continue scanning
          animationFrameId = requestAnimationFrame(scanQRCode)
        }
      } else if (scanning) {
        // Video not ready yet, try again
        animationFrameId = requestAnimationFrame(scanQRCode)
      }
    }

    loadJsQR()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [onScan, scanning, isMobile])

  return (
    <Card className="relative overflow-hidden bg-[#3D3A7E] border border-[#6A67A8] shadow-md rounded-xl">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-10 text-white hover:bg-[#4D4A9E]"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="aspect-square w-full bg-[#2D2A5E] relative">
        {/* Video element to display camera feed */}
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

        {/* Canvas for processing video frames (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 border-2 border-[#FFBB54] rounded-lg flex items-center justify-center">
            {scanning && (
              <div className="animate-pulse text-white text-center bg-[#2D2A5E]/80 p-2 rounded-md">
                <p>Scanning...</p>
                <p className="text-xs mt-2">Position QR code within the frame</p>
              </div>
            )}
          </div>
        </div>

        {/* Scanning animation */}
        {scanning && (
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#FFBB54] animate-[scan_2s_ease-in-out_infinite]"></div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#FF6B5B]/90 text-white p-2 text-sm">{error}</div>
        )}
      </div>
    </Card>
  )
}
