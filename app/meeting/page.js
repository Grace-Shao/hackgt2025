// app/meeting/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { MainNav } from "@/components/main-nav";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MessageSquare,
  Users as UsersIcon,
  Smile,
  Settings,
  Volume2,
  VolumeX,
  Hand,
  Heart,
  PartyPopper,
  Sparkles,
} from "lucide-react";

/* ------- theme (same vibe) ------- */
const PALETTE = {
  dark: "#6b4b3e",
  tan: "#c49e85",
  lightBrown: "#ffd6af",
  background: "#f8f4f9",
  lavender: "#BEA7E5",
};
const BUTTON_BASE =
  "rounded-full h-12 px-5 text-[15px] font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

function cx(...a) {
  return a.filter(Boolean).join(" ");
}

const PEOPLE = [
  { id: "you", name: "You", role: "Clinician", accent: "#c49e85" },
  { id: "1", name: "Jane Doe", role: "Patient", accent: "#BEA7E5" },
  { id: "2", name: "Michael Chen", role: "Caregiver", accent: "#A7D8F7" },
];

const getInitials = (name) =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function FakeMeetingPage() {
  /* call state */
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);

  /* “who’s talking” rotation (slower now ~8s) */
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % PEOPLE.length), 8000);
    return () => clearInterval(id);
  }, []);

  /* timer */
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const timer = useMemo(() => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [seconds]);

  /* reactions + chat */
  const [reactions, setReactions] = useState([]); // {id, content}
  const [chat, setChat] = useState([
    { from: "Jane", text: "Hi everyone 👋" },
    { from: "Michael", text: "Ready to start." },
  ]);
  const [msg, setMsg] = useState("");

  function sendReaction(content) {
    const r = { id: Math.random().toString(36).slice(2), content };
    setReactions((xs) => [...xs, r]);
    setTimeout(() => setReactions((xs) => xs.filter((x) => x.id !== r.id)), 1300);
  }

  function sendMessage(e) {
    e.preventDefault();
    const t = msg.trim();
    if (!t) return;
    setChat((c) => [...c, { from: "You", text: t }]);
    setMsg("");
  }

  return (
    <div className="relative min-h-[100svh] bg-[#f8f4f9] overflow-x-hidden">
      <MainNav />

      <main className="relative min-h-[calc(100svh-64px)] py-6 px-4 md:px-8 text-[#4b2f23]">
        {/* soft blobs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-24 -right-14 h-64 w-64 rounded-full bg-[rgba(190,167,229,0.35)] blur-3xl" />
          <div className="absolute -bottom-28 -left-14 h-80 w-80 rounded-full bg-[rgba(255,214,175,0.35)] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4">
          {/* header */}
          <div className="flex items-center gap-3 rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/80 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm font-semibold">Recording</span>
            </div>
            <span className="ml-3 rounded-full bg-[rgba(255,214,175,0.5)] px-3 py-1 text-sm font-semibold">
              Cognitive Check-in
            </span>
            <span className="ml-auto rounded-full bg-[rgba(190,167,229,0.35)] px-3 py-1 text-sm font-semibold">
              {timer}
            </span>
            <button
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-[rgba(107,75,62,0.15)] bg-white/90 px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-[#f4ece6]"
              onClick={() => setSpeakerOn((s) => !s)}
              title="Audio output"
            >
              {speakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {speakerOn ? "Speaker on" : "Muted"}
            </button>
          </div>

          {/* grid stage */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* big tile (either active speaker or shared) */}
            <Tile
              title={shareOn ? "Shared Screen — Care Plan Notes" : `${PEOPLE[activeIdx].name} (speaking)`}
              highlight
              className="md:col-span-2 md:row-span-2"
            >
              {shareOn ? (
                <SharedScreen />
              ) : (
                <VideoSurface
                  name={PEOPLE[activeIdx].name}
                  accent={PEOPLE[activeIdx].accent}
                  initials={getInitials(PEOPLE[activeIdx].name)}
                  active
                  camOn={activeIdx === 0 ? camOn : true}
                  muted={activeIdx === 0 ? muted : false}
                />
              )}
            </Tile>

            {/* the other 2 participants */}
            {PEOPLE.filter((_, i) => i !== activeIdx).map((p) => (
              <Tile key={p.id} title={p.name}>
                <VideoSurface
                  name={p.name}
                  accent={p.accent}
                  initials={getInitials(p.name)}
                  camOn={p.id === "you" ? camOn : true}
                  muted={p.id === "you" ? muted : false}
                  active={false}
                  compact
                />
              </Tile>
            ))}
          </div>

          {/* floating reactions */}
          <div className="pointer-events-none absolute inset-0 z-20">
            {reactions.map((r) => (
              <span
                key={r.id}
                className="absolute left-1/2 top-[62%] -translate-x-1/2 text-5xl animate-bounce"
              >
                {r.content}
              </span>
            ))}
          </div>

          {/* controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/85 px-3 py-3 shadow-sm">
            <CircleButton
              active={!muted}
              onClick={() => setMuted((m) => !m)}
              iconActive={<Mic className="h-5 w-5" />}
              iconInactive={<MicOff className="h-5 w-5" />}
              label={muted ? "Unmute" : "Mute"}
            />
            <CircleButton
              active={camOn}
              onClick={() => setCamOn((c) => !c)}
              iconActive={<VideoIcon className="h-5 w-5" />}
              iconInactive={<VideoOff className="h-5 w-5" />}
              label={camOn ? "Camera" : "Camera off"}
            />
            <CircleButton
              active={shareOn}
              onClick={() => setShareOn((s) => !s)}
              iconActive={<MonitorUp className="h-5 w-5" />}
              iconInactive={<MonitorUp className="h-5 w-5" />}
              label="Share"
            />
            <div className="mx-1 h-8 w-px bg-[rgba(107,75,62,0.2)]" />
            {/* More reactions */}
            <CircleButton
              active
              onClick={() => sendReaction("👍")}
              iconActive={<Smile className="h-5 w-5" />}
              label="Thumbs up"
            />
            <CircleButton
              active
              onClick={() => sendReaction("👋")}
              iconActive={<Hand className="h-5 w-5" />}
              label="Wave"
            />
            <CircleButton
              active
              onClick={() => sendReaction("❤️")}
              iconActive={<Heart className="h-5 w-5" />}
              label="Heart"
            />
            <CircleButton
              active
              onClick={() => sendReaction("🎉")}
              iconActive={<PartyPopper className="h-5 w-5" />}
              label="Celebrate"
            />
            <CircleButton
              active
              onClick={() => sendReaction("🙂")}
              iconActive={<Smile className="h-5 w-5" />}
              label="Smile"
            />
            <CircleButton
              active
              onClick={() =>
                sendReaction(
                  <Sparkles className="h-8 w-8 text-[#ffd6af] animate-spin drop-shadow-[0_3px_10px_rgba(0,0,0,.25)]" />
                )
              }
              iconActive={<Sparkles className="h-5 w-5" />}
              label="Clap"
            />
            <div className="mx-1 h-8 w-px bg-[rgba(107,75,62,0.2)]" />
            <PillButton onClick={() => setPeopleOpen((v) => !v)} icon={<UsersIcon className="h-5 w-5" />}>
              Participants
            </PillButton>
            <PillButton onClick={() => setChatOpen((v) => !v)} icon={<MessageSquare className="h-5 w-5" />}>
              Chat
            </PillButton>
            <button
              className={cx(
                BUTTON_BASE,
                "flex items-center gap-2 bg-[#e46a69] text-white hover:bg-[#cf5a59] focus-visible:outline-[#e46a69]"
              )}
              onClick={() => alert("Leave meeting (fake)")}
              title="Leave"
            >
              <PhoneOff className="h-5 w-5" />
              Leave
            </button>
            <div className="ml-auto hidden md:block">
              <button className="inline-flex items-center gap-2 rounded-full border border-[rgba(107,75,62,0.2)] bg-white px-4 py-2 text-sm font-semibold text-[#4b2f23] hover:bg-[#f4ece6]">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>

          {/* side panes */}
          <div className="grid gap-4 md:grid-cols-2">
            {peopleOpen && (
              <aside className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/85 p-4 shadow-sm">
                <p className="mb-2 text-sm font-semibold opacity-80">Participants (3)</p>
                <ul className="space-y-2">
                  {PEOPLE.map((p, i) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-[rgba(107,75,62,0.15)] bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-8 w-8 place-items-center rounded-full bg-[#0b0b0d] font-bold text-white"
                          style={{ boxShadow: `0 0 0 2px ${p.accent}` }}
                        >
                          {getInitials(p.name)}
                        </span>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs opacity-70">{p.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-70">
                        {i === activeIdx && (
                          <span className="rounded-full bg-[rgba(255,214,175,0.6)] px-2 py-0.5 text-xs font-semibold">
                            Speaking
                          </span>
                        )}
                        <Mic className="h-4 w-4" />
                        <VideoIcon className="h-4 w-4" />
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {chatOpen && (
              <aside className="flex h-[280px] flex-col rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/85 p-4 shadow-sm">
                <p className="mb-2 text-sm font-semibold opacity-80">Chat</p>
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {chat.map((c, idx) => (
                    <div key={idx} className="rounded-xl bg-white/90 px-3 py-2 shadow-sm">
                      <div className="text-xs font-semibold opacity-70">{c.from}</div>
                      <div className="text-sm">{c.text}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="mt-3 flex gap-2">
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Type a message…"
                    className="w-full rounded-full border border-[rgba(107,75,62,0.25)] bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                  />
                  <button
                    className={cx(
                      BUTTON_BASE,
                      "h-10 bg-[#6b4b3e] px-4 text-sm text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e]"
                    )}
                  >
                    Send
                  </button>
                </form>
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- video + tiles ---------- */

function Tile({ title, children, className, highlight }) {
  return (
    <section
      className={cx(
        "relative overflow-hidden rounded-3xl border border-[rgba(107,75,62,0.15)] bg-white/85 shadow-lg",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_-10%_-20%,rgba(255,214,175,0.18),transparent_60%)]" />
      {highlight && (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded-3xl ring-4 ring-[rgba(255,214,175,0.55)]" />
      )}
      <div className="relative p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold shadow-sm">
            {title}
          </div>
        </div>
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}

function VideoSurface({ name, initials, accent, active, camOn = true, muted = false, compact = false }) {
  const h = compact ? "h-[220px]" : "h-[420px] md:h-[520px]";
  const size = compact ? 100 : 168; // avatar circle diameter
  const fontSize = compact ? 46 : 80;

  return (
    <div
      className={cx(
        "relative w-full overflow-hidden rounded-2xl border border-[rgba(107,75,62,0.18)] bg-[#0b0b0d]",
        h
      )}
      aria-label={`${name} video`}
    >
      {/* subtle CRT-ish texture */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 3px)",
        }}
      />
      {/* vignette + glow */}
      <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-10%,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* center avatar circle with initials (Meet-style) */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          className={cx("relative grid place-items-center rounded-full bg-[#141416] text-white", active && "animate-pulse")}
          style={{
            width: size,
            height: size,
            border: `4px solid ${accent}`,
            boxShadow: active
              ? `0 0 0 10px ${accent}33, 0 10px 30px rgba(0,0,0,.45)`
              : `0 0 0 6px ${accent}22, 0 10px 30px rgba(0,0,0,.45)`,
          }}
        >
          <span
            className="select-none font-black tracking-wider"
            style={{ fontSize, textShadow: "0 8px 24px rgba(0,0,0,.6)" }}
          >
            {initials}
          </span>
        </div>
      </div>

      {/* HUD: name + mic/cam */}
      <div className="absolute left-3 bottom-3 flex items-center gap-2">
        <span
          className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold"
          style={{ boxShadow: `0 0 0 2px ${accent}55` }}
        >
          {name}
        </span>
        <span className="rounded-full bg-white/80 px-1.5 py-1 text-[10px] shadow-sm">
          {muted ? <MicOff className="h-3.5 w-3.5 text-red-600" /> : <Mic className="h-3.5 w-3.5" />}
        </span>
        <span className="rounded-full bg-white/80 px-1.5 py-1 text-[10px] shadow-sm">
          {camOn ? <VideoIcon className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5 text-red-600" />}
        </span>
      </div>
    </div>
  );
}

function SharedScreen() {
  return (
    <div className="relative h-[420px] w-full rounded-2xl border border-[rgba(107,75,62,0.2)] bg-[#0b0b0d] md:h-[520px]">
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] bg-[#141416] px-3 py-2 text-white/80">
        <div className="flex gap-1">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="ml-3 text-sm">care-plan-notes.md</div>
      </div>
      {/* fake content */}
      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-3 space-y-2">
          {["Agenda", "Care Plan", "Exercises", "Follow-ups"].map((s, i) => (
            <div
              key={s}
              className={cx(
                "rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2 text-sm text-white/85",
                i === 1 ? "bg-[rgba(190,167,229,0.18)]" : "bg-[rgba(255,255,255,0.04)]"
              )}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="col-span-9">
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4 text-white/90">
            <div className="mb-2 text-lg font-semibold">Care Plan — Week 3</div>
            <ul className="ml-5 list-disc space-y-1 text-sm">
              <li>5-minute memory exercise daily</li>
              <li>Evening relaxation — light music</li>
              <li>Short walk after lunch</li>
              <li>Check-in call on Friday</li>
            </ul>
          </div>
        </div>
      </div>
      {/* gentle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_500px_at_50%_120%,rgba(0,0,0,0.35),transparent)]" />
    </div>
  );
}

/* ---------- controls ---------- */

function CircleButton({ active, onClick, iconActive, iconInactive, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        className={cx(
          "grid h-12 w-12 place-items-center rounded-full border border-[rgba(107,75,62,0.2)] text-[#4b2f23] shadow-sm",
          active ? "bg-white hover:bg-[#f4ece6]" : "bg-[rgba(107,75,62,0.08)] hover:bg-[rgba(107,75,62,0.14)]"
        )}
        title={label}
      >
        {active ? iconActive : iconInactive || iconActive}
      </button>
      <div className="text-[11px] font-medium opacity-70">{label}</div>
    </div>
  );
}

function PillButton({ onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        BUTTON_BASE,
        "flex items-center gap-2 border border-[rgba(107,75,62,0.2)] bg-white text-[#4b2f23] hover:bg-[#f4ece6]"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
