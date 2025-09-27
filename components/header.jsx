import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-semibold text-foreground text-lg">MedCare</span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Home
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Calendar
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Profile
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </nav>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
