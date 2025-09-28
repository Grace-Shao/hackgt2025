import { HCPNav } from "@/components/hcp-nav";
import PatientDashboard from "@/components/patient-dashboard"

export default function MedicalDashboard() {
  return (
    <div className="min-h-screen medical-theme">
      <HCPNav/>
      <main className="container mx-auto px-4 py-6">
        <PatientDashboard />
      </main>
    </div>
  )
}
