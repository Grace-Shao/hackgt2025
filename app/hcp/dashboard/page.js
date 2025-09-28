"use client";

import { HCPNav } from "@/components/hcp-nav";
import { useMemo, useRef, useState } from "react";
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

/* ---------------- theme ---------------- */
const PALETTE = {
  darkBrown: "#6b4b3e",
  tan: "#c49e85",
  lightBrown: "#ffd6af",
  background: "#f8f4f9",
};

/* ---------------- ordered tabs ---------------- */
const TABS = [
  "All",
  "Dementia",
  "Alzheimer's",
  "Parkinson's",
  "Stroke Recovery",
  "MCI",
  "Social",
];

/* ---------------- metric definitions ---------------- */
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
  // Added so those tabs render real charts
  "Stroke Recovery": {
    primary: { key: "NIHSS", label: "NIH Stroke Scale" },
    secondary: { key: "FMA", label: "Fugl-Meyer (UE)" },
    radar: ["Motor", "Speech", "Sensation", "ADL", "Balance"],
  },
  Social: {
    primary: { key: "ENGAGE", label: "Engagement Score" },
    secondary: { key: "MOOD", label: "Mood Index" },
    radar: ["Conversation", "Group", "Family", "Activities", "Confidence"],
  },
};

/* ---------------- fake data helpers ---------------- */
function seededRand(seed) {
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

/* ---------------- sample notes ---------------- */
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

/* ---------------- small UI ---------------- */
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

function MetricsPanel({ def, trend, radar }) {
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
          <div className="mb-2 text-sm font-semibold">
            {def.primary.label} — 12-week trend
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.tan} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: PALETTE.darkBrown }}
                  stroke={PALETTE.darkBrown}
                />
                <YAxis
                  tick={{ fill: PALETTE.darkBrown }}
                  stroke={PALETTE.darkBrown}
                />
                <Tooltip
                  contentStyle={{
                    borderColor: PALETTE.darkBrown,
                    color: PALETTE.darkBrown,
                  }}
                />
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
          <div className="mb-2 text-sm font-semibold">
            {def.secondary.label} — recent distribution
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.tan} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: PALETTE.darkBrown }}
                  stroke={PALETTE.darkBrown}
                />
                <YAxis
                  tick={{ fill: PALETTE.darkBrown }}
                  stroke={PALETTE.darkBrown}
                />
                <Tooltip
                  contentStyle={{
                    borderColor: PALETTE.darkBrown,
                    color: PALETTE.darkBrown,
                  }}
                />
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
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: PALETTE.darkBrown }}
                  stroke={PALETTE.darkBrown}
                />
                <PolarRadiusAxis
                  stroke={PALETTE.darkBrown}
                  tick={{ fill: PALETTE.darkBrown }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  fill={PALETTE.tan}
                  fillOpacity={0.3}
                  stroke={PALETTE.darkBrown}
                />
                <Tooltip
                  contentStyle={{
                    borderColor: PALETTE.darkBrown,
                    color: PALETTE.darkBrown,
                  }}
                />
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
        <div className="border-r border-[#6b4b3e] bg-[#f8f4f9] p-3 md:max-h=[380px] md:overflow-auto">
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
                  <div className="truncate text-xs opacity-80">{n.title}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Note body */}
        <div className="p-4 md:col-span-2">
          <div className="text-sm opacity-80">
            {new Date(note.date).toLocaleString()}
          </div>
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

/* ---------------- export helpers ---------------- */
function csvEscape(v = "") {
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}
function buildCSV({ patient, condition, def, trend, ai }) {
  const head = [
    ["Patient", patient?.name ?? ""],
    ["Condition", condition],
    ["Primary", def.primary.key],
    ["Secondary", def.secondary.key],
    ["RiskScore", ai?.risk_score ?? ""],
    ["RiskLevel", ai?.risk_level ?? ""],
  ]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");

  const summary = ai?.summary ? `\n\nSummary,\n${csvEscape(ai.summary)}\n` : "\n";
  const drivers = (ai?.drivers ?? []).map((d) => `- ${d}`).join(" ");
  const recs = (ai?.recommendations ?? []).map((d) => `- ${d}`).join(" ");
  const notes = `Drivers,\n${csvEscape(drivers)}\n\nRecommendations,\n${csvEscape(recs)}\n`;

  const trendHeader = `\nTrend,\n${[
    "Week",
    def.primary.key,
    def.secondary.key,
  ]
    .map(csvEscape)
    .join(",")}\n`;
  const trendRows = trend
    .map((r) =>
      [r.week, r[def.primary.key], r[def.secondary.key]]
        .map(csvEscape)
        .join(",")
    )
    .join("\n");

  return `${head}${summary}${notes}${trendHeader}${trendRows}\n`;
}

function RiskBadge({ score, level }) {
  const color =
    level === "High"
      ? "bg-red-600"
      : level === "Medium"
      ? "bg-yellow-500"
      : "bg-emerald-600";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-white ${color}`}>
      Priority: {level}{" "}
      <span className="rounded bg-white/20 px-2 py-[2px] text-white">{score}</span>
    </span>
  );
}

function AIAssistantPanel({
  exportRef,
  patient,
  condition,
  def,
  trend,
  radar,
  notes,
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  async function generate() {
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/cog-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          condition,
          primaryKey: def.primary.key,
          secondaryKey: def.secondary.key,
          trend,
          radar,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setResult(data);
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const csv = buildCSV({ patient, condition, def, trend, ai: result });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patient?.name ?? "patient"}_${condition}_summary.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text(`${patient?.name ?? "Patient"} — ${condition} summary`, 40, 40);

    if (exportRef?.current) {
      const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = doc.internal.pageSize.getWidth() - 80;
      const pageHeight = doc.internal.pageSize.getHeight() - 120;
      const imgW = pageWidth;
      const imgH = canvas.height * (imgW / canvas.width);
      let y = 70;
      if (imgH <= pageHeight) {
        doc.addImage(imgData, "PNG", 40, y, imgW, imgH);
      } else {
        let sY = 0;
        const sliceH = canvas.height * (pageHeight / imgH);
        while (sY < canvas.height) {
          const part = document.createElement("canvas");
          part.width = canvas.width;
          part.height = Math.min(sliceH, canvas.height - sY);
          const ctx = part.getContext("2d");
          ctx.drawImage(
            canvas,
            0,
            sY,
            canvas.width,
            part.height,
            0,
            0,
            part.width,
            part.height
          );
          const partData = part.toDataURL("image/png");
          doc.addImage(partData, "PNG", 40, y, imgW, part.height * (imgW / part.width));
          sY += sliceH;
          if (sY < canvas.height) {
            doc.addPage();
            y = 40;
          }
        }
      }
    }

    if (result) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text("AI Summary", 40, 40);
      doc.setFontSize(11);
      const wrap = (txt) =>
        doc.splitTextToSize(txt, doc.internal.pageSize.getWidth() - 80);
      doc.text(wrap(result.summary || ""), 40, 60);

      if (result.drivers?.length) {
        doc.setFontSize(12);
        doc.text("Key drivers", 40, 140);
        doc.setFontSize(11);
        result.drivers.forEach((d, i) => doc.text(`• ${d}`, 40, 160 + i * 16));
      }
      if (result.recommendations?.length) {
        const base = 160 + (result.drivers?.length || 0) * 16 + 20;
        doc.setFontSize(12);
        doc.text("Recommended next steps", 40, base);
        doc.setFontSize(11);
        result.recommendations.forEach((d, i) =>
          doc.text(`• ${d}`, 40, base + 20 + i * 16)
        );
      }
      doc.setFontSize(10);
      doc.text(
        `Priority: ${result.risk_level} (${result.risk_score}) · Confidence ${(result.confidence * 100).toFixed(
          0
        )}% · Source: ${result.source}`,
        40,
        doc.internal.pageSize.getHeight() - 40
      );
    }

    doc.save(`${patient?.name ?? "patient"}_${condition}_summary.pdf`);
  }

  return (
    <div className="rounded-2xl border border-[#6b4b3e] bg-white p-4" id="ai-panel">
      <div className="mb-2 text-lg font-bold">AI Assistant</div>

      {!result && (
        <div className="mb-3 text-sm opacity-70">
          Generates a brief patient summary and a priority score (0–100) from the latest metrics and notes.
          <div className="mt-2 italic text-[12px] opacity-60">Not medical advice.</div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-full border border-[#6b4b3e] px-4 py-2 text-sm font-semibold hover:bg-[#f8f4f9]"
        >
          {loading ? "Analyzing…" : "Generate summary"}
        </button>

        <button
          type="button"
          onClick={exportCSV}
          className="rounded-full border border-[#6b4b3e] px-4 py-2 text-sm font-semibold hover:bg-[#f8f4f9]"
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={exportPDF}
          className="rounded-full border border-[#6b4b3e] px-4 py-2 text-sm font-semibold hover:bg-[#f8f4f9]"
        >
          Export PDF
        </button>
      </div>

      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}

      {result && (
        <div className="mt-3 space-y-3">
          <RiskBadge score={result.risk_score} level={result.risk_level} />
          <div className="rounded-lg border border-[#6b4b3e] bg-[#f8f4f9] p-3 text-sm leading-relaxed">
            {result.summary}
          </div>
          {result.drivers?.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-semibold">Key drivers</div>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {result.drivers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {result.recommendations?.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-semibold">Recommended next steps</div>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {result.recommendations.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-[12px] opacity-60">
            Confidence: {(result.confidence * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- page ---------------- */
function HCPDashboard() {
  const [clientName] = useState("Jane Doe");

  // Tabs in requested order
  const [tab, setTab] = useState(TABS[0]); // "All"

  // When "All" is selected, display Dementia underneath
  const displayCondition = tab === "All" ? "Dementia" : tab;

  const def = METRIC_DEFS[displayCondition];
  const trend = useMemo(() => genTrend(displayCondition), [displayCondition]);
  const radar = useMemo(() => genRadar(displayCondition), [displayCondition]);

  const exportRef = useRef(null); // area to snapshot for PDF

  return (
    <div className="min-h-screen bg-[#f8f4f9] overflow-hidden">
      {/* NEW: HCP top navigation */}
      <HCPNav />

      <main className="relative py-8 px-4 md:px-8 text-[#6b4b3e]">
        {/* soft blobs for continuity with app style */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[rgba(190,167,229,0.3)] blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[rgba(255,214,175,0.3)] blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 mb-6">
          <h1 className="text-3xl font-extrabold text-[#6b4b3e]">
            Client: {clientName}
          </h1>
          <div className="mt-1 text-sm opacity-80">
            MRN ••••1234 · DOB 1959-02-17 · Last visit 2025-09-25
          </div>
        </header>

        {/* Content wrapped for PDF export */}
        <div ref={exportRef} className="relative z-10">
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
            {/* Main column */}
            <section className="space-y-6 xl:col-span-2">
              {/* Metrics box with tabs */}
              <div className="rounded-2xl border border-[#6b4b3e] bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">Condition Dashboard</h2>
                  <Tabs tabs={TABS} value={tab} onChange={setTab} />
                </div>
                <MetricsPanel def={def} trend={trend} radar={radar} />
              </div>

              {/* Patient notes */}
              <div>
                <h2 className="mb-3 text-xl font-bold">Patient Notes</h2>
                <PatientNotes />
              </div>
            </section>

            {/* Sidebar */}
            <aside className="xl:col-span-1">
              <div className="sticky top-6 space-y-4">
                <AIAssistantPanel
                  exportRef={exportRef}
                  patient={{ name: clientName, age: 66 }}
                  condition={displayCondition}
                  def={def}
                  trend={trend}
                  radar={radar}
                  notes={NOTES}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(HCPDashboard), { ssr: false });
