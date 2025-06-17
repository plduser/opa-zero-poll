"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function KSEFReportsPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/ksef")
  }, [router])

  return null
}
