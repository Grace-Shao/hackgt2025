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
    baseClass: "bg-rose-200",
    activeClass: "bg-rose-600",
  },
  {
    id: 4,
    label: "D",
    symbol: "♪",
    freq: 293.66, // D4
    baseClass: "bg-indigo-200",
    activeClass: "bg-indigo-600",
  },
  {
    id: 1,
    label: "E",
    symbol: "♪",
    freq: 329.63, // E4
    baseClass: "bg-emerald-200",
    activeClass: "bg-emerald-600",
  },
  {
    id: 2,
    label: "G",
    symbol: "♪",
    freq: 392.0, // G4
    baseClass: "bg-sky-200",
    activeClass: "bg-sky-600",
  },
  {
    id: 5,
    label: "A",
    symbol: "♪",
    freq: 440.0, // A4
    baseClass: "bg-lime-200",
    activeClass: "bg-lime-600",
  },
  {
    id: 3,
    label: "B",
    symbol: "♪",
    freq: 493.88, // B4
    baseClass: "bg-amber-200",
    activeClass: "bg-amber-600",
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
    <main className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold">Memory Sequence</h1>

      {/* Controls */}
      <div className="rounded-xl border p-4 bg-white space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">Sound:</span>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-black"
                checked={soundOn}
                onChange={(e) => setSoundOn(e.target.checked)}
              />
              {soundOn ? "On" : "Off"}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">Strict mode:</span>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-black"
                checked={strict}
                onChange={(e) => setStrict(e.target.checked)}
              />
              {strict ? "On (restart on mistake)" : "Off (replay on mistake)"}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">Speed:</span>
            <select
              className="border rounded-lg px-3 py-2 text-base"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={700}>Chill</option>
              <option value={550}>Normal</option>
              <option value={430}>Spicy</option>
              <option value={360}>Insane</option>
            </select>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={startGame}
              className="rounded-full border px-6 h-11 text-lg font-semibold disabled:opacity-50"
              disabled={status === "computer"}
            >
              Start
            </button>
            <button
              onClick={giveUp}
              className="rounded-full border px-6 h-11 text-lg font-semibold disabled:opacity-50"
              disabled={status === "idle"}
            >
              Stop
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm opacity-70">
          <div>
            <span className="font-semibold">Score:</span> {score}
          </div>
          <div>
            <span className="font-semibold">Best:</span> {best}
          </div>
          <div>
            <span className="font-semibold">Status:</span> {message}
          </div>
        </div>
        {strictHint && (
          <div className="text-xs text-rose-600 font-semibold">
            {strictHint}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="rounded-xl border p-5 bg-[#fafafa]">
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
                  "relative aspect-square rounded-2xl border shadow-sm flex items-center justify-center transition-all select-none",
                  isActive ? t.activeClass : t.baseClass,
                  isActive ? "text-white" : "text-gray-900",
                  status === "computer" ? "opacity-70 cursor-not-allowed" : "hover:brightness-105 active:brightness-110",
                ].join(" ")}
              >
                <div className="text-center">
                  <div className="text-5xl leading-none">{t.symbol}</div>
                  <div className="text-xl font-bold opacity-80 mt-1">{t.label}</div>
                </div>
                {/* Glow ring when active */}
                <div
                  className={[
                    "absolute inset-0 rounded-2xl ring-0",
                    isActive ? "ring-8 ring-white/60" : "",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {TILES.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 rounded ${t.baseClass} border`} />
              <span className="font-semibold">{t.label}</span>
              <span className="opacity-70">{Math.round(t.freq)} Hz</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm opacity-70">
        Tips: Start slow and listen for intervals. Strict mode restarts on mistakes; otherwise the round is replayed so you can learn the pattern. Your best score is saved locally.
      </div>
    </main>
  );
}
