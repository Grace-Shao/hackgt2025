// app/games/word/page.js
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const CATS = ["Animals", "Food", "Countries", "Household", "Occupations", "Emotions"];
const DIFFS = ["easy", "medium", "hard"];

function speak(text, enabled = true) {
  try {
    if (!enabled || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.0;
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

function maskWord(word, revealed) {
  return word.split("").map((ch, i) => (revealed.has(i) ? ch.toUpperCase() : "_")).join(" ");
}

function WordGame() {
  const [category, setCategory] = useState(CATS[0]);
  const [difficulty, setDifficulty] = useState("easy");
  const [voiceOn, setVoiceOn] = useState(true);

  const [status, setStatus] = useState("idle"); // idle | loading | playing | won
  const [word, setWord] = useState("");
  const [clues, setClues] = useState([]);
  const [clueIdx, setClueIdx] = useState(0);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Pick a category and press Start.");
  const [revealed, setRevealed] = useState(new Set()); // indices shown as hints
  const inputRef = useRef(null);

  const masked = useMemo(() => maskWord(word, revealed), [word, revealed]);

  async function startRound() {
    setStatus("loading");
    setMessage("Getting a new word…");
    setWord("");
    setClues([]);
    setClueIdx(0);
    setGuess("");
    setRevealed(new Set());

    try {
      const res = await fetch("/api/word-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty }),
      });
      const data = await res.json();
      const w = String(data.word || "").toLowerCase();
      const cs = Array.isArray(data.clues) ? data.clues : [];
      if (!w || cs.length < 1) throw new Error("Bad data");
      setWord(w);
      setClues(cs);
      setStatus("playing");
      setMessage("Listen to the clue and guess the word.");
      speak(`Category ${category}. ${cs[0]}`, voiceOn);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error(err);
      setStatus("idle");
      setMessage("Could not start a round. Try again.");
    }
  }

  function nextClue() {
    if (!clues.length) return;
    const i = Math.min(clues.length - 1, clueIdx + 1);
    setClueIdx(i);
    speak(clues[i], voiceOn);
  }

  function revealLetter() {
    if (!word) return;
    const indexes = [];
    for (let i = 0; i < word.length; i++) if (!revealed.has(i)) indexes.push(i);
    if (!indexes.length) return;
    const choice = indexes[Math.floor(Math.random() * indexes.length)];
    const next = new Set(revealed);
    next.add(choice);
    setRevealed(next);
  }

  function onGuessSubmit(e) {
    e.preventDefault();
    const clean = guess.trim().toLowerCase();
    if (!clean) return;
    setGuess("");
    if (clean === word) {
      setStatus("won");
      setMessage(`Correct! The word was "${word.toUpperCase()}".`);
      speak("Correct! Well done.", voiceOn);
    } else {
      setMessage("Not yet. Try again or ask for another clue.");
      speak("Not yet. Try again.", voiceOn);
    }
  }

  function giveUp() {
    if (!word) return;
    setStatus("idle");
    setMessage(`The word was "${word.toUpperCase()}". Press Start for a new word.`);
    speak(`The word was ${word}.`, voiceOn);
  }

  return (
    <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold">Word Guess</h1>

      {/* Controls */}
      <div className="rounded-xl border p-4 bg-white space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 items-center">
            <span className="text-sm opacity-70">Category:</span>
            <select
              className="border rounded-lg px-3 py-2 text-base"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm opacity-70">Difficulty:</span>
            <div className="flex gap-1">
              {DIFFS.map((d) => (
                <label key={d} className="border rounded-lg px-3 py-2 text-base cursor-pointer">
                  <input
                    type="radio"
                    name="diff"
                    className="mr-2"
                    checked={difficulty === d}
                    onChange={() => setDifficulty(d)}
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 ml-auto">
            <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} />
            Voice prompts
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={startRound}
            className="rounded-full border px-6 h-12 text-lg font-semibold"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading…" : "Start"}
          </button>
          <button
            onClick={nextClue}
            className="rounded-full border px-6 h-12 text-lg font-semibold disabled:opacity-50"
            disabled={status !== "playing" || clueIdx >= clues.length - 1}
          >
            Next clue
          </button>
          <button
            onClick={revealLetter}
            className="rounded-full border px-6 h-12 text-lg font-semibold disabled:opacity-50"
            disabled={status !== "playing"}
          >
            Reveal a letter
          </button>
          <button
            onClick={giveUp}
            className="rounded-full border px-6 h-12 text-lg font-semibold disabled:opacity-50"
            disabled={!word}
          >
            I give up
          </button>
        </div>
      </div>

      {/* Game area */}
      <div className="rounded-xl border p-5 bg-[#fafafa] space-y-4">
        <div className="text-xl md:text-2xl">
          <b>Instruction:</b>{" "}
          <span className="font-semibold">
            {status === "playing" && clues.length ? clues[clueIdx] : message}
          </span>
        </div>

        {/* Masked word */}
        <div className="text-3xl md:text-5xl font-mono tracking-[.25em] text-center py-4 bg-white rounded-lg border">
          {word ? masked : "—"}
        </div>

        {/* Guess form */}
        <form onSubmit={onGuessSubmit} className="flex gap-2 items-center justify-center">
          <input
            ref={inputRef}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Type your guess…"
            className="border rounded-lg px-4 h-12 text-xl w-full max-w-md"
            disabled={status !== "playing"}
          />
          <button
            type="submit"
            className="rounded-full border px-6 h-12 text-xl font-semibold disabled:opacity-50"
            disabled={status !== "playing"}
          >
            Guess
          </button>
        </form>

        {/* Read clue again */}
        <div className="text-center">
          <button
            onClick={() => speak(clues[clueIdx] || message, voiceOn)}
            className="rounded-full border px-4 h-10 text-base"
            disabled={!word}
          >
            🔊 Hear it again
          </button>
        </div>
      </div>

      <div className="text-sm opacity-70">
        Tip: If the clues feel too hard, switch to “easy” or use “Reveal a letter”.
      </div>
    </main>
  );
}

export default dynamic(() => Promise.resolve(WordGame), { ssr: false });
