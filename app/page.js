import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart } from "lucide-react"
import { MainNav } from "@/components/main-nav"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <section className="py-20 px-6 bg-gradient-to-b from-accent/20 to-background">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <Heart className="w-16 h-16 text-primary mx-auto mb-6 soft-shadow" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-8 text-balance">
            Welcome Home, Friend!
          </h1>
          <p className="text-2xl text-muted-foreground mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
            You've found your cozy corner of the internet where wonderful people like you gather to chat, laugh, learn,
            and play together. Come on in and make yourself comfortable!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="text-xl px-12 py-8 rounded-2xl font-display font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/classroom">Visit Our Cozy Community</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-xl px-12 py-8 rounded-2xl font-display font-semibold bg-card hover:bg-accent/50 transition-all"
            >
              <Link href="/community">☕ Join the Coffee Chat</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
