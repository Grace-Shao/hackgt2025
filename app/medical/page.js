import { MainNav } from "@/components/main-nav";
import PatientDashboard from "@/components/patient-dashboard"

export default function MedicalDashboard() {
  return (
    <div className="min-h-screen medical-theme">
      <MainNav/>
      <main className="container mx-auto px-4 py-6">
        <PatientDashboard />
      </main>
    </div>
  )
}
