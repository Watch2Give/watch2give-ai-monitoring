"use client"

import { useState, useEffect } from "react"
import { Bell, DollarSign, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiService, type NotificationData } from "@/services/api-service"

export default function TokenNotification() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  // Simulate fetching notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationData = await apiService.getNotifications()
        setNotifications(notificationData)
        setUnreadCount(notificationData.filter((n) => !n.read).length)

        // If there are unread notifications, show a toast
        if (notificationData.filter((n) => !n.read).length > 0) {
          toast({
            title: "New Tokens Received!",
            description: `You have ${notificationData.filter((n) => !n.read).length} new token transfers.`,
          })
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [toast])

  const markAllAsRead = async () => {
    const success = await apiService.markAllNotificationsAsRead()
    if (success) {
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  const markAsRead = async (id: string) => {
    const success = await apiService.markNotificationAsRead(id)
    if (success) {
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="relative bg-[#3D3A7E] border-[#6A67A8] text-white hover:bg-[#4D4A9E]"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#FF6B5B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 mt-2 w-80 z-50 bg-[#2D2A5E] border-[#6A67A8] shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg">Token Notifications</CardTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#B8B7D8] hover:text-white"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-[#B8B7D8] text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${notification.read ? "border-[#6A67A8] bg-[#3D3A7E]/50" : "border-[#FFBB54] bg-[#3D3A7E]"}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <ArrowDown className="h-4 w-4 text-[#26A69A] mr-2" />
                        <span className="font-medium text-white">{notification.sender}</span>
                      </div>
                      <span className="text-xs text-[#B8B7D8]">{formatTime(notification.timestamp)}</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-white">{notification.amount}</span>
                        <span className="text-xs text-[#B8B7D8] ml-1">tokens</span>
                      </div>
                      <div className="flex items-center text-[#FFBB54]">
                        <DollarSign className="h-3 w-3 mr-0.5" />
                        <span className="font-medium">{notification.usdValue.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#B8B7D8] mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
