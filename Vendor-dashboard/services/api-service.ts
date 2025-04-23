/**
 * API Service for backend integration
 * This service centralizes all API calls to make backend integration easier
 */

// Types for API requests and responses
export interface TokenData {
  id: string
  balance: number
  usdValue: number
  change24h: number
}

export interface NotificationData {
  id: string
  sender: string
  amount: number
  timestamp: Date
  usdValue: number
  message: string
  read: boolean
}

export interface ActionRequest {
  tokenId: string
  action: string
  amount?: number
  proofImages?: string[]
}

export interface ActionResponse {
  success: boolean
  message: string
  transactionId?: string
}

// Mock implementation - replace with actual API calls
class ApiService {
  // Base URL for API - can be configured from environment variables
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  // Get token balance and data
  async getTokenData(): Promise<TokenData> {
    // In a real implementation, this would be a fetch call to your backend
    // For now, return mock data
    return {
      id: "gives-token",
      balance: 125,
      usdValue: 150,
      change24h: 3.5,
    }
  }

  // Get notifications
  async getNotifications(): Promise<NotificationData[]> {
    // In a real implementation, this would be a fetch call to your backend
    return [
      {
        id: "not-1",
        sender: "Alice",
        amount: 25,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        usdValue: 25 * 1.2, // $1.20 per token
        message: "Payment for community service",
        read: false,
      },
      {
        id: "not-2",
        sender: "Bob",
        amount: 10,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        usdValue: 10 * 1.2,
        message: "Weekly allocation",
        read: false,
      },
    ]
  }

  // Mark notification as read
  async markNotificationAsRead(id: string): Promise<boolean> {
    // In a real implementation, this would be a fetch call to your backend
    console.log(`Marking notification ${id} as read`)
    return true
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<boolean> {
    // In a real implementation, this would be a fetch call to your backend
    console.log("Marking all notifications as read")
    return true
  }

  // Submit an action (redeem, stake, restock)
  async submitAction(request: ActionRequest): Promise<ActionResponse> {
    // In a real implementation, this would be a fetch call to your backend
    console.log("Submitting action:", request)

    // Simulate API call
    return {
      success: true,
      message: `${request.action} action completed successfully`,
      transactionId: `tx-${Date.now()}`,
    }
  }

  // Upload proof image
  async uploadImage(imageData: string): Promise<string> {
    // In a real implementation, this would upload the image to your backend or storage service
    console.log("Uploading image, length:", imageData.length)

    // Return a mock URL - in a real implementation, this would be the URL of the uploaded image
    return imageData
  }

  // Validate token
  async validateToken(tokenId: string): Promise<boolean> {
    // In a real implementation, this would check if the token is valid
    console.log(`Validating token: ${tokenId}`)
    return true
  }
}

// Export a singleton instance
export const apiService = new ApiService()
