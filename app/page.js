import Link from "next/link";
import { Heart, Brain, Users, Video } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Top nav you already have */}
      <MainNav />

      {/* Decorative background dots */}
      <div className={styles.bgDots} aria-hidden />

      <main className={styles.hero}>
        {/* Center logo bubble */}
        <div className={styles.logoBubble}>
          <Heart className={styles.logoIcon} aria-hidden />
        </div>

        {/* Brand wordmark */}
        <h1 className={styles.brand}>CogniCare</h1>

        {/* Primary CTA */}
        <div className={styles.ctaRow}>
          <Link href="/classroom" className={`${styles.cta} ${styles.ctaPrimary}`}>
            <span className={styles.ctaEmoji} aria-hidden>☕</span>
            Visit Our Cozy Community
          </Link>
        </div>

        {/* Feature cards */}
        <section className={styles.features}>
          <article className={styles.card}>
            <div className={styles.cardIconWrap}>
              <Brain className={styles.cardIcon} aria-hidden />
            </div>
            <h3 className={styles.cardTitle}>Cognitive Wellness</h3>
            <p className={styles.cardText}>
              Engaging activities designed to support your cognitive health and keep your mind sharp
            </p>
          </article>

          <article className={styles.card}>
            <div className={styles.cardIconWrap}>
              <Users className={styles.cardIcon} aria-hidden />
            </div>
            <h3 className={styles.cardTitle}>Social Connection</h3>
            <p className={styles.cardText}>
              Connect with a warm community of friends in our cozy virtual cafe environment
            </p>
          </article>

          <article className={styles.card}>
            <div className={styles.cardIconWrap}>
              <Video className={styles.cardIcon} aria-hidden />
            </div>
            <h3 className={styles.cardTitle}>Professional Care</h3>
            <p className={styles.cardText}>
              Access to healthcare professionals and personalized care in a secure, private setting
            </p>
          </article>
        </section>

        {/* Tagline */}
        <p className={styles.tagline}>
          A supportive space for cognitive wellness and meaningful connections
        </p>

        {/* Secondary link for HCPs (kept subtle like the mock) */}
        <div className={styles.secondaryRow}>
          <Link href="/medical" className={styles.secondaryLink}>
            For Professionals
          </Link>
        </div>
      </main>
    </div>
  );
}
