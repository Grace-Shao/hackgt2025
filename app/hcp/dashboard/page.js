"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

/**
 * Healthcare Professional Side Dashboard
 * Route suggestion: app/hcp/dashboard/page.js
 * - Big client name at top
 * - Metrics box with tabs for conditions (fake data)
 * - Patient notes box (dates list on left, note content on right)
 * - Right sidebar with an "AI Assistant" placeholder box
 *
 * Styling: Tailwind (clean, modern). Charts: Recharts.
 */

const PALETTE = {
  darkBrown: "#6b4b3e",
  tan: "#c49e85",
  lightBrown: "#ffd6af",
  background: "#f8f4f9",
};

// ---- Fake domain data -------------------------------------------------------
const CONDITIONS = [
  "Alzheimer's",
  "Dementia",
  "Parkinson's",
  "MCI",
  "Depression",
  "Anxiety",
  "PTSD",
  "Bipolar",
];

const METRIC_DEFS = {
  "Alzheimer's": {
    primary: { key: "MMSE", label: "MMSE Score" },
    secondary: { key: "ADAS", label: "ADAS-Cog" },
    radar: ["Memory", "Language", "Attention", "Orientation", "Visuospatial"],
  },
  Dementia: {
    primary: { key: "CDR", label: "CDR Sum of Boxes" },
    secondary: { key: "FAQ", label: "Functional Activities (FAQ)" },
    radar: ["Memory", "Executive", "Language", "Visuospatial", "Behavior"],
  },
  "Parkinson's": {
    primary: { key: "UPDRS", label: "UPDRS Motor" },
    secondary: { key: "TUG", label: "Timed Up & Go (s)" },
    radar: ["Tremor", "Rigidity", "Bradykinesia", "Gait", "Speech"],
  },
  MCI: {
    primary: { key: "MoCA", label: "MoCA" },
    secondary: { key: "HVLT", label: "HVLT Total" },
    radar: ["Memory", "Attention", "Language", "Abstraction", "Orientation"],
  },
  Depression: {
    primary: { key: "PHQ9", label: "PHQ-9" },
    secondary: { key: "HAMD", label: "HAM-D" },
    radar: ["Mood", "Sleep", "Energy", "Concentration", "Anhedonia"],
  },
  Anxiety: {
    primary: { key: "GAD7", label: "GAD-7" },
    secondary: { key: "BAI", label: "BAI" },
    radar: ["Worry", "Restlessness", "Somatic", "Irritability", "Tension"],
  },
  PTSD: {
    primary: { key: "PCL5", label: "PCL-5" },
    secondary: { key: "CAPS", label: "CAPS-5" },
    radar: ["Intrusion", "Avoidance", "Negative Mood", "Arousal", "Dissociation"],
  },
  Bipolar: {
    primary: { key: "YMRS", label: "YMRS" },
    secondary: { key: "MADRS", label: "MADRS" },
    radar: ["Mood", "Activity", "Sleep", "Thought", "Insight"],
  },
};

function seededRand(seed) {
  // deterministic random for fake data generation
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function genTrend(condition, weeks = 12) {
  const def = METRIC_DEFS[condition];
  const arr = [];
  for (let i = 0; i < weeks; i++) {
    const s = i + condition.length;
    const v1 = Math.round(50 + seededRand(s) * 30 + (i - weeks / 2));
    const v2 = Math.round(20 + seededRand(s + 9) * 10 + (i % 3));
    arr.push({
      week: `W${i + 1}`,
      [def.primary.key]: Math.max(0, v1),
      [def.secondary.key]: Math.max(0, v2),
    });
  }
  return arr;
}

function genRadar(condition) {
  const def = METRIC_DEFS[condition];
  return def.radar.map((axis, i) => ({
    axis,
    score: Math.round(40 + seededRand(i + condition.length) * 60),
  }));
}

const NOTES = [
  {
    date: "2025-09-25",
    title: "Follow-up visit",
    tags: ["Memory", "Medication"],
    body:
      "Patient reports mild forgetfulness in daily tasks. Started donepezil 5mg nightly last week; tolerating well with minimal GI upset. Sleep improved with consistent routine. Caregiver notes fewer repeated questions.",
  },
  {
    date: "2025-09-10",
    title: "Caregiver phone check-in",
    tags: ["Caregiver", "Behavior"],
    body:
      "Caregiver reports increased agitation in evening hours. Introduced calming routine at 7pm and limited caffeine. Plan to reassess in two weeks; consider melatonin if persists.",
  },
  {
    date: "2025-08-28",
    title: "Initial evaluation",
    tags: ["Assessment", "Plan"],
    body:
      "Baseline cognitive screen completed. MMSE 24/30, MoCA 22/30. Labs ordered (TSH, B12). Education provided regarding safety at home and medication management options.",
  },
];

// ---- Components -------------------------------------------------------------
function MetricStat({ label, value, unit }) {
  return (
    <div className="rounded-xl border border-[#6b4b3e] bg-white p-4 text-[#6b4b3e]">
      <div className="text-sm opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-bold">
        {value}
        <span className="ml-1 text-base font-medium opacity-60 text-[#6b4b3e]">
          {unit}
        </span>
      </div>
    </div>
  );
}

function MetricsPanel({ condition }) {
  const def = METRIC_DEFS[condition];
  const trend = useMemo(() => genTrend(condition), [condition]);
  const radar = useMemo(() => genRadar(condition), [condition]);

  const latest = trend[trend.length - 1] ?? {};
  const primaryVal = latest[def.primary.key] ?? 0;
  const secondaryVal = latest[def.secondary.key] ?? 0;

  return (
    <div className="space-y-4 text-[#6b4b3e]">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricStat label={`Current ${def.primary.label}`} value={primaryVal} />
        <MetricStat label={`Current ${def.secondary.label}`} value={secondaryVal} />
        <MetricStat label="Trend Weeks" value={trend.length} />
        <MetricStat label="Adherence" value={`${60 + (primaryVal % 40)}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#6b4b3e] bg-white p-3">
          <div className="mb-2 text-sm font-semibold">{def.primary.label} — 12‑week trend</div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.tan} />
                <XAxis dataKey="week" tick={{ fill: PALETTE.darkBrown }} stroke={PALETTE.darkBrown} />
                <YAxis tick={{ fill: PALETTE.darkBrown }} stroke={PALETTE.darkBrown} />
                <Tooltip contentStyle={{ borderColor: PALETTE.darkBrown, color: PALETTE.darkBrown }} />
                <Line
                  type="monotone"
                  dataKey={def.primary.key}
                  strokeWidth={2}
                  dot={false}
                  stroke={PALETTE.darkBrown}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#6b4b3e] bg-white p-3">
          <div className="mb-2 text-sm font-semibold">{def.secondary.label} — recent distribution</div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.tan} />
                <XAxis dataKey="week" tick={{ fill: PALETTE.darkBrown }} stroke={PALETTE.darkBrown} />
                <YAxis tick={{ fill: PALETTE.darkBrown }} stroke={PALETTE.darkBrown} />
                <Tooltip contentStyle={{ borderColor: PALETTE.darkBrown, color: PALETTE.darkBrown }} />
                <Bar dataKey={def.secondary.key} fill={PALETTE.tan} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#6b4b3e] bg-white p-3 lg:col-span-2">
          <div className="mb-2 text-sm font-semibold">Domain profile</div>
          <div className="h-60">
            <ResponsiveContainer>
              <RadarChart data={radar} outerRadius="70%">
                <PolarGrid stroke={PALETTE.tan} />
                <PolarAngleAxis dataKey="axis" tick={{ fill: PALETTE.darkBrown }} stroke={PALETTE.darkBrown} />
                <PolarRadiusAxis stroke={PALETTE.darkBrown} tick={{ fill: PALETTE.darkBrown }} />
                <Radar name="Score" dataKey="score" fill={PALETTE.tan} fillOpacity={0.3} stroke={PALETTE.darkBrown} />
                <Tooltip contentStyle={{ borderColor: PALETTE.darkBrown, color: PALETTE.darkBrown }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientNotes() {
  const [active, setActive] = useState(0);
  const note = NOTES[active];

  return (
    <div className="overflow-hidden rounded-xl border border-[#6b4b3e] bg-white text-[#6b4b3e]">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Date list */}
        <div className="border-r border-[#6b4b3e] bg-[#f8f4f9] p-3 md:max-h-[380px] md:overflow-auto">
          <ul className="space-y-2">
            {NOTES.map((n, i) => (
              <li key={n.date}>
                <button
                  onClick={() => setActive(i)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    active === i
                      ? "border-[#6b4b3e] bg-[#6b4b3e] text-white"
                      : "border-[#6b4b3e] bg-white text-[#6b4b3e] hover:bg-[#c49e85] hover:text-white"
                  }`}
                >
                  <div className="text-sm font-semibold">
                    {new Date(n.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs opacity-80 truncate">{n.title}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Note body */}
        <div className="p-4 md:col-span-2">
          <div className="text-sm opacity-80">{new Date(note.date).toLocaleString()}</div>
          <h4 className="mt-1 text-xl font-bold">{note.title}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {note.tags.map((t) => (
              <span
                key={t}
                className="inline-block rounded-full border border-[#6b4b3e] bg-white px-2 py-1 text-xs text-[#6b4b3e]"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed">{note.body}</p>
        </div>
      </div>
    </div>
  );
}

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
            t === value
              ? "border-[#6b4b3e] bg-[#6b4b3e] text-white"
              : "border-[#6b4b3e] bg-white text-[#6b4b3e] hover:bg-[#c49e85] hover:text-white"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function HCPDashboard() {
  const [clientName] = useState("Jane Doe");
  const [condition, setCondition] = useState(CONDITIONS[0]);

  return (
    <main className="min-h-screen bg-[#f8f4f9] p-6 text-[#6b4b3e] md:p-10">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#6b4b3e]">Client: {clientName}</h1>
        <div className="mt-1 text-sm opacity-80">
          MRN ••••1234 · DOB 1959‑02‑17 · Last visit 2025‑09‑25
        </div>
      </header>

      {/* Layout: main + sidebar */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* Main column (spans 2) */}
        <section className="space-y-6 xl:col-span-2">
          {/* Metrics box with tabs */}
          <div className="rounded-2xl border border-[#6b4b3e] bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Condition Dashboard</h2>
              <Tabs tabs={CONDITIONS} value={condition} onChange={setCondition} />
            </div>
            <MetricsPanel condition={condition} />
          </div>

          {/* Patient notes */}
          <div>
            <h2 className="mb-3 text-xl font-bold">Patient Notes</h2>
            <PatientNotes />
          </div>
        </section>

        {/* Sidebar */}
        <aside className="xl:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-[#6b4b3e] bg-white p-4">
            <div className="mb-2 text-lg font-bold">AI Assistant</div>
            <div className="flex h-[520px] items-center justify-center rounded-xl border border-[#6b4b3e] bg-[#f8f4f9]">
              <div className="text-center opacity-70">
                <div className="mb-2 text-6xl">💬</div>
                <div className="font-semibold">AI Assistant</div>
                <div className="text-sm">(placeholder for ChatGPT integration)</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default dynamic(() => Promise.resolve(HCPDashboard), { ssr: false });
