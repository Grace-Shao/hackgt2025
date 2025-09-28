import Link from "next/link"
import { Heart } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      <MainNav />
      <main className={styles.hero}>
        <Heart className={styles.heart} />
        <h1 className={styles.title}>Welcome Home, Friend!</h1>
        <p className={styles.description}>
          You've found your cozy corner of the internet where wonderful people like you gather to chat, laugh, learn,
          and play together.
        </p>
        <div className={styles.buttons}>
          <Link href="/classroom" className={`${styles.button} ${styles.primary}`}>
            Visit Our Cozy Community
          </Link>
          <Link href="/medical" className={`${styles.button} ${styles.secondary}`}>
            For Professionals
          </Link>
        </div>
      </main>
    </div>
  )
}
