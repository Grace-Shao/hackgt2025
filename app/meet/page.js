// app/games/meet/page.js
"use client";
import { useEffect, useMemo, useState } from "react";

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
    <main className="p-6 max-w-3xl mx-auto space-y-5">
      <h1 className="text-3xl font-extrabold">Google Meet</h1>
      <p className="text-sm opacity-70">
        Choose <b>Create</b> to make a new meeting, or <b>Join</b> to enter an existing one.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("create")}
          className={`rounded-full border px-4 h-10 ${mode==="create" ? "bg-black text-white" : ""}`}
        >
          Create a meeting
        </button>
        <button
          onClick={() => setMode("join")}
          className={`rounded-full border px-4 h-10 ${mode==="join" ? "bg-black text-white" : ""}`}
        >
          Join a meeting
        </button>
      </div>

      {mode === "create" ? (
        <section className="rounded-xl border p-4 space-y-4 bg-white">
          <label className="block">
            <div className="text-lg mb-1">Title</div>
            <input
              className="border rounded-lg px-3 py-2 w-full text-lg"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </label>

          <div className="flex gap-4 items-end flex-wrap">
            <label className="block">
              <div className="text-lg mb-1">Duration (minutes)</div>
              <input
                type="number"
                min={5}
                className="border rounded-lg px-3 py-2 w-40 text-lg"
                value={mins}
                onChange={(e) => setMins(e.target.value)}
              />
            </label>

            <label className="block flex-1 min-w-[240px]">
              <div className="text-lg mb-1">
                Invite (email) <span className="opacity-60 text-sm">(optional)</span>
              </div>
              <input
                type="email"
                placeholder="friend@example.com"
                className="border rounded-lg px-3 py-2 w-full text-lg"
                value={attendee}
                onChange={(e) => setAttendee(e.target.value)}
              />
            </label>
          </div>

          <button
            onClick={createMeet}
            disabled={creating}
            className="rounded-full border px-6 h-12 text-lg font-semibold"
          >
            {creating ? "Creating…" : "Create Meet"}
          </button>

          {error && <div className="text-red-600 text-sm">{String(error)}</div>}

          {meetLink && (
            <div className="p-3 border rounded-lg bg-[#fafafa] space-y-2">
              <div className="text-lg">Your meeting link:</div>
              <div className="font-mono break-all">{meetLink}</div>
              <div className="flex gap-2">
                <a
                  className="rounded-full border px-4 h-10 flex items-center"
                  href={meetLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open again
                </a>
                <button onClick={() => copy(meetLink)} className="rounded-full border px-4 h-10">
                  Copy link
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-xl border p-4 space-y-6 bg-white">
          {/* Join by code/link */}
          <div className="space-y-3">
            <label className="block">
              <div className="text-lg mb-1">Enter a meeting code or link</div>
              <input
                className="border rounded-lg px-3 py-2 w-full text-lg"
                placeholder="abc-defg-hij or https://meet.google.com/abc-defg-hij"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
              />
            </label>
            <button
              onClick={joinMeeting}
              disabled={!joinInput}
              className="rounded-full border px-6 h-12 text-lg font-semibold"
            >
              Join now
            </button>
          </div>

          {/* Or pick from upcoming list */}
          <div className="space-y-3">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="text-lg font-semibold">Upcoming meetings</div>
              <select
                className="border rounded px-3 py-2"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                title="Look ahead"
              >
                <option value={1}>Today</option>
                <option value={3}>Next 3 days</option>
                <option value={7}>Next 7 days</option>
                <option value={14}>Next 14 days</option>
              </select>
              <button onClick={loadMeetings} className="border rounded px-3 h-10">Refresh</button>
              <input
                className="border rounded px-3 py-2 flex-1 min-w-[220px]"
                placeholder="Filter by topic or attendee"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {loadingList && <div className="opacity-70">Loading…</div>}
              {!loadingList && filteredMeetings.length === 0 && (
                <div className="opacity-70">No upcoming meetings found.</div>
              )}

              {filteredMeetings.map(m => (
                <div key={m.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-lg">{m.summary}</div>
                    <div className="text-sm opacity-70">{fmt(m.start)} — {fmt(m.end)}</div>
                    {m.attendees?.length > 0 && (
                      <div className="text-sm opacity-70">
                        With: {m.attendees.slice(0, 3).join(", ")}{m.attendees.length > 3 ? "…" : ""}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={m.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border px-4 h-10 flex items-center"
                    >
                      Join
                    </a>
                    <button onClick={() => copy(m.meetLink)} className="rounded-full border px-4 h-10">
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm opacity-70">
            Note: Some meetings may still ask the host to admit you or require a Google account,
            depending on the host’s settings.
          </div>
        </section>
      )}
    </main>
  );
}
