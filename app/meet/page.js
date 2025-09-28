// app/games/meet/page.js
"use client";
import { useEffect, useMemo, useState } from "react";

const PALETTE = {
  dark: "#6b4b3e",
  tan: "#c49e85",
  lightBrown: "#ffd6af",
  background: "#f8f4f9",
  lavender: "#BEA7E5",
};

const BUTTON_BASE =
  "rounded-full px-5 h-11 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/** Normalize any code/link into a valid Meet URL */
function toMeetUrl(input) {
  if (!input) return null;
  let s = String(input).trim();
  if (/^https?:\/\//i.test(s)) return s;
  s = s.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (s.length >= 10) {
    const a = s.slice(0, 3), b = s.slice(3, 7), c = s.slice(7, 10);
    return `https://meet.google.com/${a}-${b}-${c}`;
  }
  return `https://meet.google.com/${s}`;
}

function fmt(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function MeetPage() {
  const [mode, setMode] = useState("create"); // "create" | "join"
  // Create state
  const [summary, setSummary] = useState("Tea time ☕");
  const [mins, setMins] = useState(30);
  const [attendee, setAttendee] = useState("");
  const [creating, setCreating] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [error, setError] = useState("");

  // Join state
  const [joinInput, setJoinInput] = useState("");
  const joinUrl = useMemo(() => toMeetUrl(joinInput), [joinInput]);

  // Listed meetings
  const [days, setDays] = useState(7);
  const [meetings, setMeetings] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (mode !== "join") return;
    loadMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, days]);

  async function loadMeetings() {
    setLoadingList(true);
    setMeetings([]);
    try {
      const res = await fetch(`/api/google/list-meets?days=${days}&max=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to list meetings");
      setMeetings(data.events || []);
    } catch (e) {
      console.error(e);
      setMeetings([]);
    } finally {
      setLoadingList(false);
    }
  }

  async function createMeet() {
    setError("");
    setMeetLink("");
    setCreating(true);
    const startISO = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const res = await fetch("/api/google/create-meet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary,
        startISO,
        durationMins: Number(mins),
        attendees: attendee ? [attendee.trim()] : [],
      }),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok || !data?.meetLink) {
      setError(data?.error || "Could not create the meeting.");
      return;
    }

    setMeetLink(data.meetLink);
    window.open(data.meetLink, "_blank", "noopener,noreferrer"); // auto-open
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); alert("Link copied!"); }
    catch { prompt("Copy this link:", text); }
  }

  function joinMeeting() {
    if (!joinUrl) return;
    window.open(joinUrl, "_blank", "noopener,noreferrer");
  }

  const filteredMeetings = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return meetings;
    return meetings.filter(m =>
      m.summary?.toLowerCase().includes(q) ||
      (m.attendees || []).some(a => a.toLowerCase().includes(q))
    );
  }, [meetings, filterText]);

  return (
    <main
      className="relative min-h-screen py-10 px-4"
      style={{ backgroundColor: PALETTE.background, color: PALETTE.dark }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[rgba(190,167,229,0.2)] blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[rgba(255,214,175,0.3)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-8 text-[#4b2f23]">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-[#4b2f23]">Google Meet Workspace</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#6b4b3e] opacity-80">
            Launch secure meetings for patients or colleagues, or jump into an existing session.
            Use the toggles below to switch between creating a new link and joining an upcoming
            meeting.
          </p>
        </header>

        <div className="flex w-full flex-wrap gap-2">
          <button
            onClick={() => setMode("create")}
            className={`${BUTTON_BASE} ${mode === "create"
              ? "bg-[#6b4b3e] text-white shadow-md focus-visible:outline-[#6b4b3e]"
              : "bg-white/85 text-[#6b4b3e] border border-[rgba(107,75,62,0.2)] hover:bg-[#f3ebe4] focus-visible:outline-[#6b4b3e]"}`}
            type="button"
          >
            Create a meeting
          </button>
          <button
            onClick={() => setMode("join")}
            className={`${BUTTON_BASE} ${mode === "join"
              ? "bg-[#6b4b3e] text-white shadow-md focus-visible:outline-[#6b4b3e]"
              : "bg-white/85 text-[#6b4b3e] border border-[rgba(107,75,62,0.2)] hover:bg-[#f3ebe4] focus-visible:outline-[#6b4b3e]"}`}
            type="button"
          >
            Join a meeting
          </button>
        </div>

        {mode === "create" ? (
          <section className="space-y-6 rounded-3xl border border-[rgba(107,75,62,0.15)] bg-white/90 p-6 shadow-xl">
            <div className="grid gap-4">
              <label className="grid gap-1 text-sm font-medium">
                Session title
                <input
                  className="rounded-xl border border-[rgba(107,75,62,0.2)] bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </label>

              <div className="flex flex-wrap gap-4">
                <label className="grid gap-1 text-sm font-medium">
                  Duration (minutes)
                  <input
                    type="number"
                    min={5}
                    className="w-40 rounded-xl border border-[rgba(107,75,62,0.2)] bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                    value={mins}
                    onChange={(e) => setMins(e.target.value)}
                  />
                </label>

                <label className="flex-1 min-w-[240px] grid gap-1 text-sm font-medium">
                  Invite participant (email)
                  <input
                    type="email"
                    placeholder="colleague@example.com"
                    className="rounded-xl border border-[rgba(107,75,62,0.2)] bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                    value={attendee}
                    onChange={(e) => setAttendee(e.target.value)}
                  />
                  <span className="text-xs text-[#6b4b3e] opacity-60">Optional: send an email invitation automatically.</span>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={createMeet}
                disabled={creating}
                className={`${BUTTON_BASE} bg-[#BEA7E5] text-[#4b2f23] hover:bg-[#b497dd] focus-visible:outline-[#BEA7E5] disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {creating ? "Creating…" : "Generate meeting link"}
              </button>
              <span className="text-sm text-[#6b4b3e] opacity-70">
                Links open in a new tab immediately after creation.
              </span>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{String(error)}</div>}

            {meetLink && (
              <div className="space-y-3 rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/80 px-5 py-4 shadow-inner">
                <div className="text-sm font-semibold text-[#4b2f23]">Your meeting link</div>
                <div className="rounded-xl bg-[#f4ece6] px-4 py-3 font-mono text-sm text-[#4b2f23] break-all">
                  {meetLink}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e]`}
                    href={meetLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open meeting
                  </a>
                  <button
                    onClick={() => copy(meetLink)}
                    className={`${BUTTON_BASE} bg-white text-[#6b4b3e] border border-[rgba(107,75,62,0.25)] hover:bg-[#f3ebe4] focus-visible:outline-[#6b4b3e]`}
                  >
                    Copy link
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-6 rounded-3xl border border-[rgba(107,75,62,0.15)] bg-white/90 p-6 shadow-xl">
            <div className="space-y-3">
              <label className="grid gap-2 text-sm font-medium">
                Enter a meeting code or link
                <input
                  className="rounded-xl border border-[rgba(107,75,62,0.2)] bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                  placeholder="abc-defg-hij or https://meet.google.com/abc-defg-hij"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                />
              </label>
              <button
                onClick={joinMeeting}
                disabled={!joinInput}
                className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e] disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Join now
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="text-sm font-semibold text-[#4b2f23]">Upcoming meetings</div>
                <select
                  className="rounded-full border border-[rgba(107,75,62,0.25)] bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  title="Look ahead"
                >
                  <option value={1}>Today</option>
                  <option value={3}>Next 3 days</option>
                  <option value={7}>Next 7 days</option>
                  <option value={14}>Next 14 days</option>
                </select>
                <button
                  onClick={loadMeetings}
                  className={`${BUTTON_BASE} bg-white text-[#6b4b3e] border border-[rgba(107,75,62,0.25)] hover:bg-[#f3ebe4] focus-visible:outline-[#6b4b3e]`}
                >
                  Refresh
                </button>
                <input
                  className="min-w-[220px] flex-1 rounded-full border border-[rgba(107,75,62,0.2)] bg-white/90 px-4 py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                  placeholder="Filter by topic or attendee"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {loadingList && <div className="text-sm text-[#6b4b3e] opacity-70">Loading upcoming meetings…</div>}
                {!loadingList && filteredMeetings.length === 0 && (
                  <div className="rounded-xl border border-[rgba(107,75,62,0.1)] bg-white/70 px-4 py-6 text-sm text-[#6b4b3e] opacity-70">
                    No upcoming meetings found for the selected window.
                  </div>
                )}

                {filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(107,75,62,0.12)] bg-white px-4 py-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[#4b2f23]">{m.summary}</div>
                      <div className="text-xs text-[#6b4b3e] opacity-70">
                        {fmt(m.start)} — {fmt(m.end)}
                      </div>
                      {m.attendees?.length > 0 && (
                        <div className="text-xs text-[#6b4b3e] opacity-70">
                          With {m.attendees.slice(0, 3).join(", ")}{m.attendees.length > 3 ? "…" : ""}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={m.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e]`}
                      >
                        Join
                      </a>
                      <button
                        onClick={() => copy(m.meetLink)}
                        className={`${BUTTON_BASE} bg-white text-[#6b4b3e] border border-[rgba(107,75,62,0.25)] hover:bg-[#f3ebe4] focus-visible:outline-[#6b4b3e]`}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/70 px-4 py-3 text-xs text-[#6b4b3e] opacity-80">
              Note: Some meetings may still require host approval or a Google account depending on
              organizer settings.
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
