"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Search, Plus, Video, MoreHorizontal, Edit, Trash2, Brain, Activity, Users } from "lucide-react"

const PALETTE = {
    dark: "#6b4b3e",
    tan: "#c49e85",
    lightBrown: "#ffd6af",
    background: "#f8f4f9",
    lavender: "#BEA7E5",
}

const BUTTON_BASE =
    "rounded-full px-6 h-11 text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"

const initialPatients = [
    {
        id: 1,
        name: "Jane Doe",
        email: "jdoe@email.com",
        conditions: ["Alzheimer's", "Dementia"],
        priority: "High",
        lastSeen: "Today 8:00 PM",
        hasVideo: true,
        cognitiveScore: 72,
        activities: 8,
    },
    {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@email.com",
        conditions: ["Parkinson's"],
        priority: "Medium",
        lastSeen: "Yesterday 2:30 PM",
        hasVideo: false,
        cognitiveScore: 85,
        activities: 12,
    },
    {
        id: 3,
        name: "Michael Chen",
        email: "michael@email.com",
        conditions: ["Stroke Recovery"],
        priority: "Low",
        lastSeen: "2 days ago",
        hasVideo: false,
        cognitiveScore: 91,
        activities: 15,
    },
    {
        id: 4,
        name: "Emma Davis",
        email: "emma@email.com",
        conditions: ["MCI"],
        priority: "Low",
        lastSeen: "3 days ago",
        hasVideo: false,
        cognitiveScore: 78,
        activities: 6,
    },
    {
        id: 5,
        name: "Robert Wilson",
        email: "robert@email.com",
        conditions: ["Social"],
        priority: "Low",
        lastSeen: "4 days ago",
        hasVideo: false,
        cognitiveScore: 88,
        activities: 10,
    },
    {
        id: 6,
        name: "Lisa Anderson",
        email: "lisa@email.com",
        conditions: ["Alzheimer's"],
        priority: "High",
        lastSeen: "5 days ago",
        hasVideo: false,
        cognitiveScore: 65,
        activities: 4,
    },
    {
        id: 7,
        name: "David Brown",
        email: "david@email.com",
        conditions: ["Dementia", "Stroke Recovery"],
        priority: "High",
        lastSeen: "1 week ago",
        hasVideo: false,
        cognitiveScore: 58,
        activities: 3,
    },
]

const tabs = ["All", "Dementia", "Alzheimer's", "Parkinson's", "Stroke Recovery", "MCI", "Social"]
const conditionOptions = ["Alzheimer's", "Dementia", "Parkinson's", "Stroke Recovery", "MCI", "Social"]
const priorityOptions = ["High", "Medium", "Low"]

function getPriorityColor(priority) {
    switch (priority.toLowerCase()) {
        case "high":
            return "bg-red-100 text-red-800 hover:bg-red-200"
        case "medium":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        case "low":
            return "bg-green-100 text-green-800 hover:bg-green-200"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
}

function getConditionColor(condition) {
    switch (condition.toLowerCase()) {
        case "alzheimer's":
        case "alzheimer":
            return "bg-amber-100 text-amber-800 hover:bg-amber-200"
        case "dementia":
            return "bg-green-100 text-green-800 hover:bg-green-200"
        case "parkinson's":
        case "parkinsons":
            return "bg-purple-100 text-purple-800 hover:bg-purple-200"
        case "stroke recovery":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200"
        case "mci":
            return "bg-pink-100 text-pink-800 hover:bg-pink-200"
        case "social":
            return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
}

function getCognitiveScoreColor(score) {
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
}

export function PatientDashboard() {
    const [patients, setPatients] = useState(initialPatients)
    const [activeTab, setActiveTab] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [editingPatient, setEditingPatient] = useState(null)
    const [deletingPatient, setDeletingPatient] = useState(null)
    const [addingClient, setAddingClient] = useState(false)
    const [editForm, setEditForm] = useState({
        name: "",
        conditions: [],
        priority: "",
        lastSeen: "",
    })
    const [addForm, setAddForm] = useState({
        name: "",
        email: "",
        conditions: [],
        priority: "Low",
    })

    const filteredPatients = patients.filter((patient) => {
        // Filter by search query
        const matchesSearch = searchQuery === "" ||
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.conditions.some(condition =>
                condition.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            patient.priority.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter by active tab
        const matchesTab = activeTab === "All" ||
            patient.conditions.some(
                (condition) =>
                    condition.toLowerCase().includes(activeTab.toLowerCase()) ||
                    (activeTab === "Alzheimer" && condition.toLowerCase().includes("alzheimer")) ||
                    (activeTab === "Parkinsons" && condition.toLowerCase().includes("parkinson")),
            )

        return matchesSearch && matchesTab
    })

    const handleEditPatient = (patient) => {
        setEditingPatient(patient)
        setEditForm({
            name: patient.name,
            conditions: patient.conditions,
            priority: patient.priority,
            lastSeen: patient.lastSeen,
        })
    }

    const handleSaveEdit = () => {
        setPatients(patients.map((p) => (p.id === editingPatient.id ? { ...p, ...editForm } : p)))
        setEditingPatient(null)
    }

    const handleDeletePatient = () => {
        setPatients(patients.filter((p) => p.id !== deletingPatient.id))
        setDeletingPatient(null)
    }

    const toggleCondition = (condition) => {
        setEditForm((prev) => ({
            ...prev,
            conditions: prev.conditions.includes(condition)
                ? prev.conditions.filter((c) => c !== condition)
                : [...prev.conditions, condition],
        }))
    }

    const handleAddClient = () => {
        setAddingClient(true)
        setAddForm({
            name: "",
            email: "",
            conditions: [],
            priority: "Low",
        })
    }

    const handleSaveNewClient = () => {
        if (!addForm.name.trim() || !addForm.email.trim()) {
            return // Don't save if name or email is empty
        }

        const newClient = {
            id: Math.max(...patients.map(p => p.id)) + 1,
            name: addForm.name.trim(),
            email: addForm.email.trim(),
            conditions: addForm.conditions,
            priority: addForm.priority,
            lastSeen: "N/A",
            hasVideo: false,
            cognitiveScore: "N/A",
            activities: 0,
        }
        setPatients([...patients, newClient])
        setAddingClient(false)
    }

    const toggleAddCondition = (condition) => {
        setAddForm((prev) => ({
            ...prev,
            conditions: prev.conditions.includes(condition)
                ? prev.conditions.filter((c) => c !== condition)
                : [...prev.conditions, condition],
        }))
    }

    // Calculate dashboard stats
    const totalPatients = patients.length
    const highPriorityPatients = patients.filter(p => p.priority === "High").length
    const patientsWithScores = patients.filter(p => p.cognitiveScore !== "N/A")
    const averageCognitiveScore = patientsWithScores.length > 0
        ? Math.round(patientsWithScores.reduce((sum, p) => sum + p.cognitiveScore, 0) / patientsWithScores.length)
        : 0
    const totalActivities = patients.reduce((sum, p) => sum + p.activities, 0)

    return (
        <div
            className="relative min-h-screen py-10 px-4 md:px-10"
            style={{ backgroundColor: PALETTE.background, color: PALETTE.dark }}
        >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute -top-24 -right-12 h-64 w-64 rounded-full bg-[rgba(190,167,229,0.25)] blur-3xl" />
                <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[rgba(255,214,175,0.35)] blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto flex max-w-6xl flex-col space-y-8">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/80 p-5 shadow-sm">
                        <div className="flex items-center gap-3 text-sm font-medium text-[#6b4b3e] opacity-80">
                            <Users className="h-5 w-5 text-[#6b4b3e]" />
                            Total Patients
                        </div>
                        <div className="mt-3 text-3xl font-semibold text-[#4b2f23]">{totalPatients}</div>
                    </div>
                    <div className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/80 p-5 shadow-sm">
                        <div className="flex items-center gap-3 text-sm font-medium text-[#6b4b3e] opacity-80">
                            <Brain className="h-5 w-5 text-[#6b4b3e]" />
                            Avg Cognitive Score
                        </div>
                        <div className={`mt-3 text-3xl font-semibold ${getCognitiveScoreColor(averageCognitiveScore)}`}>
                            {averageCognitiveScore}%
                        </div>
                    </div>
                    <div className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/80 p-5 shadow-sm">
                        <div className="flex items-center gap-3 text-sm font-medium text-[#6b4b3e] opacity-80">
                            <Activity className="h-5 w-5 text-[#6b4b3e]" />
                            Total Activities
                        </div>
                        <div className="mt-3 text-3xl font-semibold text-[#4b2f23]">{totalActivities}</div>
                    </div>
                    <div className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/80 p-5 shadow-sm">
                        <div className="flex items-center gap-3 text-sm font-medium text-[#6b4b3e] opacity-80">
                            <div className="h-5 w-5 rounded-full border border-red-200 bg-red-100" />
                            High Priority
                        </div>
                        <div className="mt-3 text-3xl font-semibold text-[#4b2f23]">{highPriorityPatients}</div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-[#4b2f23]">Dr. John Stuart</h1>
                        <p className="text-sm text-[#6b4b3e] opacity-70">
                            Monitoring patient cognition, activity, and support plans.
                        </p>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-3">
                        <Button
                            variant="ghost"
                            className={`${BUTTON_BASE} bg-white/85 text-[#4b2f23] hover:bg-[#f4ece6] focus-visible:outline-[#6b4b3e] flex items-center gap-2`}
                        >
                            <Activity className="h-4 w-4" />
                            Activities
                        </Button>
                        <Button
                            className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e] flex items-center gap-2`}
                            onClick={handleAddClient}
                        >
                            <Plus className="h-4 w-4" />
                            Add client
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b4b3e] opacity-60" />
                    <Input
                        placeholder="Search patients..."
                        className="h-11 rounded-full border border-[rgba(107,75,62,0.2)] bg-white/85 pl-11 text-sm text-[#4b2f23] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${isActive
                                    ? "bg-[#BEA7E5] text-[#4b2f23]"
                                    : "bg-white/75 text-[#6b4b3e] hover:bg-[#f4ece6]"}
                                `}
                            >
                                {tab}
                            </button>
                        )
                    })}
                </div>

                {/* Patient Table */}
                <div className="rounded-3xl border border-[rgba(107,75,62,0.15)] bg-white/85 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[#4b2f23]">
                            <thead className="bg-[rgba(190,167,229,0.18)] text-xs uppercase tracking-wide text-[#4b2f23]">
                                <tr>
                                    <th className="px-4 py-4 text-left font-semibold">Name</th>
                                    <th className="px-4 py-4 text-left font-semibold">Conditions</th>
                                    <th className="px-4 py-4 text-left font-semibold">Priority</th>
                                    <th className="px-4 py-4 text-left font-semibold">Cognitive Score</th>
                                    <th className="px-4 py-4 text-left font-semibold">Activities</th>
                                    <th className="px-4 py-4 text-left font-semibold">Last seen</th>
                                    <th className="px-4 py-4 text-left font-semibold">Video Call</th>
                                    <th className="w-12" aria-label="Actions" />
                                </tr>
                            </thead>
                        <tbody className="divide-y divide-[rgba(107,75,62,0.08)]">
                            {filteredPatients.map((patient) => (
                                <tr key={patient.id} className="transition-colors hover:bg-[rgba(190,167,229,0.1)]">
                                    <td className="py-4 px-4">
                                        {patient.id === 1 ? (
                                            <Link href="/hcp/dashboard" className="group block">
                                                <div className="font-medium text-[#6b4b3e] group-hover:underline">
                                                    {patient.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{patient.email}</div>
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                className="group block w-full cursor-pointer bg-transparent p-0 text-left focus:outline-none"
                                                aria-label={`${patient.name} patient record (preview)`}
                                                onClick={(event) => event.preventDefault()}
                                            >
                                                <div className="font-medium text-[#6b4b3e] group-hover:underline">
                                                    {patient.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{patient.email}</div>
                                            </button>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-wrap gap-1">
                                            {patient.conditions.map((condition) => (
                                                <Badge key={condition} variant="secondary" className={getConditionColor(condition)}>
                                                    {condition}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <Badge variant="secondary" className={getPriorityColor(patient.priority)}>
                                            {patient.priority}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`font-medium ${patient.cognitiveScore === "N/A" ? "text-muted-foreground" : getCognitiveScoreColor(patient.cognitiveScore)}`}>
                                            {patient.cognitiveScore === "N/A" ? "N/A" : `${patient.cognitiveScore}%`}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-muted-foreground">{patient.activities} completed</span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-muted-foreground">{patient.lastSeen}</td>
                                    <td className="py-4 px-4">
                                        <Button asChild variant="ghost" size="sm" className="p-2 text-[#6b4b3e] hover:bg-[#f4ece6]">
                                            <Link href="/meet">
                                                <Video className="w-5 h-5" />
                                            </Link>
                                        </Button>
                                    </td>
                                    <td className="py-4 px-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="p-2 text-[#6b4b3e] hover:bg-[#f4ece6]">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit client details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingPatient(patient)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete client
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            </div>

            <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Client Details</DialogTitle>
                        <DialogDescription>Make changes to the client information here.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Conditions</Label>
                            <div className="flex flex-wrap gap-2">
                                {conditionOptions.map((condition) => (
                                    <button
                                        key={condition}
                                        type="button"
                                        onClick={() => toggleCondition(condition)}
                                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${editForm.conditions.includes(condition)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:bg-muted"
                                            }`}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={editForm.priority}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map((priority) => (
                                        <SelectItem key={priority} value={priority}>
                                            {priority}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastSeen">Last Seen</Label>
                            <Input
                                id="lastSeen"
                                value={editForm.lastSeen}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, lastSeen: e.target.value }))}
                                placeholder="e.g., Today 3:00 PM, Yesterday, 2 days ago"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPatient(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deletingPatient} onOpenChange={() => setDeletingPatient(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove client "{deletingPatient?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingPatient(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePatient}>
                            Yes, delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={addingClient} onOpenChange={() => setAddingClient(false)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>Enter the client information to add them to your dashboard.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-name">Name *</Label>
                            <Input
                                id="add-name"
                                value={addForm.name}
                                onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter client name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-email">Email *</Label>
                            <Input
                                id="add-email"
                                type="email"
                                value={addForm.email}
                                onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                                placeholder="Enter client email"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Conditions</Label>
                            <div className="flex flex-wrap gap-2">
                                {conditionOptions.map((condition) => (
                                    <button
                                        key={condition}
                                        type="button"
                                        onClick={() => toggleAddCondition(condition)}
                                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${addForm.conditions.includes(condition)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:bg-muted"
                                            }`}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-priority">Priority</Label>
                            <Select
                                value={addForm.priority}
                                onValueChange={(value) => setAddForm((prev) => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map((priority) => (
                                        <SelectItem key={priority} value={priority}>
                                            {priority}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddingClient(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveNewClient}
                            disabled={!addForm.name.trim() || !addForm.email.trim()}
                        >
                            Add Client
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
