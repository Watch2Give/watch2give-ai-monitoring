"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PhotoUploadProps {
  uploadedPhotos: string[]
  onPhotoUpload: (photoUrl: string) => void
  onPhotoRemove: (index: number) => void
}

export default function PhotoUpload({ uploadedPhotos, onPhotoUpload, onPhotoRemove }: PhotoUploadProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoStream])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For this demo, we'll create a local URL
      const imageUrl = URL.createObjectURL(file)
      onPhotoUpload(imageUrl)

      // Reset the input
      e.target.value = ""
    }
  }

  const startCamera = async () => {
    try {
      setCameraError(null)
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      setVideoStream(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Could not access camera. Please check permissions.")
      setIsCapturing(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !videoStream) return

    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw the current video frame to the canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

    // Convert canvas to image data URL
    const imageUrl = canvas.toDataURL("image/jpeg")

    // Stop all video tracks
    videoStream.getTracks().forEach((track) => track.stop())
    setVideoStream(null)
    setIsCapturing(false)

    // Upload the captured photo
    onPhotoUpload(imageUrl)
  }

  const cancelCapture = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }
    setIsCapturing(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {uploadedPhotos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-[#6A67A8]">
            <Image
              src={photo || "/placeholder.svg"}
              alt={`Uploaded photo ${index + 1}`}
              fill
              className="object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 bg-[#FF6B5B] hover:bg-[#F55A4A]"
              onClick={() => onPhotoRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {isCapturing ? (
        <div className="space-y-3">
          {/* Camera Preview */}
          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center text-[#FF6B5B] p-4 text-center">
                <p>{cameraError}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                <div className="absolute top-2 left-2 bg-[#2D2A5E]/80 text-white text-xs px-2 py-1 rounded-md">
                  Live Camera
                </div>
              </>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-[#FF6B5B] hover:bg-[#F55A4A] text-white border-0"
              onClick={cancelCapture}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-[#26A69A] hover:bg-[#1E8E82] text-white border-0"
              onClick={capturePhoto}
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="relative w-full">
            <Button variant="outline" className="w-full bg-[#3D3A7E] border-[#6A67A8] text-white hover:bg-[#4D4A9E]">
              <Upload className="h-4 w-4 mr-2" />
              <span className="sm:hidden md:inline">Choose file</span>
              <span className="hidden sm:inline md:hidden">Upload</span>
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <Button
            variant="outline"
            className="w-full bg-[#3D3A7E] border-[#6A67A8] text-white hover:bg-[#4D4A9E]"
            onClick={startCamera}
          >
            <Camera className="h-4 w-4 mr-2" />
            <span className="sm:hidden md:inline">Take Photo</span>
            <span className="hidden sm:inline md:hidden">Camera</span>
          </Button>
        </div>
      )}
    </div>
  )
}
