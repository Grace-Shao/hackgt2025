// app/classroom/page.js
"use client";

import Link from "next/link";
import { Gamepad2, User, BookOpen, Brain, Target } from "lucide-react";
import Image from "next/image";
import { MainNav } from "@/components/main-nav";
import SocialMeeting from "@/components/social-meeting"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

/* -------------------- Theme -------------------- */
const cozy = {
  brown900: "#6b4b3e",
  brown700: "#8a644f",
  brown500: "#c49e85",
  peach200: "#ffd6af",
  lav300: "#bea7e5",
  woodA: "#e0bc96",
  woodB: "#d0a97f",
  woodC: "#b48357",
  woodD: "#9e6b44",
  bg: "#dbb892",
  bg2: "#cc9f79",
};

const boardFloor = {
  backgroundImage: `
    linear-gradient(45deg, rgba(107,75,62,0.06) 25%, rgba(0,0,0,0) 25%),
    linear-gradient(-45deg, rgba(107,75,62,0.06) 25%, rgba(0,0,0,0) 25%),
    linear-gradient(45deg, rgba(0,0,0,0) 75%, rgba(107,75,62,0.06) 75%),
    linear-gradient(-45deg, rgba(0,0,0,0) 75%, rgba(107,75,62,0.06) 75%),
    linear-gradient(${cozy.woodA}, ${cozy.woodB})
  `,
  backgroundSize: "42px 42px, 42px 42px, 42px 42px, 42px 42px, 100% 100%",
};

/* -------------------- Stations -------------------- */
const stations = [
  {
    id: 1,
    title: "Simon Says",
    subtitle: "Recall & remember",
    difficulty: "Easy",
    pos: { top: "42%", left: "30%" },
    href: "/games/face",
    mug: "☕",
  },
  {
    id: 2,
    title: "Word Master",
    subtitle: "Attention trainer",
    difficulty: "Medium",
    pos: { top: "42%", left: "50%" },
    href: "/games/word",
    mug: "🍵",
  },
  {
    id: 3,
    title: "Memory Recall",
    subtitle: "Vocabulary play",
    difficulty: "Medium",
    pos: { top: "42%", left: "70%" },
    href: "/games/memory",
    mug: "☕",
  },
];

// icon components for each game station (no emoji)
const gameIcons = {
  1: <User className="w-6 h-5 text-gray-800" aria-hidden />,
  2: <BookOpen className="w-6 h-5 text-gray-800" aria-hidden />,
  3: <Brain className="w-6 h-5 text-gray-800" aria-hidden />,
  4: <Target className="w-6 h-5 text-gray-800" aria-hidden />,
};

/* -------------------- Tiny building blocks -------------------- */
const border1 = "1px solid rgba(0,0,0,0.16)";
const innerSh = "0 1px 0 rgba(255,255,255,0.7) inset";

function Pill({ w = 40, h = 14, c1 = "#fff", c2 = "#fff5de", r = 999 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: `linear-gradient(${c1}, ${c2})`,
        border: border1,
        boxShadow: innerSh,
      }}
    />
  );
}

function Rug({ w = 260, h = 58, color = "#ffe9d2" }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 200,
        background:
          `radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.12), rgba(0,0,0,0) 65%), linear-gradient(135deg, #fbe4c9, ${color})`,
        border: "1px solid rgba(107,75,62,0.18)",
        boxShadow: innerSh,
        filter: "saturate(0.95)",
      }}
    />
  );
}

function Stool({ x = 0, y = 0 }) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}
      aria-hidden
    >
      {/* legs */}
      <div className="relative w-[40px] h-[40px]">
        {[-12, 12].map((dx, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: 20 + dx,
              width: 6,
              height: 18,
              borderRadius: 6,
              background: `linear-gradient(${cozy.woodD}, ${cozy.woodC})`,
              border: border1,
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            }}
          />
        ))}
      </div>
      {/* seat */}
      <div
        style={{
          width: 42,
          height: 16,
          borderRadius: 999,
          marginTop: -34,
          background: `linear-gradient(#f8e0c1, #f0cfae)`,
          border: border1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      />
    </div>
  );
}

function BookStack({ x = 0, y = 0 }) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}
      aria-hidden
    >
      <div style={{ width: 26, height: 6, background: "#d9e3ff", border: border1, borderRadius: 3 }} />
      <div style={{ width: 26, height: 6, background: "#ffd6af", border: border1, borderRadius: 3, marginTop: 2 }} />
      <div style={{ width: 26, height: 6, background: "#bea7e5", border: border1, borderRadius: 3, marginTop: 2 }} />
    </div>
  );
}

/* -------------------- Décor -------------------- */
function CafeDoor() {
  return (
    <div className="absolute" style={{ top: "8%", left: "6%" }} aria-hidden>
      <div
        className="w-[76px] h-[116px] rounded-md shadow-md relative"
        style={{
          background: `linear-gradient(${cozy.brown700}, ${cozy.brown900})`,
          border: border1,
        }}
      >
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-2 py-[2px] rounded-full"
          style={{ background: "#fff", color: cozy.brown900, border: border1 }}
        >
          CAFE
        </div>
      </div>
    </div>
  );
}

function Bookshelf({ side = "left", tall = true }) {
  const pos =
    side === "left"
      ? { left: "3%", top: tall ? "26%" : "62%" }
      : { right: "3%", top: tall ? "30%" : "66%" };

  const shelfH = tall ? 230 : 190;

  return (
    <div className="absolute" style={{ ...pos }} aria-hidden>
      <div
        className="rounded-md p-2 grid grid-rows-4 gap-2"
        style={{
          width: 80,
          height: shelfH,
          background: `linear-gradient(${cozy.woodB}, ${cozy.woodC})`,
          border: border1,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="flex items-end justify-around">
            {["#d9e3ff", "#ffd6af", "#bea7e5", "#fff"].map((c, i) => (
              <div key={i} style={{ width: 12, height: 22 + (i % 2 ? 6 : 0), background: c, border: border1, borderRadius: 3 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CozyWindow() {
  return (
    <div className="absolute" style={{ top: "9%", left: "20%" }} aria-hidden>
      <div
        className="w-[140px] h-[92px] rounded-md p-1"
        style={{
          background: `linear-gradient(${cozy.woodC}, ${cozy.woodB})`,
          border: border1,
          boxShadow: "0 6px 14px rgba(0,0,0,0.14)",
        }}
      >
        <div className="w-full h-full rounded-sm relative overflow-hidden" style={{ background: "linear-gradient(#2b3b59, #18233a)" }}>
          <div className="absolute left-3 top-3 text-yellow-200">🌙</div>
          <div className="absolute right-4 bottom-4 text-yellow-200">✨</div>
          {/* curtains */}
          <div className="absolute inset-y-0 left-0 w-3" style={{ background: "#e7d4fa", opacity: 0.8 }} />
          <div className="absolute inset-y-0 right-0 w-3" style={{ background: "#e7d4fa", opacity: 0.8 }} />
        </div>
      </div>
    </div>
  );
}

function FloorLamp() {
  return (
    <div className="absolute" style={{ top: "20%", right: "22%" }} aria-hidden>
      <div style={{ width: 2, height: 56, background: "rgba(0,0,0,0.35)", margin: "0 auto" }} />
      <div className="mx-auto rounded-b-full" style={{ width: 92, height: 26, background: cozy.brown500, boxShadow: "0 6px 10px rgba(0,0,0,0.18)" }} />
      <div className="mx-auto" style={{ marginTop: -6, width: 230, height: 90, background: "radial-gradient(ellipse at 50% 0%, rgba(255,240,210,0.45), rgba(255,240,210,0.0) 70%)" }} />
    </div>
  );
}

function WallClock() {
  return (
    <div className="absolute" style={{ top: "9%", right: "16%" }} aria-hidden>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 999,
          // background: "#fff",
          border: border1,
          color: cozy.brown900,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.14)",
          fontWeight: 700,
          fontSize: 36,
        }}
      >
        <span style={{ fontSize: 28, lineHeight: '46px' }}>🕘</span>
      </div>
    </div>
  );
}

function BulletinBoard() {
  return (
    <div className="absolute" style={{ top: "9%", right: "25%" }} aria-hidden>
      <div
        className="rounded-md p-2 grid gap-2"
        style={{
          width: 140,
          height: 92,
          background: "#f7e6c9",
          border: border1,
          boxShadow: "0 6px 14px rgba(0,0,0,0.14)",
        }}
      >
        <div className="w-full h-[36px] bg-white/90 border rounded-sm" style={{ borderColor: "rgba(0,0,0,0.16)" }} />
        <div className="grid grid-cols-3 gap-1">
          {["#d9e3ff", "#ffd6af", "#bea7e5"].map((c, i) => (
            <div key={i} className="h-[18px] rounded-sm" style={{ background: c, border: border1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StringLights() {
  const bulbs = new Array(14).fill(0);
  return (
    <div className="absolute" style={{ top: "1%", left: "11%", width: "78%" }} aria-hidden>
      <div style={{ height: 2, background: "rgba(0,0,0,0.35)", borderRadius: 2 }} />
      <div className="flex justify-between -mt-[8px]">
        {bulbs.map((_, i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: i % 3 === 0 ? "#ffd6af" : i % 3 === 1 ? "#bea7e5" : "#e8ffcc",
              boxShadow: "0 0 10px rgba(255,255,180,0.6)",
              border: border1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// CoffeeCart removed

// CatNapping removed

/* -------------------- Table station -------------------- */
function TableStation({ id, title, subtitle, difficulty, href, pos, mug }) {
  return (
    <div className="absolute" style={{ ...pos, transform: "translate(-50%, -50%)" }}>
      {/* Rug */}
      {/* <div className="flex justify-center">
        <Rug />
      </div> */}

      {/* table image wrapper (from user) */}
      <Link href={href} className="group block focus:outline-none" aria-label={`${title} station`}>
        <div className="relative group cursor-pointer w-[192px] h-[154px] transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:-translate-y-1">
          <Image
            src="/simpleTable.png"
            alt={`${title} desk`}
            width={192}
            height={154}
            className="pointer-events-none select-none w-full h-auto"
          />

          {/* Centered small white label box (icon + black title) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-md w-28 h-20 flex flex-col items-center justify-center shadow-md">
              <div>{gameIcons[id] ?? <Gamepad2 className="w-5 h-5 text-gray-800" />}</div>
              <div className="text-sm font-bold text-black mt-1">{title}</div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* -------------------- Stat cards -------------------- */
function StatCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3 mt-6">
      <div className="rounded-2xl border shadow-sm p-4" style={{ borderColor: "rgba(107,75,62,0.2)", background: "#fff", color: cozy.brown900 }}>
        <div className="font-semibold mb-2">Today’s Progress</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Activities Completed</span><span className="font-bold">3</span></div>
          <div className="flex justify-between"><span>Social Connections</span><span className="font-bold">2</span></div>
          <div className="flex justify-between"><span>Wellness Time</span><span className="font-bold">45m</span></div>
        </div>
      </div>
      <div className="rounded-2xl border shadow-sm p-4" style={{ borderColor: "rgba(107,75,62,0.2)", background: "#fff", color: cozy.brown900 }}>
        <div className="font-semibold mb-2">Community Activity</div>
        <div className="text-sm space-y-1">
          <div><b>12 people</b> in wellness activities</div>
          <div><b>4 people</b> in social circle</div>
          <div>Dr. Smith available for sessions</div>
        </div>
      </div>
      <div className="rounded-2xl border shadow-sm p-4" style={{ borderColor: "rgba(107,75,62,0.2)", background: "#fff", color: cozy.brown900 }}>
        <div className="font-semibold mb-2">Wellness Tip</div>
        <div className="text-sm opacity-90">
          “Small, daily activities add up! Try a 3-minute game after tea time ☕.”
        </div>
      </div>
    </div>
  );
}

/* -------------------- Page -------------------- */
export default function ClassroomPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: `radial-gradient(1200px 800px at 50% -200px, ${cozy.bg} 0%, ${cozy.bg2} 55%, #bf946f 100%)`,
      }}
    >
      <MainNav />

      <div className="container mx-auto px-6 py-8">
        {/* Title + How to play */}
        <h2
          className="text-center mb-6 font-[800]"
          style={{
            fontFamily: "var(--font-caveat), ui-serif, Georgia, serif",
            fontSize: "clamp(32px, 2.5vw, 42px)", 
            lineHeight: 1.1,
            color: "#6b4b3e",
          }}
        >
          The Wellness Café
        </h2>

        <div className="text-center mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center gap-3 rounded-lg px-5 py-3 text-lg font-semibold shadow-md focus:outline-none text-white"
                style={{ backgroundColor: cozy.brown500 }}
              >
                <Gamepad2 className="w-6 h-6" />
                Instructions
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={8}
              align="center"
              className="p-6 w-[min(720px,92vw)] bg-white border rounded-lg shadow-lg"
              style={{ borderColor: "rgba(107,75,62,0.2)", color: cozy.brown900 }}
            >
              <div className="space-y-4 text-left">
                {[
                  ["Choose a Game Table", "Click a wooden table or its plaque to start."],
                  ["Play & Learn", "Gentle, friendly activities that feel like a cozy café."],
                  ["Track Progress", "See your progress in the cards below."],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-3 text-lg">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{
                        background: cozy.peach200,
                        color: cozy.brown900,
                        border: "1px solid rgba(107,75,62,0.25)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{title}</p>
                      <p className="text-sm opacity-90">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Scene */}
        <div
          className="rounded-[22px] border shadow-xl relative overflow-hidden"
          style={{
            borderColor: "rgba(0,0,0,0.12)",
            background: cozy.woodA,
            boxShadow: "0 20px 60px rgba(107,75,62,0.15)",
          }}
        >
          {/* outer trim */}
          <div className="m-[14px] rounded-[18px] border relative" style={{ borderColor: "rgba(0,0,0,0.12)", background: cozy.woodB }}>
            <div className="m-[10px] rounded-[14px] border relative h-[600px]" style={{ borderColor: "rgba(0,0,0,0.12)", ...boardFloor }}>
              {/* background image for upper half (place your PNG at public/cafe-upper.png) */}
              <div className="absolute inset-x-0 top-0 h-[180px] z-0 pointer-events-none overflow-hidden rounded-[12px]">
                <Image
                  src="/cafeBG.png"
                  alt="Cafe upper"
                  fill
                  className="w-full h-full"
                  style={{ objectFit: 'cover', objectPosition: '50% 0%' }}
                />
              </div>
              {/* Ambient string lights & wall elements */}
              <StringLights />
              <CafeDoor />
              <Bookshelf side="left" tall />
              <Bookshelf side="left" tall={false} />
              <Bookshelf side="right" tall />
              <Bookshelf side="right" tall={false} />
              <CozyWindow />
              <BulletinBoard />
              <WallClock />
              <FloorLamp />

              {/* Props */}
              {/* <CoffeeCart /> */}
              {/* <CatNapping /> */}

              {/* Game tables */}
              {stations.map((s) => (
                <TableStation key={s.id} {...s} />
              ))}

              {/* Social meeting control */}
              <div className="absolute" style={{ top: "66%", left: "78%" }} aria-label="social meeting">
                <SocialMeeting />
              </div>
            </div>
          </div>
        </div>

        <StatCards />
      </div>
    </div>
  );
}
