"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Brain, Heart, Sparkles } from "lucide-react"
import styles from "./login.module.css"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialMode = useMemo(() => {
    const q = searchParams.get("mode")
    return q === "pro" ? "pro" : "patient"
  }, [searchParams])

  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    // TODO: replace this with your real auth call
    // await signIn(email, password, mode)

    // Route by role
    if (mode === "pro") {
      router.push("/medical")
    } else {
      router.push("/classroom")
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgDots} aria-hidden />

      <main className={styles.centerWrap}>
        <section className={styles.card} aria-labelledby="brandTitle">
          {/* App icon */}
          <div className={styles.appIcon}>
            <div className={styles.appIconInner}>
              <Brain className={styles.appIconBrain} aria-hidden />
              <Sparkles className={styles.appIconSpark} aria-hidden />
            </div>
          </div>

          {/* Brand */}
          <h1 id="brandTitle" className={styles.brand}>CogniCare</h1>
          <p className={styles.welcomeTitle}>Welcome to Your Wellness Journey!</p>
          <p className={styles.welcomeSub}>Access your cognitive wellness and social activities</p>

          {/* Segmented tabs */}
          <div className={styles.segmented} role="tablist" aria-label="Select portal">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "patient"}
              className={`${styles.segBtn} ${mode === "patient" ? styles.segActive : ""}`}
              onClick={() => setMode("patient")}
            >
              <Heart className={styles.segIcon} aria-hidden />
              Patient Journey
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "pro"}
              className={`${styles.segBtn} ${mode === "pro" ? styles.segActive : ""}`}
              onClick={() => setMode("pro")}
            >
              <Brain className={styles.segIcon} aria-hidden />
              Healthcare Pro
            </button>
          </div>

          {/* Auth form */}
          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting ? "Signing In…" : "Sign In"}
            </button>

            <Link href={mode === "pro" ? "/medical/signup" : "/signup"} className={styles.ghostBtn}>
              Create New Account
            </Link>
          </form>

          <p className={styles.helpText}>Need access? Contact your administrator</p>
        </section>
      </main>
    </div>
  )
}
