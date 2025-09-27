import { Header } from "@/components/header"
import { PatientDashboard } from "@/components/patient-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <PatientDashboard />
      </main>
    </div>
  )
}
