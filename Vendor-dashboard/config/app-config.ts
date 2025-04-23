/**
 * Application configuration
 * This file centralizes all configuration options for the application
 */

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  // Network endpoints
  networks: {
    astar: process.env.NEXT_PUBLIC_ASTAR_ENDPOINT || "wss://astar-rpc.dwellir.com",
    polkadot: process.env.NEXT_PUBLIC_POLKADOT_ENDPOINT || "wss://rpc.polkadot.io",
  },

  // Contract addresses
  contracts: {
    giveToken: process.env.NEXT_PUBLIC_GIVE_TOKEN_ADDRESS || "0x1234567890123456789012345678901234567890",
    vendorRegistry: process.env.NEXT_PUBLIC_VENDOR_REGISTRY_ADDRESS || "0x0987654321098765432109876543210987654321",
  },

  // Explorer URLs
  explorers: {
    astar: "https://blockscout.com/astar",
    polkadot: "https://polkadot.subscan.io",
  },
}

// Token configuration
export const TOKEN_CONFIG = {
  // Token symbol
  symbol: "$GIVE",

  // Token decimal places
  decimals: 18,

  // Token standard
  standard: "PSP22",

  // Default token price in USDT
  defaultPriceUsd: 1.2,
}

// API configuration
export const API_CONFIG = {
  // Base URL for API calls
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",

  // API endpoints
  endpoints: {
    tokenData: "/token-data",
    notifications: "/notifications",
    markNotificationRead: "/notifications/read",
    markAllNotificationsRead: "/notifications/read-all",
    submitAction: "/actions/submit",
    uploadImage: "/upload",
    validateToken: "/validate-token",
  },

  // Polling intervals (in milliseconds)
  pollingIntervals: {
    tokenData: 60000, // 1 minute
    notifications: 30000, // 30 seconds
  },
}

// UI configuration
export const UI_CONFIG = {
  // Theme colors - matching Watch2Give branding
  colors: {
    primary: "#26E2A0", // Mint green from slides
    secondary: "#26A69A", // Teal
    accent: "#FF6B5B", // Coral
    background: "#2D2A5E", // Deep navy
    backgroundLight: "#3D3A7E",
    border: "#6A67A8",
    text: "#FFFFFF",
    textMuted: "#B8B7D8",
  },
}
