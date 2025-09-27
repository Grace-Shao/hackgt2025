import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Gamepad2 } from "lucide-react"
import Image from "next/image"

export default function ClassroomPage() {
  const gameStations = [
    {
      id: 1,
      name: "Game1",
      type: "Memory Match",
      difficulty: "Easy",
      position: { top: "20%", left: "25%" },
    },
    {
      id: 2,
      name: "Game2",
      type: "Word Puzzle",
      difficulty: "Medium",
      position: { top: "20%", left: "55%" },
    },
    {
      id: 3,
      name: "Game3",
      type: "Number Logic",
      difficulty: "Easy",
      position: { top: "40%", left: "15%" },
    },
    {
      id: 4,
      name: "Game4",
      type: "Pattern Match",
      difficulty: "Hard",
      position: { top: "40%", left: "65%" },
    },
  ]

  const classroomItems = [
    {
      name: "Teacher Desk",
      icon: "👩‍🏫",
      position: { top: "5%", left: "35%" },
      color: "bg-amber-300",
    },
    {
      name: "Computer",
      icon: "💻",
      position: { top: "15%", left: "85%" },
      color: "bg-gray-300",
    },
    {
      name: "TV",
      icon: "📺",
      position: { top: "45%", left: "2%" },
      color: "bg-slate-400",
    },
    {
      name: "Storage",
      icon: "📦",
      position: { top: "15%", left: "5%" },
      color: "bg-orange-300",
    },
    {
      name: "Bookshelf",
      icon: "📚",
      position: { top: "35%", left: "93%" },
      color: "bg-purple-400",
    },
  ]

  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Virtual Classroom</h1>
              <p className="text-muted-foreground">Click on any game station to start playing</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="relative">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            Welcome to Your Brain Training Classroom
          </h2>

          <div className="relative bg-yellow-100 rounded-2xl p-8 shadow-lg border border-yellow-300 overflow-hidden">
            {/* Classroom Floor Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, #facc15 1px, transparent 1px),
                  linear-gradient(#facc15 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />

            {/* Main Classroom Area */}
            <div className="relative h-[700px] w-full">
              <div className="absolute top-[5%] left-[35%] w-[30%] h-[15%] bg-amber-300 rounded-lg border border-amber-400 shadow-md">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl">👩‍🏫</div>
                </div>
                {/* Teacher's Chair */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-400 rounded-full border border-green-500 shadow-sm"></div>
              </div>

              <div className="absolute top-[15%] left-[5%] w-[12%] h-[25%] bg-orange-300 rounded border border-orange-400 shadow-md">
                <div className="flex items-center justify-center h-full">
                  <div className="text-xl">📦</div>
                </div>
              </div>

              <div className="absolute top-[15%] right-[5%] w-[12%] h-[15%] bg-gray-300 rounded border border-gray-400 shadow-md">
                <div className="flex items-center justify-center h-full">
                  <div className="text-xl">💻</div>
                </div>
              </div>

              <div className="absolute top-[45%] left-[2%] w-[10%] h-[12%] bg-slate-400 rounded border border-slate-500 shadow-md">
                <div className="flex items-center justify-center h-full">
                  <div className="text-xl">📺</div>
                </div>
              </div>

              <div className="absolute top-[35%] right-[2%] w-[10%] h-[20%] bg-purple-400 rounded border border-purple-500 shadow-md">
                <div className="flex items-center justify-center h-full">
                  <div className="text-xl">📚</div>
                </div>
              </div>

              {gameStations.map((station, index) => (
                <div key={station.id} className="absolute" style={station.position}>
                  <Link href={`/games/${station.id}`}>
                    {/* Desk */}
                    <div className="relative group cursor-pointer w-40 h-32 transform transition-all duration-200 hover:scale-110 hover:shadow-lg hover:-translate-y-1">
                      <Image
                        src="/illustrations/desk-multi.svg"
                        alt={`${station.name} desk`}
                        width={160}
                        height={128}
                        className="pointer-events-none select-none w-full h-auto"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                        <div className="text-lg font-bold text-gray-800">{station.name}</div>
                        <div className="text-xs text-gray-700 text-center font-semibold">{station.type}</div>
                        <div className="text-xs mt-1 px-2 py-0.5 bg-white rounded border border-gray-300 text-gray-800 font-bold shadow-sm">
                          {station.difficulty}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}

              {/* Regular Student Desks (non-game stations) */}
              {classroomItems.map((item, index) => (
                <div key={index} className="absolute" style={item.position}>
                  <div className={`${item.color} rounded border border-gray-300 shadow-md`}>
                    <div className="flex items-center justify-center h-full">
                      <div className="text-xl">{item.icon}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-[10%] right-[8%] w-8 h-10 bg-gray-400 rounded border border-gray-500 shadow-md">
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm">🗑️</div>
                </div>
              </div>

              <div className="absolute bottom-[5%] left-[45%] w-16 h-4 bg-amber-500 rounded-t border border-amber-600 shadow-md"></div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-sage-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-foreground flex items-center justify-center gap-2">
                  <Gamepad2 className="w-6 h-6" />
                  How to Play
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center font-bold text-sage-800">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Choose a Game Station</p>
                      <p className="text-sm text-muted-foreground">Click on any colored game desk to start</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center font-bold text-sage-800">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Play & Learn</p>
                      <p className="text-sm text-muted-foreground">Exercise your brain with fun activities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center font-bold text-sage-800">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Track Progress</p>
                      <p className="text-sm text-muted-foreground">See your improvement over time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
