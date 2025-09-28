import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <nav className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <span className="text-lg font-semibold text-foreground">CogniCare</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="align-middle text-primary font-medium hover:text-primary/80 transition-colors">
                Home
              </a>
              <a href="#" className="align-middle text-muted-foreground hover:text-foreground transition-colors">
                Calendar
              </a>
              <a href="#" className="align-middle text-muted-foreground hover:text-foreground transition-colors">
                Profile
              </a>
              <a href="#" className="align-middle text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </div>
          </nav>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
