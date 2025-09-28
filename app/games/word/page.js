"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MainNav } from "@/components/main-nav";

const CATS = ["Animals", "Food", "Countries", "Household", "Occupations", "Emotions"];
const DIFFS = ["easy", "medium", "hard"];

const PALETTE = {
  dark: "#6b4b3e",
  tan: "#c49e85",
  lightBrown: "#ffd6af",
  background: "#f8f4f9",
  lavender: "#BEA7E5",
};

const BUTTON_BASE =
  "rounded-full px-6 h-12 text-lg font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const DIFFICULTY_LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const difficultyButtonClass = (active) =>
  [
    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
    "border border-[rgba(107,75,62,0.2)] shadow-sm",
    active ? "bg-[#6b4b3e] text-white" : "bg-white/80 text-[#4b2f23] hover:bg-[#f4ece6]",
  ].join(" ");

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
  return word
    .split("")
    .map((ch, i) => (revealed.has(i) ? ch.toUpperCase() : "_"))
    .join(" ");
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
  const [revealed, setRevealed] = useState(new Set());
  const inputRef = useRef(null);

  const masked = useMemo(() => maskWord(word, revealed), [word, revealed]);
  const currentClue = useMemo(
    () => (status === "playing" && clues.length ? clues[Math.min(clueIdx, clues.length - 1)] : ""),
    [clues, clueIdx, status]
  );
  const lettersRevealed = revealed.size;

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
    // Full-page wrapper with background + overflow guard
    <div className="relative min-h-[100svh] bg-[#f8f4f9] overflow-x-hidden">
      <MainNav />

      <main
        className="relative min-h-[calc(100svh-64px)] py-10 px-4 md:px-10 text-[#4b2f23]"
        suppressHydrationWarning
      >
        {/* soft background blobs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[rgba(190,167,229,0.35)] blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[rgba(255,214,175,0.35)] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col space-y-8">
          <header className="flex flex-col items-start gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#4b2f23] md:text-4xl">
              Word Master
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-[#4b2f23] opacity-80">
              Brew a fresh round of letters, listen to the hints, and spell out the surprise word at
              a cozy pace that feels good.
            </p>
          </header>

          <section className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/80 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-[#4b2f23]">
                <span className="opacity-80">Category</span>
                <select
                  className="rounded-full border border-[rgba(107,75,62,0.25)] bg-white px-4 py-2 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2 text-sm font-medium text-[#4b2f23]">
                <span className="opacity-80">Difficulty</span>
                <div className="flex flex-wrap gap-2">
                  {DIFFS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={difficultyButtonClass(difficulty === d)}
                      aria-pressed={difficulty === d}
                    >
                      {DIFFICULTY_LABELS[d] ?? d}
                    </button>
                  ))}
                </div>
              </div>

              <label className="ml-auto inline-flex items-center gap-2 rounded-full border border-[rgba(107,75,62,0.15)] bg-white/80 px-4 py-2 text-sm font-medium shadow-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#6b4b3e]"
                  checked={voiceOn}
                  onChange={(e) => setVoiceOn(e.target.checked)}
                />
                Voice prompts
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={startRound}
                className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e] disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Loading…" : "Start"}
              </button>
              <button
                onClick={nextClue}
                className={`${BUTTON_BASE} border border-[rgba(107,75,62,0.25)] bg-white text-[#4b2f23] hover:bg-[#f4ece6] focus-visible:outline-[#6b4b3e] disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={status !== "playing" || clueIdx >= clues.length - 1}
              >
                Next clue
              </button>
              <button
                onClick={revealLetter}
                className={`${BUTTON_BASE} bg-[#BEA7E5] text-[#4b2f23] hover:bg-[#b497dd] focus-visible:outline-[#BEA7E5] disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={status !== "playing"}
              >
                Reveal a letter
              </button>
              <button
                onClick={giveUp}
                className={`${BUTTON_BASE} border border-[rgba(107,75,62,0.25)] bg-white text-[#6b4b3e] hover:bg-[#f4ece6] focus-visible:outline-[#6b4b3e] disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={!word}
              >
                I give up
              </button>
            </div>

            <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#4b2f23]">
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(190,167,229,0.2)] px-4 py-1">
                <span className="text-xs uppercase tracking-wide opacity-70">Category</span>
                <span>{category}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,214,175,0.3)] px-4 py-1">
                <span className="text-xs uppercase tracking-wide opacity-70">Clues Used</span>
                <span>
                  {clues.length ? clueIdx + 1 : 0}/{clues.length || 0}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1">
                <span className="text-xs uppercase tracking-wide opacity-70">Letters Revealed</span>
                <span>{lettersRevealed}</span>
              </span>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-[rgba(107,75,62,0.15)] bg-white/80 p-6 shadow-lg">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(107,75,62,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#4b2f23]">
                Instruction
              </span>
            <p className="text-lg font-medium text-[#4b2f23]" aria-live="polite">
                {status === "playing" && currentClue ? currentClue : message}
              </p>
            </div>

            <div className="rounded-3xl border border-[rgba(107,75,62,0.2)] bg-white px-6 py-6 text-center shadow-inner">
              <div className="text-xs uppercase tracking-[0.35em] text-[#4b2f23] opacity-70">
                Mystery Word
              </div>
              <div className="mt-3 text-3xl font-mono tracking-[0.4em] text-[#4b2f23] md:text-5xl">
                {word ? masked : "—"}
              </div>
            </div>

            <form
              onSubmit={onGuessSubmit}
              className="flex w-full flex-col items-center gap-3 md:flex-row md:justify-center"
            >
              <input
                ref={inputRef}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess…"
                className="w-full max-w-md rounded-full border border-[rgba(107,75,62,0.25)] bg-white px-6 py-3 text-lg shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e] disabled:bg-[#f1e8e2]"
                disabled={status !== "playing"}
              />
              <button
                type="submit"
                className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e] disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={status !== "playing"}
              >
                Guess
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => speak(currentClue || message, voiceOn)}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(107,75,62,0.25)] bg-white/90 px-5 py-2 text-sm font-medium text-[#4b2f23] shadow-sm transition-colors hover:bg-[#f4ece6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b4b3e] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!word}
              >
                <span role="img" aria-hidden>🔊</span>
                Hear it again
              </button>
            </div>
          </section>

          <footer className="max-w-3xl text-sm leading-relaxed text-[#4b2f23] opacity-80">
            Tip: If the clues feel tough, use “Reveal a letter” or switch to an easier category.
          </footer>
        </div>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(WordGame), { ssr: false });
