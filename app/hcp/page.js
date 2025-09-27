"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Video, Search, Activity, Users, Gauge, AlertCircle } from "lucide-react";

const PATIENTS = [
  {
    id: "jane-doe",
    name: "Jane Doe",
    email: "jane@example.com",
    conditions: ["Alzheimer's", "Dementia"],
    priority: "High",
    cognitiveScore: 74,
    activitiesCompleted: 9,
    lastSeen: "09/27/2025 8:00PM EST",
    profileHref: "/hcp/patients/jane-doe",
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    email: "sarah@email.com",
    conditions: ["Parkinson's"],
    priority: "Medium",
    cognitiveScore: 85,
    activitiesCompleted: 12,
    lastSeen: "09/26/2025 2:30PM EST",
    profileHref: "/hcp/patients/sarah-johnson",
  },
  {
    id: "michael-chen",
    name: "Michael Chen",
    email: "michael@email.com",
    conditions: ["Stroke Recovery"],
    priority: "Low",
    cognitiveScore: 91,
    activitiesCompleted: 15,
    lastSeen: "09/25/2025 10:15AM EST",
    profileHref: "/hcp/patients/michael-chen",
  },
  {
    id: "emma-davis",
    name: "Emma Davis",
    email: "emma@email.com",
    conditions: ["MCI"],
    priority: "Low",
    cognitiveScore: 78,
    activitiesCompleted: 6,
    lastSeen: "09/24/2025 4:45PM EST",
    profileHref: "/hcp/patients/emma-davis",
  },
  {
    id: "robert-wilson",
    name: "Robert Wilson",
    email: "robert@email.com",
    conditions: ["Social"],
    priority: "Low",
    cognitiveScore: 88,
    activitiesCompleted: 10,
    lastSeen: "09/23/2025 11:20AM EST",
    profileHref: "/hcp/patients/robert-wilson",
  },
  {
    id: "lisa-anderson",
    name: "Lisa Anderson",
    email: "lisa@email.com",
    conditions: ["Alzheimer's"],
    priority: "High",
    cognitiveScore: 65,
    activitiesCompleted: 4,
    lastSeen: "09/22/2025 3:10PM EST",
    profileHref: "/hcp/patients/lisa-anderson",
  },
  {
    id: "david-brown",
    name: "David Brown",
    email: "david@email.com",
    conditions: ["Dementia", "Stroke Recovery"],
    priority: "High",
    cognitiveScore: 58,
    activitiesCompleted: 3,
    lastSeen: "09/21/2025 9:30AM EST",
    profileHref: "/hcp/patients/david-brown",
  },
];

const CONDITION_TABS = [
  "All",
  "Dementia",
  "Alzheimer's",
  "Parkinson's",
  "Stroke Recovery",
  "MCI",
  "Social",
];

function priorityBadgeClasses(priority) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-700 border border-red-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    default:
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }
}

function conditionBadgeClasses(condition) {
  const map = {
    "Alzheimer's": "bg-amber-100 text-amber-700 border border-amber-200",
    Dementia: "bg-green-100 text-green-700 border border-green-200",
    "Parkinson's": "bg-purple-100 text-purple-700 border border-purple-200",
    "Stroke Recovery": "bg-blue-100 text-blue-700 border border-blue-200",
    MCI: "bg-pink-100 text-pink-700 border border-pink-200",
    Social: "bg-cyan-100 text-cyan-700 border border-cyan-200",
  };
  return map[condition];
}

function scoreColor(score) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
}

export default function HcpPatientsList() {
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = PATIENTS;
    if (activeTab !== "All") {
      list = list.filter((p) => p.conditions.includes(activeTab));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.conditions.some((c) => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeTab, query]);

  const totals = useMemo(() => {
    const totalPatients = PATIENTS.length;
    const avgScore = Math.round(
      PATIENTS.reduce((acc, p) => acc + p.cognitiveScore, 0) / totalPatients
    );
    const highPriority = PATIENTS.filter((p) => p.priority === "High").length;
    const totalActivities = PATIENTS.reduce(
      (acc, p) => acc + p.activitiesCompleted,
      0
    );
    return { totalPatients, avgScore, highPriority, totalActivities };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5" />
            <div>
              <div className="text-xs text-muted-foreground">Total Patients</div>
              <div className="text-xl font-semibold">{totals.totalPatients}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Gauge className="h-5 w-5" />
            <div>
              <div className="text-xs text-muted-foreground">Avg Cognitive Score</div>
              <div className="text-xl font-semibold">{totals.avgScore}%</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-5 w-5" />
            <div>
              <div className="text-xs text-muted-foreground">Total Activities</div>
              <div className="text-xl font-semibold">{totals.totalActivities}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-xs text-muted-foreground">High Priority</div>
              <div className="text-xl font-semibold">{totals.highPriority}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dr. John Stuart</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Activity className="h-4 w-4"/>Activities</Button>
          <Button>Add client</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search patients…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="w-full flex flex-wrap">
            {CONDITION_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <CardTitle className="text-base">Patients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Conditions</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Cognitive Score</th>
                  <th className="px-6 py-3 font-medium">Activities</th>
                  <th className="px-6 py-3 font-medium">Last seen</th>
                  <th className="px-6 py-3 font-medium">Video Call</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <a href={p.profileHref} className="font-medium hover:underline">
                          {p.name}
                        </a>
                        <span className="text-muted-foreground">{p.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {p.conditions.map((c) => (
                          <Badge key={c} className={conditionBadgeClasses(c)} variant="secondary">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={priorityBadgeClasses(p.priority)} variant="secondary">
                        {p.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${scoreColor(p.cognitiveScore)}`}>
                        {p.cognitiveScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">{p.activitiesCompleted} completed</td>
                    <td className="px-6 py-4">{p.lastSeen}</td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="icon" aria-label={`Start video call with ${p.name}`}>
                        <Video className="h-5 w-5" />
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost">•••</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-6 py-10 text-center text-muted-foreground" colSpan={8}>
                      No patients match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
