"use client";

import { useMemo, useState } from "react";
import { HCPNav } from "@/components/hcp-nav";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  MapPin,
  Clock,
  Phone,
  Trash2,
  Pencil,
  UserRound,
} from "lucide-react";

/* -------- theme -------- */
const PALETTE = {
  dark: "#6b4b3e",
  tan: "#c49e85",
  lightBrown: "#ffd6af",
  background: "#f8f4f9",
  lavender: "#BEA7E5",
};

/* -------- utilities -------- */
const pad = (n) => String(n).padStart(2, "0");
const keyFromDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function monthMatrix(year, month /* 0-indexed */) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay()); // Sunday grid start
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d,
      current: d.getMonth() === month,
      isToday:
        d.toDateString() === new Date().toDateString(),
    });
  }
  return days;
}

/* -------- initial mock events -------- */
const seed = [
  {
    id: "e1",
    title: "CDR Check-in",
    patient: "Jane Doe",
    type: "Video",
    date: keyFromDate(new Date()),
    start: "08:30",
    end: "09:00",
    color: "#BEA7E5",
  },
  {
    id: "e2",
    title: "Care Plan Review",
    patient: "Michael Chen",
    type: "Clinic",
    date: keyFromDate(new Date(new Date().setDate(new Date().getDate() + 1))),
    start: "14:00",
    end: "14:45",
    color: "#A7D8F7",
  },
  {
    id: "e3",
    title: "Family Call",
    patient: "Emma Davis",
    type: "Phone",
    date: keyFromDate(new Date(new Date().setDate(new Date().getDate() + 2))),
    start: "11:15",
    end: "11:45",
    color: "#ffd6af",
  },
];

/* -------- page -------- */
export default function DoctorCalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState(seed);
  const [selectedKey, setSelectedKey] = useState(keyFromDate(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const grid = useMemo(() => monthMatrix(y, m), [y, m]);

  const byDay = useMemo(() => {
    const map = {};
    for (const e of events) {
      (map[e.date] ??= []).push(e);
    }
    for (const k in map) {
      map[k].sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [events]);

  const selectedEvents = byDay[selectedKey] ?? [];

  function prevMonth() {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() - 1);
    setCursor(d);
  }
  function nextMonth() {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + 1);
    setCursor(d);
  }

  function openNew(dateKey) {
    setEditing({
      id: `e_${Math.random().toString(36).slice(2)}`,
      title: "",
      patient: "",
      type: "Video",
      date: dateKey,
      start: "09:00",
      end: "09:30",
      color: "#BEA7E5",
    });
    setShowModal(true);
  }

  function openEdit(ev) {
    setEditing({ ...ev });
    setShowModal(true);
  }

  function saveEvent() {
    setEvents((prev) => {
      const idx = prev.findIndex((x) => x.id === editing.id);
      if (idx === -1) return [...prev, editing];
      const copy = [...prev];
      copy[idx] = editing;
      return copy;
    });
    setSelectedKey(editing.date);
    setShowModal(false);
  }

  function deleteEvent(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const weekAhead = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    return [...events]
      .filter((e) => {
        const [Y, M, D] = e.date.split("-").map(Number);
        const d = new Date(Y, M - 1, D);
        return d >= new Date(now.setHours(0, 0, 0, 0)) && d <= end;
      })
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  }, [events]);

  return (
    <div className="min-h-screen bg-[#f8f4f9]">
      <HCPNav />

      <main className="relative py-8 px-4 md:px-8 text-[#4b2f23]">
        {/* soft blobs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[rgba(190,167,229,0.3)] blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[rgba(255,214,175,0.3)] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {/* Left: calendar */}
          <section className="md:col-span-2 space-y-4">
            {/* header */}
            <div className="flex items-center gap-3 rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/85 px-4 py-3 shadow-sm">
              <button
                onClick={prevMonth}
                className="rounded-full border border-[rgba(107,75,62,0.2)] bg-white p-2 hover:bg-[#f4ece6]"
                title="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-lg font-semibold">
                {cursor.toLocaleString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                onClick={nextMonth}
                className="rounded-full border border-[rgba(107,75,62,0.2)] bg-white p-2 hover:bg-[#f4ece6]"
                title="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(107,75,62,0.2)] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f4ece6]"
                  onClick={() => openNew(keyFromDate(new Date()))}
                >
                  <Plus className="h-4 w-4" />
                  Add event
                </button>
              </div>
            </div>

            {/* weekday labels */}
            <div className="grid grid-cols-7 gap-2 px-1 text-xs font-semibold uppercase tracking-wide opacity-70">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center">
                  {d}
                </div>
              ))}
            </div>

            {/* month grid */}
            <div className="grid grid-cols-7 gap-2">
              {grid.map((cell, i) => {
                const k = keyFromDate(cell.date);
                const items = byDay[k] ?? [];
                const selected = k === selectedKey;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedKey(k)}
                    className={`group relative min-h-[108px] rounded-2xl border p-2 text-left shadow-sm transition-colors ${
                      cell.current
                        ? "bg-white/90 border-[rgba(107,75,62,0.15)]"
                        : "bg-white/70 border-[rgba(107,75,62,0.08)] opacity-70"
                    } ${selected ? "ring-2 ring-[rgba(190,167,229,0.5)]" : ""}`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                          cell.isToday
                            ? "bg-[#BEA7E5] text-white"
                            : "text-[#4b2f23]"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>
                      <span
                        className="hidden rounded-full bg-[rgba(107,75,62,0.08)] px-2 py-0.5 text-[10px] font-semibold opacity-0 transition group-hover:opacity-100 md:inline-block"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNew(k);
                        }}
                      >
                        + Add
                      </span>
                    </div>

                    {/* events preview (max 3) */}
                    <div className="space-y-1">
                      {items.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className="truncate rounded-md px-2 py-1 text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${ev.color}22`,
                            border: `1px solid ${ev.color}66`,
                          }}
                          title={`${ev.start} ${ev.title} — ${ev.patient}`}
                        >
                          <span className="opacity-70">{ev.start}</span> • {ev.title}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="text-[11px] font-semibold opacity-70">
                          + {items.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Right: day details / upcoming */}
          <aside className="space-y-4">
            {/* selected day details */}
            <div className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/85 p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold">
                  {new Date(selectedKey).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(107,75,62,0.2)] bg-white px-3 py-1.5 text-sm font-semibold hover:bg-[#f4ece6]"
                  onClick={() => openNew(selectedKey)}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {selectedEvents.length === 0 ? (
                <p className="text-sm opacity-70">No events for this day.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedEvents.map((ev) => (
                    <li
                      key={ev.id}
                      className="rounded-xl border border-[rgba(107,75,62,0.12)] bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-semibold">{ev.title}</div>
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-md p-1 hover:bg-[#f4ece6]"
                            onClick={() => openEdit(ev)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-md p-1 hover:bg-[#f4ece6]"
                            onClick={() => deleteEvent(ev.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 opacity-70" />
                          {ev.start}–{ev.end}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <UserRound className="h-4 w-4 opacity-70" />
                          {ev.patient}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          {ev.type === "Video" ? (
                            <Video className="h-4 w-4 opacity-70" />
                          ) : ev.type === "Phone" ? (
                            <Phone className="h-4 w-4 opacity-70" />
                          ) : (
                            <MapPin className="h-4 w-4 opacity-70" />
                          )}
                          {ev.type}
                        </span>
                        <span
                          className="inline-flex items-center justify-start gap-2"
                          title="Category color"
                        >
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: ev.color }}
                          />
                          <span className="opacity-70">Label</span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* upcoming week */}
            <div className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/85 p-4 shadow-sm">
              <div className="mb-2 font-semibold">Next 7 days</div>
              {weekAhead.length === 0 ? (
                <p className="text-sm opacity-70">Nothing scheduled.</p>
              ) : (
                <ul className="space-y-2">
                  {weekAhead.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-center justify-between rounded-xl border border-[rgba(107,75,62,0.12)] bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: ev.color }}
                        />
                        <div>
                          <div className="font-semibold">{ev.title}</div>
                          <div className="text-[12px] opacity-70">
                            {new Date(ev.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            • {ev.start} – {ev.end}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-70">
                        <UserRound className="h-4 w-4" />
                        {ev.patient}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>

        {/* modal */}
        {showModal && editing && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white p-5 shadow-xl">
              <div className="mb-3 text-lg font-semibold">Save Event</div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="mb-1 block opacity-70">Title</span>
                  <input
                    value={editing.title}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, title: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[rgba(107,75,62,0.25)] bg-white px-3 py-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b4b3e]"
                    placeholder="Visit title"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block opacity-70">Patient</span>
                  <input
                    value={editing.patient}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, patient: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[rgba(107,75,62,0.25)] bg-white px-3 py-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b4b3e]"
                    placeholder="Patient name"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block opacity-70">Date</span>
                  <input
                    type="date"
                    value={editing.date}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, date: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[rgba(107,75,62,0.25)] bg-white px-3 py-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b4b3e]"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block opacity-70">Type</span>
                  <select
                    value={editing.type}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, type: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[rgba(107,75,62,0.25)] bg-white px-3 py-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b4b3e]"
                  >
                    <option>Video</option>
                    <option>Clinic</option>
                    <option>Phone</option>
                  </select>
                </label>

                <label className="text-sm">
                  <span className="mb-1 block opacity-70">Start</span>
                  <input
                    type="time"
                    value={editing.start}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, start: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[rgba(107,75,62,0.25)] bg-white px-3 py-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b4b3e]"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block opacity-70">End</span>
                  <input
                    type="time"
                    value={editing.end}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, end: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[rgba(107,75,62,0.25)] bg-white px-3 py-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b4b3e]"
                  />
                </label>

                <label className="col-span-2 text-sm">
                  <span className="mb-1 block opacity-70">Label color</span>
                  <input
                    type="color"
                    value={editing.color}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, color: e.target.value }))
                    }
                    className="h-10 w-20 cursor-pointer rounded-md border border-[rgba(107,75,62,0.25)] bg-white"
                  />
                </label>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-[rgba(107,75,62,0.2)] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f4ece6]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  disabled={!editing.title || !editing.patient}
                  className="rounded-full bg-[#6b4b3e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a3f34] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
