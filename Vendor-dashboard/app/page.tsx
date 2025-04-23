import type { Metadata } from "next"
import VendorDashboard from "@/components/vendor-dashboard"

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage tokens and upload delivery proof",
}

export default function Home() {
  return <VendorDashboard />
}
