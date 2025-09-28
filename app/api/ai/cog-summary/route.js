// app/api/ai/cog-summary/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Expects JSON:
 * {
 *   patient: { name, age },
 *   condition,
 *   primaryKey, secondaryKey,
 *   trend,   // [{ week, [primaryKey], [secondaryKey] }, ...]
 *   radar,   // [{ axis, score }, ...]
 *   notes    // [{ date, title, body, tags[] }, ...]
 * }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { patient, condition, primaryKey, secondaryKey, trend = [], radar = [], notes = [] } = body || {};

    // Quick features for the model (and fallback)
    const first = trend?.[0] || {};
    const last  = trend?.[trend.length - 1] || {};
    const pFirst = Number(first?.[primaryKey] ?? 0);
    const pLast  = Number(last?.[primaryKey] ?? 0);
    const sFirst = Number(first?.[secondaryKey] ?? 0);
    const sLast  = Number(last?.[secondaryKey] ?? 0);
    const pSlope = trend.length > 1 ? (pLast - pFirst) / (trend.length - 1) : 0;
    const sSlope = trend.length > 1 ? (sLast - sFirst) / (trend.length - 1) : 0;

    // If no key, return a basic (non-clinical) fallback
    if (!process.env.OPENAI_API_KEY) {
      // Naive priority: bigger decline in primary OR rise in secondary => higher priority
      let score = 50 - Math.sign(pSlope) * Math.min(Math.abs(pSlope) * 4, 25) + Math.max(sSlope, 0) * 3;
      score = Math.max(0, Math.min(100, Math.round(score)));
      const level = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";

      return NextResponse.json({
        source: "fallback",
        summary: `Automatic fallback summary for ${patient?.name ?? "patient"} with ${condition}. Primary metric moved from ${pFirst} to ${pLast}. Secondary from ${sFirst} to ${sLast}.`,
        drivers: [
          `Primary slope: ${pSlope.toFixed(2)}`,
          `Secondary slope: ${sSlope.toFixed(2)}`,
          `Recent value: ${pLast} (${primaryKey})`,
        ],
        recommendations: [
          "Confirm medication adherence and sleep routine.",
          "Schedule a follow-up if functional decline is noted by caregiver.",
        ],
        risk_score: score,
        risk_level: level,
        confidence: 0.4,
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = [
      "You are a careful clinical support assistant summarizing cognitive metrics for healthcare professionals.",
      "You must return STRICT JSON with fields:",
      "{ summary: string, drivers: string[], recommendations: string[], risk_score: number(0-100), risk_level: 'Low'|'Medium'|'High', confidence: number(0-1) }",
      "Scoring rubric (general):",
      "- Higher concern if the primary metric worsens over recent weeks (consider typical direction: if metric is a performance score, down is worse; if it's a severity score, up is worse).",
      "- Secondary worsening amplifies risk.",
      "- Use radar profile to highlight weak domains.",
      "- Incorporate notable phrases in notes (agitation, ADL issues, repeated questions, sleep disturbance).",
      "- Be concise, non-alarmist, and useful.",
    ].join("\n");

    const payload = {
      patient,
      condition,
      primaryKey,
      secondaryKey,
      features: { pFirst, pLast, sFirst, sLast, pSlope, sSlope },
      trend,
      radar,
      notes,
    };

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(payload) },
      ],
    });

    const raw = resp.choices?.[0]?.message?.content?.trim() || "{}";
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      // Very rare—model returned text; tiny safe fallback
      json = {
        summary: `Summary for ${patient?.name ?? "patient"} with ${condition}. Primary: ${pLast}, Secondary: ${sLast}.`,
        drivers: [`Primary slope ${pSlope.toFixed(2)}`, `Secondary slope ${sSlope.toFixed(2)}`],
        recommendations: ["Reassess in 2–4 weeks.", "Confirm caregiver concerns and ADLs."],
        risk_score: 50,
        risk_level: "Medium",
        confidence: 0.5,
      };
    }

    // Bound values + defaults
    const score = Math.max(0, Math.min(100, Number(json.risk_score ?? 50)));
    const level = json.risk_level || (score >= 70 ? "High" : score >= 40 ? "Medium" : "Low");

    return NextResponse.json({
      source: "openai",
      summary: String(json.summary || "").slice(0, 1200),
      drivers: Array.isArray(json.drivers) ? json.drivers.slice(0, 6) : [],
      recommendations: Array.isArray(json.recommendations) ? json.recommendations.slice(0, 6) : [],
      risk_score: score,
      risk_level: level,
      confidence: Math.max(0, Math.min(1, Number(json.confidence ?? 0.7))),
    });
  } catch (err) {
    console.error("cog-summary error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
