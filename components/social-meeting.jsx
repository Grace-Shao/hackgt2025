"use client"

import Link from "next/link"
import { useState } from "react"
import { Users } from "lucide-react"

export default function SocialMeeting() {
  const [loading, setLoading] = useState(false)

  async function handleCreateMeet(e) {
    // prevent the parent Link click
    e.stopPropagation()
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/google/create-meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: 'Teacher meeting', durationMins: 30, attendees: [] }),
      })

      const data = await res.json()
      if (!res.ok) {
        console.error('Create meet failed', data)
        alert('Failed to create meeting')
        return
      }

      const meetLink = data.meetLink || data.htmlLink
      if (meetLink) {
        window.open(meetLink, '_blank')
      } else {
        alert('Meeting created — no external link returned')
      }
    } catch (err) {
      console.error(err)
      alert('Error creating meeting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <Link href="/meet" aria-label="Open meetings" className="rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-md bg-amber-300 border border-amber-400 hover:scale-105">
        <Users className="w-6 h-6 text-[#6b4b3e]" aria-hidden="true" />
        <span className="sr-only">Open social meetings</span>
      </Link>
    </div>
  )
}
