import Link from "next/link"
import { Gamepad2 } from "lucide-react"
import { User, BookOpen, Brain, Target } from "lucide-react"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import SocialMeeting from "@/components/social-meeting"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"

export default function ClassroomPage() {
  const gameStations = [
    {
      id: 1,
      name: "Face Match",
      type: "Face Recognition",
      difficulty: "Hard",
      position: { top: "20%", left: "25%" },
      route: "/games/face",
    },
    {
      id: 2,
      name: "Word Memory",
      type: "Word Puzzle",
      difficulty: "Medium",
      position: { top: "20%", left: "55%" },
      route: "/games/word-games/memory",
    },
    {
      id: 3,
      name: "Memory Game",
      type: "Can you remember the notes?",
      difficulty: "Easy",
      position: { top: "50%", left: "15%" },
      route: "/games/memory",
    },
    {
      id: 4,
      name: "Game4",
      type: "Pattern Match",
      difficulty: "Hard",
      position: { top: "50%", left: "65%" },
    },
  ]

  // classroomItems removed — only the social meeting (teacher) remains on the floor

  // icon components for each game station (no emoji)
  const gameIcons = {
    1: <User className="w-6 h-5 text-gray-800" aria-hidden />,
    2: <BookOpen className="w-6 h-5 text-gray-800" aria-hidden />,
    3: <Brain className="w-6 h-5 text-gray-800" aria-hidden />,
    4: <Target className="w-6 h-5 text-gray-800" aria-hidden />,
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <MainNav />

      <div className="container mx-auto px-6 py-8">
        <div className="relative">
          <h2
            className="text-2xl font-bold text-center mb-8 text-foreground"
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: "3rem",
              color: "#6b4b3e",
              marginBottom: "1.5rem",
            }}
          >
            ☕️ Welcome to our Cozy Coffee and Games Community
          </h2>

          {/* Instructions (accessible dropdown for elderly users) */}
          <div className="mt-8 text-center mb-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-3 rounded-lg px-5 py-3 text-lg font-semibold shadow-md hover:bg-opacity-95 focus:outline-none text-white"
                  style={{ backgroundColor: '#c9a079' }}
                  aria-expanded="false"
                >
                  <Gamepad2 className="w-6 h-6" />
                  How to Play
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={8} align="center" className="p-6 w-[min(720px,92vw)] bg-white border border-slate-200 rounded-lg shadow-lg">
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3 text-lg">
                    <div className="w-10 h-10 bg-sage-200 rounded-full flex items-center justify-center font-bold text-sage-800">1</div>
                    <div>
                      <p className="font-semibold text-lg">Choose a Game Station</p>
                      <p className="text-sm">Click on any colored game desk to start</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-lg">
                    <div className="w-10 h-10 bg-sage-200 rounded-full flex items-center justify-center font-bold text-sage-800">2</div>
                    <div>
                      <p className="font-semibold text-lg">Play & Learn</p>
                      <p className="text-sm">Exercise your brain with fun activities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-lg">
                    <div className="w-10 h-10 bg-sage-200 rounded-full flex items-center justify-center font-bold text-sage-800">3</div>
                    <div>
                      <p className="font-semibold text-lg">Track Progress</p>
                      <p className="text-sm">See your improvement over time</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative bg-yellow-100 rounded-2xl p-8 shadow-lg border border-yellow-300 overflow-hidden">
            {/* Classroom Floor Pattern */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(to bottom,
                    #d7b48a 0 56px,
                    #9b5f3a 56px 112px
                  ),
                  linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01)),
                  radial-gradient(circle at 12% 22%, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0) 10px),
                  radial-gradient(circle at 72% 64%, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0) 8px)
                `,
                backgroundSize: "100% 112px, 100% 100%, 220px 220px, 180px 180px",
                backgroundRepeat: "repeat, no-repeat, repeat, repeat",
                backgroundPosition: "0 0, 0 0, 0 0, 0 0",
                filter: "saturate(1.02) contrast(0.98)",
              }}
            />

            {/* Main Classroom Area */}
            <div className="relative h-[700px] w-full">
              <div className="absolute top-[5%] left-[35%] w-[30%] h-[15%] bg-amber-300 rounded-lg border border-amber-400 shadow-md flex items-center justify-center">
                <SocialMeeting />
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
                  <Link href={station.route ?? `/games/${station.id}`}>
                    {/* Desk */}
                    <div className="relative group cursor-pointer w-[192px] h-[154px] transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:-translate-y-1">
                      <Image
                        src="/simpleTable.png"
                        alt={`${station.name} desk`}
                        width={192}
                        height={154}
                        className="pointer-events-none select-none w-full h-auto"
                      />

                      {/* Centered small white label box (icon + black title) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white rounded-md w-28 h-20 flex flex-col items-center justify-center shadow-md">
                          <div>{gameIcons[station.id] ?? <Gamepad2 className="w-5 h-5 text-gray-800" />}</div>
                          <div className="text-sm font-bold text-black mt-1">{station.name}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}

              {/* Student desks removed; only the social meeting / teacher area remains */}

              <div className="absolute bottom-[10%] right-[8%] w-8 h-10 bg-gray-400 rounded border border-gray-500 shadow-md">
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm">🗑️</div>
                </div>
              </div>

              <div className="absolute bottom-[5%] left-[45%] w-16 h-4 bg-amber-500 rounded-t border border-amber-600 shadow-md"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
