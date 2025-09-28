"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Home, Users, Brain, User, Menu, X, GraduationCap } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/classroom", label: "Classroom", icon: GraduationCap },
    { href: "/profile", label: "My Profile", icon: User },
  ]

  const isActive = (href) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
  }

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px 24px",
  }

  const flexStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }

  const logoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    transition: "opacity 0.2s",
  }

  const logoIconStyle = {
    width: "40px",
    height: "40px",
    backgroundColor: "#c49e85",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const logoTextStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#6b4b3e",
    margin: 0,
  }

  const logoSubtextStyle = {
    fontSize: "12px",
    color: "#9ca3af",
    margin: 0,
  }

  const navStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }

  const getButtonStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    textDecoration: "none",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: active ? "#c49e85" : "transparent",
    color: active ? "white" : "#6b4b3e",
    minHeight: "44px",
  })

  const mobileButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#6b4b3e",
  }

  const mobileNavStyle = {
    marginTop: "16px",
    paddingTop: "16px",
    paddingBottom: "16px",
    borderTop: "1px solid #e5e7eb",
  }

  const mobileNavContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }

  const getMobileButtonStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "500",
    textDecoration: "none",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: active ? "#c49e85" : "transparent",
    color: active ? "white" : "#6b4b3e",
    justifyContent: "flex-start",
    width: "100%",
    minHeight: "44px",
  })

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={flexStyle}>
          {/* Logo */}
          <Link href="/" style={logoStyle}>
            <div style={logoIconStyle}>
              <Heart style={{ width: "20px", height: "20px", color: "white" }} />
            </div>
            <div>
              <h1 style={logoTextStyle}>CogniCare</h1>
              <p style={logoSubtextStyle} className="hidden sm:block">Building connections</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav style={navStyle} className="hidden md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} style={getButtonStyle(isActive(item.href))}>
                  <Icon style={{ width: "16px", height: "16px" }} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
