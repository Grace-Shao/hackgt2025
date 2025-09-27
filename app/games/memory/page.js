"use client";
import { useEffect, useRef, useState } from "react";

// Simple Simon-style memory sequence game with musical notes per tile.
// Drop this file at: app/games/memory/page.js (Next.js App Router)
// Tailwind CSS is used for styling.

const TILES = [
  {
    id: 0,
    label: "C",
    symbol: "♪",
    freq: 261.63, // C4
    baseClass: "bg-[#F7A6A1]/70 text-[#4b2f23]",
    activeClass: "bg-[#F7A6A1] text-[#4b2f23]",
    legend: "#F7A6A1",
  },
  {
    id: 4,
    label: "D",
    symbol: "♪",
    freq: 293.66, // D4
    baseClass: "bg-[#FBC4A0]/70 text-[#4b2f23]",
    activeClass: "bg-[#FBC4A0] text-[#4b2f23]",
    legend: "#FBC4A0",
  },
  {
    id: 1,
    label: "E",
    symbol: "♪",
    freq: 329.63, // E4
    baseClass: "bg-[#FDF1A9]/70 text-[#4b2f23]",
    activeClass: "bg-[#FDF1A9] text-[#4b2f23]",
    legend: "#FDF1A9",
  },
  {
    id: 2,
    label: "G",
    symbol: "♪",
    freq: 392.0, // G4
    baseClass: "bg-[#B6E2B6]/70 text-[#4b2f23]",
    activeClass: "bg-[#B6E2B6] text-[#4b2f23]",
    legend: "#B6E2B6",
  },
  {
    id: 5,
    label: "A",
    symbol: "♪",
    freq: 440.0, // A4
    baseClass: "bg-[#A7D8F7]/70 text-[#4b2f23]",
    activeClass: "bg-[#A7D8F7] text-[#4b2f23]",
    legend: "#A7D8F7",
  },
  {
    id: 3,
    label: "B",
    symbol: "♪",
    freq: 493.88, // B4
    baseClass: "bg-[#C7B5E9]/70 text-[#4b2f23]",
    activeClass: "bg-[#C7B5E9] text-[#4b2f23]",
    legend: "#C7B5E9",
  },
];

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function createAudio() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    return ctx;
  } catch {
    return null;
  }
}

function useAudio() {
  const ctxRef = useRef(null);

  useEffect(() => {
    ctxRef.current = createAudio();
    return () => {
      try { ctxRef.current?.close(); } catch {}
    };
  }, []);

  async function resume() {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") {
      try { await ctx.resume(); } catch {}
    }
  }

  function play(freq = 440, duration = 350, volume = 0.2) {
    const ctx = ctxRef.current;
    if (!ctx) return { stop: () => {} };
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration / 1000 + 0.02);
    return {
      stop: () => {
        try {
          osc.stop();
          gain.disconnect();
          osc.disconnect();
        } catch {}
      },
    };
  }

  return { play, resume };
}

const PALETTE = {
  dark: "#6b4b3e",
  tan: "#c49e85",
  lightBrown: "#ffd6af",
  background: "#f8f4f9",
  lavender: "#BEA7E5",
};

const BUTTON_BASE =
  "rounded-full px-6 h-12 text-lg font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function MemorySequenceGame() {
  const [status, setStatus] = useState("idle"); // idle | computer | player | won | lost
  const [sequence, setSequence] = useState([]); // e.g., [0, 2, 2, 1]
  const [stepIdx, setStepIdx] = useState(0); // where the player is in the sequence
  const [activeTile, setActiveTile] = useState(null);
  const [message, setMessage] = useState("Press Start to begin.");

  const [soundOn, setSoundOn] = useState(true);
  const [strict, setStrict] = useState(false);
  const [speed, setSpeed] = useState(650); // ms between steps on playback

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [strictHint, setStrictHint] = useState("");

  const playingRef = useRef(false);
  const sequenceRef = useRef(sequence);
  const { play, resume } = useAudio();

  useEffect(() => {
    const b = Number(localStorage.getItem("memory.best") || 0);
    setBest(b);
  }, []);

  useEffect(() => {
    localStorage.setItem("memory.best", String(best));
  }, [best]);

  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  function randomTile() {
    return TILES[Math.floor(Math.random() * TILES.length)].id;
  }

  async function flashTile(tileId, toneMs = Math.max(220, speed - 120)) {
    setActiveTile(tileId);
    if (soundOn) play(TILES[tileId].freq, toneMs);
    await sleep(toneMs);
    setActiveTile(null);
    await sleep(80);
  }

  async function playBack() {
    await resume();
    playingRef.current = true;
    setStatus("computer");
    setMessage("Listen to the sequence…");
    setStrictHint("");

    // Dynamic speed-up as sequence grows
    const seq = sequenceRef.current;
    const n = seq.length;
    const base = Math.max(350, speed - Math.min(300, n * 12));

    for (let i = 0; i < seq.length; i++) {
      if (!playingRef.current) return; // aborted
      const step = seq[i];
      await flashTile(step, Math.floor(base * 0.75));
      await sleep(Math.floor(base * 0.4));
    }

    setStatus("player");
    setStepIdx(0);
    setMessage("Your turn—repeat the sequence.");
  }

  async function startGame() {
    if (status === "computer") return;
    setScore(0);
    const first = [randomTile()];
    sequenceRef.current = first;
    setSequence(first);
    setMessage("Round 1: Listen to the first note…");
    setStrictHint("");
    setTimeout(playBack, 350);
  }

  async function nextRound() {
    setSequence((prev) => {
      const next = [...prev, randomTile()];
      sequenceRef.current = next;
      const newScore = next.length - 1;
      setScore(newScore);
      setBest((b) => (newScore > b ? newScore : b));
      setStrictHint("");
      setTimeout(playBack, 500);
      return next;
    });
  }

  function stopPlayback() {
    playingRef.current = false;
  }

  async function handlePress(tileId) {
    if (status !== "player") return;
    // Immediate feedback
    await resume();
    setActiveTile(tileId);
    if (soundOn) play(TILES[tileId].freq, 240);
    await sleep(160);
    setActiveTile(null);

    const expected = sequence[stepIdx];
    if (tileId === expected) {
      if (stepIdx + 1 === sequence.length) {
        // Completed current sequence
        setStatus("computer");
        setMessage("Nice! Get ready for the next round…");
        setStrictHint("");
        await sleep(600);
        nextRound();
      } else {
        setStepIdx(stepIdx + 1);
      }
    } else {
      // Wrong press
      setStatus("lost");
      if (strict) {
        setMessage("Try again with a new sequence!");
        setStrictHint("Or turn off strict mode for easier gameplay!");
      } else {
        setMessage("Missed it! Watch the sequence again.");
        setStrictHint("");
      }
      if (strict) {
        await sleep(800);
        // Restart from scratch
        setScore(0);
        const restart = [randomTile()];
        sequenceRef.current = restart;
        setSequence(restart);
        setTimeout(playBack, 500);
      } else {
        await sleep(800);
        // Replay same sequence
        setTimeout(playBack, 350);
      }
    }
  }

  function giveUp() {
    stopPlayback();
    setStatus("idle");
    setMessage("Game stopped. Press Start to play again.");
    sequenceRef.current = [];
    setSequence([]);
    setStepIdx(0);
    setActiveTile(null);
    setStrictHint("");
  }

  const gridClasses = "grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto";

  return (
    <main
      className="relative min-h-screen py-10 px-4 md:px-10 text-[#4b2f23]"
      style={{ backgroundColor: PALETTE.background }}
      suppressHydrationWarning
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[rgba(190,167,229,0.35)] blur-3xl" />
        <div className="absolute -bottom-24 -left-14 h-80 w-80 rounded-full bg-[rgba(255,214,175,0.35)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col space-y-8">
        <header className="flex flex-col items-start gap-3">
         
          <h1 className="text-3xl font-extrabold tracking-tight text-[#4b2f23] md:text-4xl">
            Simon Says: Memory Blend
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-[#4b2f23] opacity-80">
            Cozy up and follow the musical pattern. Listen, repeat, and enjoy the rhythm as the
            sequence grows round by round.
          </p>
        </header>

        <section className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/85 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-base">
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#4b2f23] opacity-80">Sound</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#6b4b3e]"
                checked={soundOn}
                onChange={(e) => setSoundOn(e.target.checked)}
              />
              <span>{soundOn ? "On" : "Off"}</span>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#4b2f23] opacity-80">Strict mode</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#6b4b3e]"
                checked={strict}
                onChange={(e) => setStrict(e.target.checked)}
              />
              <span>{strict ? "On (restart on mistake)" : "Off (replay on mistake)"}</span>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#4b2f23] opacity-80">Speed</span>
              <select
                className="rounded-full border border-[rgba(107,75,62,0.25)] bg-white px-4 py-2 text-base"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={700}>Chill</option>
                <option value={550}>Steady</option>
                <option value={430}>Breezy</option>
                <option value={360}>Spirited</option>
              </select>
            </label>

            <div className="ml-auto flex flex-wrap gap-3">
              <button
                onClick={startGame}
                className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e] disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={status === "computer"}
              >
                Start
              </button>
              <button
                onClick={giveUp}
                className={`${BUTTON_BASE} border border-[rgba(107,75,62,0.3)] bg-white text-[#6b4b3e] hover:bg-[#f4ece6] focus-visible:outline-[#6b4b3e] disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={status === "idle"}
              >
                Stop
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-base text-[#4b2f23]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(190,167,229,0.2)] px-4 py-1 font-semibold">
              Score
              <span>{score}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,214,175,0.3)] px-4 py-1 font-semibold">
              Best
              <span>{best}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 font-semibold" aria-live="polite">
              Status
              <span className="font-medium text-[#4b2f23] opacity-80">{message}</span>
            </span>
          </div>
          {strictHint && (
            <div className="inline-flex rounded-full bg-[rgba(190,50,70,0.08)] px-4 py-2 text-sm font-semibold text-[#a8464f]">
              {strictHint}
            </div>
          )}
        </section>

        <section className="relative space-y-5 rounded-3xl border border-[rgba(107,75,62,0.15)] bg-white/85 p-6 shadow-lg">
          <div className={gridClasses}>
            {TILES.map((t) => {
              const isActive = activeTile === t.id;
              return (
                <button
                  key={t.id}
                  onMouseDown={() => handlePress(t.id)}
                  onTouchStart={() => handlePress(t.id)}
                  disabled={status === "computer"}
                  className={[
                    "relative aspect-square rounded-2xl border border-[rgba(107,75,62,0.12)] shadow-sm flex items-center justify-center transition-all select-none",
                    isActive ? t.activeClass : t.baseClass,
                    status === "computer"
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:brightness-105 active:scale-[0.98]",
                  ].join(" ")}
                >
                  <div className="text-center">
                    <div className="text-5xl leading-none drop-shadow-sm">{t.symbol}</div>
                    <div className="mt-1 text-xl font-semibold opacity-80">{t.label}</div>
                  </div>
                  <div
                    className={[
                      "pointer-events-none absolute inset-0 rounded-2xl ring-0 transition-all",
                      isActive ? "ring-8 ring-white/60" : "",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-[#4b2f23] opacity-80 md:grid-cols-4">
            {TILES.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2">
                <span
                  className="inline-block h-4 w-4 rounded-full border border-[rgba(107,75,62,0.25)]"
                  style={{ backgroundColor: t.legend }}
                />
                <span className="font-semibold">{t.label}</span>
                <span className="opacity-70">{Math.round(t.freq)} Hz</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="max-w-3xl text-sm leading-relaxed text-[#4b2f23] opacity-80">
          Tips: Start slow, hum along, and notice the rhythm. Strict mode restarts on mistakes;
          otherwise the round is replayed so you can learn the pattern. Your best score is saved
          locally.
        </footer>
      </div>
    </main>
  );
}
