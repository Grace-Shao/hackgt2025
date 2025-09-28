"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function SocialMeeting({ mirrored = false }) {
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
      <Link
        href="/meeting"
        aria-label="Open meetings"
        className="rounded-full w-[260px] h-[260px] flex items-center justify-center hover:scale-105 overflow-hidden focus:outline-none"
      >
        <Image
          src="/beanbag.png"
          alt="Beanbag"
          width={240}
          height={240}
          className="max-w-full max-h-full object-contain"
          style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
        />
        <span className="sr-only">Open social meetings</span>
      </Link>
    </div>
  )
}
