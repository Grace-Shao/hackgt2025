// app/api/word-game/route.js
import { NextResponse } from "next/server";

const FALLBACK = {
  Animals: [
    { word: "tiger", clues: ["A big striped cat", "It can roar loudly", "Lives in forests", "Fast and strong"] },
    { word: "dolphin", clues: ["Lives in the ocean", "Very smart", "Jumps and plays", "Helps people sometimes"] },
    { word: "panda", clues: ["Black and white", "Eats bamboo", "Lives in China", "Very gentle"] },
  ],
  Food: [
    { word: "pasta", clues: ["Often eaten with sauce", "Italian dish", "Made from wheat", "Long or short shapes"] },
    { word: "banana", clues: ["Yellow fruit", "Soft inside", "Monkeys love it", "Good for potassium"] },
    { word: "soup", clues: ["Served in a bowl", "Warm and comforting", "Can be chicken or tomato", "You eat it with a spoon"] },
  ],
  Countries: [
    { word: "canada", clues: ["Very large country", "Cold winters", "Maple leaf", "North of the USA"] },
    { word: "india", clues: ["Taj Mahal", "Spicy food", "Many languages", "Cricket is popular"] },
    { word: "japan", clues: ["Sushi", "Mount Fuji", "Cherry blossoms", "High-tech"] },
  ],
  Household: [
    { word: "pillow", clues: ["Soft and fluffy", "On a bed", "You rest your head", "Covered with a case"] },
    { word: "kettle", clues: ["Boils water", "For tea or coffee", "Whistles sometimes", "Sits on a stove or base"] },
    { word: "broom", clues: ["Used for cleaning", "Long handle", "Sweeps the floor", "Made of bristles"] },
  ],
  Occupations: [
    { word: "teacher", clues: ["Works at a school", "Gives homework", "Explains lessons", "Helps students learn"] },
    { word: "nurse", clues: ["Works in a hospital", "Cares for patients", "Takes temperature", "Very helpful"] },
    { word: "farmer", clues: ["Grows crops", "Raises animals", "Works on a field", "Drives a tractor"] },
  ],
  Emotions: [
    { word: "joyful", clues: ["Feeling very happy", "Smiles a lot", "Light-hearted", "Opposite of sad"] },
    { word: "proud", clues: ["Good feeling after success", "Chest up", "Satisfied", "After doing something well"] },
    { word: "calm", clues: ["Peaceful and quiet", "Slow breathing", "Relaxed", "Not worried"] },
  ],
};

const CATEGORIES = Object.keys(FALLBACK);

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const {
    category = "Animals",
    difficulty = "easy", // easy | medium | hard
  } = body || {};

  const openaiKey = process.env.OPENAI_API_KEY;

  // If no key, use fallback immediately
  if (!openaiKey) {
    const data = fallbackRound(category);
    return NextResponse.json({ ...data, source: "fallback" }, { status: 200 });
  }

  try {
    // Use the official OpenAI SDK (npm i openai)
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    // Shape word length by difficulty (gentle ranges)
    const ranges = {
      easy: [4, 7],
      medium: [5, 9],
      hard: [6, 10],
    };
    const [minLen, maxLen] = ranges[difficulty] ?? ranges.easy;

    const prompt = [
      "You are a helpful word-game maker for older adults.",
      "Pick a simple, family-friendly word in the given category.",
      `Category: ${category}`,
      `Difficulty: ${difficulty} (word length ${minLen}-${maxLen})`,
      "Return 4–6 short, clear clues that gradually get easier.",
      "Use common, everyday language. Avoid jargon, slang, brand names, or abbreviations.",
      "Output strict JSON with keys: word, clues[].",
    ].join("\n");

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return only valid JSON. No explanations." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = resp.choices?.[0]?.message?.content?.trim() || "";
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      // If model returns text not strict JSON, fall back
      json = fallbackRound(category);
    }

    // Validate
    const word = String(json?.word || "").toLowerCase().replace(/[^a-z]/g, "");
    let clues = Array.isArray(json?.clues) ? json.clues.filter(Boolean) : [];
    if (!word || word.length < 3 || clues.length < 3) {
      const fb = fallbackRound(category);
      return NextResponse.json({ ...fb, source: "fallback" }, { status: 200 });
    }

    // Trim clues and cap to 6
    clues = clues.map(c => String(c).slice(0, 120)).slice(0, 6);

    return NextResponse.json({ word, clues, source: "openai" }, { status: 200 });
  } catch (err) {
    console.error("word-game error:", err);
    const fb = fallbackRound(category);
    return NextResponse.json({ ...fb, source: "fallback" }, { status: 200 });
  }
}

function fallbackRound(category) {
  const cat = CATEGORIES.includes(category) ? category : "Animals";
  const items = FALLBACK[cat];
  const pick = items[Math.floor(Math.random() * items.length)];
  return { word: pick.word, clues: pick.clues };
}
