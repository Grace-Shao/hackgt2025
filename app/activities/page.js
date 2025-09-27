"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Activity, Calendar, Clock, MapPin, Heart, Coffee, Music, Book, Palette } from "lucide-react"

const activities = [
  {
    id: 1,
    title: "Morning Coffee Circle",
    description: "Social gathering for patients to share stories and connect over coffee",
    type: "Socialization",
    time: "9:00 AM - 10:00 AM",
    participants: 8,
    location: "Beanbag Lounge",
    icon: Coffee,
    color: "bg-amber-500",
    status: "Active"
  },
  {
    id: 2,
    title: "Memory Lane Music",
    description: "Music therapy session to stimulate memory and emotional well-being",
    type: "Cognitive",
    time: "10:30 AM - 11:30 AM",
    participants: 12,
    location: "Activity Room A",
    icon: Music,
    color: "bg-purple-500",
    status: "Scheduled"
  },
  {
    id: 3,
    title: "Storytelling Circle",
    description: "Interactive storytelling to improve communication and memory",
    type: "Socialization",
    time: "2:00 PM - 3:00 PM",
    participants: 6,
    location: "Beanbag Lounge",
    icon: Book,
    color: "bg-blue-500",
    status: "Active"
  },
  {
    id: 4,
    title: "Art Therapy Workshop",
    description: "Creative expression through painting and drawing for cognitive stimulation",
    type: "Creative",
    time: "3:30 PM - 4:30 PM",
    participants: 10,
    location: "Art Studio",
    icon: Palette,
    color: "bg-green-500",
    status: "Scheduled"
  },
  {
    id: 5,
    title: "Gentle Movement Class",
    description: "Low-impact exercises designed for cognitive and physical wellness",
    type: "Physical",
    time: "11:00 AM - 12:00 PM",
    participants: 15,
    location: "Movement Room",
    icon: Activity,
    color: "bg-red-500",
    status: "Completed"
  }
]

const areas = [
  {
    name: "Beanbag Socialization Lounge",
    description: "Comfortable seating area with beanbags designed for social interaction and relaxation",
    capacity: 20,
    features: ["Soft lighting", "Comfortable seating", "Quiet atmosphere", "Social games"],
    currentOccupancy: 8,
    icon: Users,
    color: "bg-blue-500"
  },
  {
    name: "Activity Center",
    description: "Multi-purpose space for structured activities and cognitive exercises",
    capacity: 25,
    features: ["Interactive displays", "Flexible seating", "Audio/Visual equipment", "Storage"],
    currentOccupancy: 12,
    icon: Activity,
    color: "bg-green-500"
  }
]

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800"
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getTypeColor(type) {
  switch (type.toLowerCase()) {
    case "socialization":
      return "bg-purple-100 text-purple-800"
    case "cognitive":
      return "bg-blue-100 text-blue-800"
    case "creative":
      return "bg-green-100 text-green-800"
    case "physical":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ActivitiesPage() {
  const [selectedArea, setSelectedArea] = useState(null)
  const [filter, setFilter] = useState("All")

  const filteredActivities = activities.filter(activity => 
    filter === "All" || activity.type === filter
  )

  const activityTypes = ["All", "Socialization", "Cognitive", "Creative", "Physical"]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Activities & Socialization Areas</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed spaces and structured activities to promote cognitive health, social interaction, 
              and overall well-being for patients with mental disabilities.
            </p>
          </div>

          {/* Areas Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {areas.map((area, index) => {
              const IconComponent = area.icon
              const occupancyPercentage = (area.currentOccupancy / area.capacity) * 100
              
              return (
                <div key={index} className="bg-card p-6 rounded-lg border">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${area.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{area.name}</h3>
                      <p className="text-muted-foreground mb-4">{area.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Current Occupancy</span>
                          <span className="text-sm">{area.currentOccupancy}/{area.capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${area.color}`}
                            style={{ width: `${occupancyPercentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {area.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Activity Filter */}
          <div className="flex justify-center">
            <div className="flex space-x-2 bg-muted p-1 rounded-lg">
              {activityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Activities Schedule */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Today's Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => {
                const IconComponent = activity.icon
                
                return (
                  <div key={activity.id} className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg leading-tight">{activity.title}</h3>
                          <Badge variant="secondary" className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {activity.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {activity.time}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {activity.location}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-2" />
                            {activity.participants} participants
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="secondary" className={getTypeColor(activity.type)}>
                            {activity.type}
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4 text-center">Today's Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">51</div>
                <div className="text-sm text-muted-foreground">Total Participants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.2</div>
                <div className="text-sm text-muted-foreground">Avg Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">92%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
