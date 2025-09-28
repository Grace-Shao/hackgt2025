"use client";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

/* ---------------- Steps & thresholds ---------------- */
const STEPS = [
  { id: "blink", text: "Simon says blink both eyes" },
  { id: "smile", text: "Simon says smile 🙂" },
  { id: "brows", text: "Simon says raise your eyebrows" },
];

const DEFAULTS = {
  BLINK_EAR_MAX: 0.30,     // Blink when EAR falls below this
  SMILE_MAR_MIN: 0.35,     // Simple smile proxy (mouth opens/widens)
  BROWS_EB_MIN:  22,       // Eyebrow height (px)
  FRAMES_REQUIRED: 3,      // Hold success for N frames
  REST_SECONDS: 4,         // Pause between steps (elderly-friendly)
};

const PALETTE = {
  dark: "#6b4b3e",
  tan: "#c49e85",
  lightBrown: "#ffd6af",
  background: "#f8f4f9",
  lavender: "#BEA7E5",
};

const BUTTON_BASE =
  "rounded-full px-6 h-12 text-lg font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/* ---------------- Component ---------------- */
function Page() {
  // DOM/engine refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lmRef = useRef(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  // Training flow
  const [status, setStatus] = useState("idle"); // idle | loading | running | rest | done
  const [stepIdx, setStepIdx] = useState(0);
  const stepRef = useRef(0);
  const [instruction, setInstruction] = useState("Tap Start and look at the camera");
  const [isOk, setIsOk] = useState(false);
  const [score, setScore] = useState(0);

  // Elder-friendly options
  const [restSeconds, setRestSeconds] = useState(DEFAULTS.REST_SECONDS);
  const [voiceOn, setVoiceOn] = useState(true);
  const [simpleMode, setSimpleMode] = useState(true);

  // Rest countdown
  const [restLeft, setRestLeft] = useState(0);
  const restTimerRef = useRef(null);
  const nextStepRef = useRef(null);

  // Metrics & thresholds
  const [metrics, setMetrics] = useState({ EAR: 0, MAR: 0, EB: 0 });
  const [faceDetected, setFaceDetected] = useState(false);
  const [blinkEAR, setBlinkEAR] = useState(DEFAULTS.BLINK_EAR_MAX);
  const [smileMAR, setSmileMAR] = useState(DEFAULTS.SMILE_MAR_MIN);
  const [browsEB,  setBrowsEB]  = useState(DEFAULTS.BROWS_EB_MIN);
  const [framesRequired, setFramesRequired] = useState(DEFAULTS.FRAMES_REQUIRED);

  /* ---------------- Start / Stop / Reset ---------------- */
  async function start() {
    if (runningRef.current) return;
    setStatus("loading");
    try {
      // Camera
      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      video.srcObject = stream;
      video.playsInline = true;
      await video.play();
      await ensureVideoReady(video);

      // Canvas
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // MediaPipe runtime + model
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10/wasm"
      );

      lmRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU", // switch to "CPU" if GPU is flaky
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
      });

      // Reset flow
      stepRef.current = 0;
      setStepIdx(0);
      setInstruction(STEPS[0].text);
      speak(`Let's begin. ${STEPS[0].text}`);
      setStatus("running");
      run();
    } catch (err) {
      console.error(err);
      setStatus("idle");
      setInstruction("Could not start camera or load model.");
    }
  }

  function stop() {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    clearRestTimer();
    const v = videoRef.current;
    if (v?.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
    if (v) v.srcObject = null;
    setStatus("idle");
    setIsOk(false);
    setFaceDetected(false);
    setInstruction("Stopped. Tap Start to try again.");
  }

  function reset() {
    clearRestTimer();
    stepRef.current = 0;
    setStepIdx(0);
    setScore(0);
    setInstruction(STEPS[0].text);
    setIsOk(false);
    if (status === "done") run();
  }

  /* ---------------- Rest handling ---------------- */
  function startRest(nextIndex) {
    nextStepRef.current = nextIndex;
    setStatus("rest");
    setIsOk(false);
    setRestLeft(restSeconds);
    setInstruction(`Great job! Next: ${STEPS[nextIndex].text} in ${restSeconds} sec…`);
    speak(`Great job. Next, ${STEPS[nextIndex].text}, starting in ${restSeconds} seconds`);
    clearRestTimer();
    restTimerRef.current = setInterval(() => {
      setRestLeft((prev) => {
        const left = Math.max(0, prev - 1);
        setInstruction(`Great job! Next: ${STEPS[nextIndex].text} in ${left} sec…`);
        if (left <= 0) {
          clearRestTimer();
          // Advance and resume detection
          stepRef.current = nextStepRef.current;
          setStepIdx(stepRef.current);
          setStatus("running");
          setInstruction(STEPS[stepRef.current].text);
          speak(STEPS[stepRef.current].text);
        }
        return left;
      });
    }, 1000);
  }

  function clearRestTimer() {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
  }

  /* ---------------- Main loop ---------------- */
  async function run() {
    runningRef.current = true;
    let consec = 0;

    const tick = () => {
      if (!runningRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!video.videoWidth || !video.videoHeight) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Always draw the live video
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // If we're resting, show a big countdown overlay and skip detection
      if (status === "rest") {
        drawRestOverlay(ctx, `Next: ${STEPS[nextStepRef.current ?? stepRef.current + 1]?.text || ""}`, restLeft);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Run detection (sync API)
      try {
        const res = lmRef.current?.detectForVideo(video, performance.now());
        const lm = res?.faceLandmarks?.[0]; // normalized [0..1]
        let ok = false;

        if (lm?.length) {
          setFaceDetected(true);

          // normalized -> pixels
          const k = lm.map(p => ({ x: p.x * canvas.width, y: p.y * canvas.height }));

          drawGuides(ctx, k);                 // bounding box + helpers
          const m = computeMetrics(k);        // EAR / MAR / EB
          setMetrics(m);

          const currentStep = STEPS[stepRef.current] ?? STEPS[0];
          ok = checkStep(currentStep.id, m, {
            BLINK_EAR_MAX: blinkEAR,
            SMILE_MAR_MIN: smileMAR,
            BROWS_EB_MIN:  browsEB,
          });

          consec = ok ? consec + 1 : 0;
          if (!simpleMode) drawHUD(ctx, { m, step: currentStep.id, consec, needed: framesRequired });

          if (ok && consec >= framesRequired) {
            consec = 0;
            if (stepRef.current < STEPS.length - 1) {
              // Pause between tasks for elderly pacing
              startRest(stepRef.current + 1);
            } else {
              setInstruction("All done! 🎉");
              speak("All done. Great work!");
              setScore((s) => s + 3);
              setStatus("done");
              setIsOk(true);
              runningRef.current = false;
              cancelAnimationFrame(rafRef.current);
              return;
            }
          }
        } else {
          setFaceDetected(false);
          ctx.fillStyle = "rgba(255,0,0,0.12)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#900";
          ctx.font = "bold 20px system-ui";
          ctx.fillText("I can't see your face. Move closer and look at the camera.", 16, 36);
        }

        setIsOk(ok);
      } catch (err) {
        console.error("Face detection error:", err);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => () => { stop(); }, []); // cleanup

  useEffect(() => {
    stepRef.current = stepIdx;
    const nextInstruction = STEPS[stepIdx]?.text;
    if (nextInstruction) setInstruction(nextInstruction);
  }, [stepIdx]);

  /* ---------------- Calibration (open eyes) ---------------- */
  async function calibrate() {
    if (status !== "running") return;
    const samples = [];
    for (let i = 0; i < 40; i++) {
      const res = lmRef.current?.detectForVideo(videoRef.current, performance.now());
      const lm = res?.faceLandmarks?.[0];
      if (!lm) { await sleep(20); continue; }
      const canvas = canvasRef.current;
      const k = lm.map(p => ({ x: p.x * canvas.width, y: p.y * canvas.height }));
      const m = computeMetrics(k);
      if (m.EAR > 0.1) samples.push(m.EAR);
      await sleep(20);
    }
    if (samples.length) {
      const mean = samples.reduce((a,b)=>a+b,0) / samples.length;
      const thr = Number((mean * 0.72).toFixed(2));
      setBlinkEAR(thr);
      speak(`Calibrated blink threshold to ${thr.toFixed(2)}`);
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <main
      className="relative min-h-screen bg-[#f8f4f9] py-10 px-4 md:px-10 text-[#4b2f23]"
      suppressHydrationWarning
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 -right-10 h-64 w-64 rounded-full bg-[rgba(190,167,229,0.4)] blur-3xl" />
        <div className="absolute -bottom-32 -left-12 h-72 w-72 rounded-full bg-[rgba(255,214,175,0.4)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col space-y-8">
        <div className="flex flex-col items-start gap-3 text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#4b2f23] md:text-4xl">
            Simon Says
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-[#4b2f23] opacity-80">
            Take a mindful moment to wake up your facial muscles. Follow the friendly prompts,
            sip some tea if you like, and move at your own pace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={start}
            className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e]`}
          >
            Start
          </button>
          <button
            onClick={reset}
            className={`${BUTTON_BASE} bg-[#6b4b3e] text-white hover:bg-[#5a3f34] focus-visible:outline-[#6b4b3e]`}
          >
            Restart
          </button>
          <button
            onClick={stop}
            className={`${BUTTON_BASE} border border-[rgba(107,75,62,0.3)] bg-white text-[#6b4b3e] hover:bg-[#f4ece6] focus-visible:outline-[#6b4b3e]`}
          >
            Stop
          </button>
          <button
            onClick={calibrate}
            disabled={status !== "running" || !faceDetected}
            className={`${BUTTON_BASE} bg-[#BEA7E5] text-[#4b2f23] hover:bg-[#b497dd] focus-visible:outline-[#BEA7E5]`}
          >
            Calibrate (open eyes)
          </button>

          <div className="w-full rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/80 px-4 py-3 text-base text-[#4b2f23] shadow-sm md:ml-auto md:w-auto md:px-6">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#6b4b3e]"
                  checked={voiceOn}
                  onChange={(e) => setVoiceOn(e.target.checked)}
                />
                Voice prompts
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#6b4b3e]"
                  checked={simpleMode}
                  onChange={(e) => setSimpleMode(e.target.checked)}
                />
                Simple mode
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(190,167,229,0.3)] bg-white/90 p-6 shadow-sm">
          <div className="text-2xl font-semibold leading-snug text-[#4b2f23] md:text-3xl">
            <span className="opacity-70">Instruction:&nbsp;</span>
            <span className="whitespace-pre-line">{instruction}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-lg text-[#4b2f23]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,214,175,0.5)] px-4 py-1 font-semibold text-[#4b2f23]">
              Status:
              <span className="capitalize">{status}</span>
            </span>
            {status === "rest" && (
              <span className="rounded-full bg-white/80 px-4 py-1 text-base font-medium text-[#4b2f23]">
                Next step begins in {restLeft}s
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-[rgba(190,167,229,0.4)] px-4 py-1 font-semibold text-[#4b2f23]">
              Score:
              <span>{score}</span>
            </span>
          </div>
        </div>

        <div className="relative space-y-4 rounded-3xl border border-[rgba(107,75,62,0.15)] bg-white/85 p-4 shadow-lg md:p-6">
          <video ref={videoRef} className="hidden" playsInline />
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(107,75,62,0.2)] bg-[#1f1b16]">
            <canvas ref={canvasRef} className="h-full w-full opacity-95" />
            <div className="absolute top-5 right-5 text-6xl md:text-7xl drop-shadow-sm">
              {isOk ? <span className="text-[#6b4b3e]">✅</span> : <span className="text-[#BEA7E5]">❌</span>}
            </div>
          </div>

          {!simpleMode && (
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-6">
              <LV label="Face" value={faceDetected ? "Yes" : "No"} />
              <LV label="EAR" value={metrics.EAR.toFixed(3)} />
              <LV label="MAR" value={metrics.MAR.toFixed(3)} />
              <LV label="EB" value={metrics.EB.toFixed(1)} />
              <LV label="Blink<th" value={blinkEAR.toFixed(2)} />
              <LV label="Frames" value={String(framesRequired)} />
            </div>
          )}
        </div>

        <details className="rounded-2xl border border-[rgba(107,75,62,0.15)] bg-white/85 p-5 shadow-sm">
          <summary className="cursor-pointer text-lg font-semibold text-[#4b2f23]">
            Settings (optional)
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Slider
              label={`Blink EAR < ${blinkEAR.toFixed(2)}`}
              min="0.05"
              max="0.50"
              step="0.01"
              value={blinkEAR}
              onChange={setBlinkEAR}
            />
            <Slider
              label={`Smile MAR > ${smileMAR.toFixed(2)}`}
              min="0.20"
              max="0.70"
              step="0.01"
              value={smileMAR}
              onChange={setSmileMAR}
            />
            <Slider
              label={`Brows EB  > ${browsEB.toFixed(0)} px`}
              min="10"
              max="60"
              step="1"
              value={browsEB}
              onChange={setBrowsEB}
            />
            <Slider
              label={`Frames needed: ${framesRequired}`}
              min="2"
              max="12"
              step="1"
              value={framesRequired}
              onChange={setFramesRequired}
            />
            <Slider
              label={`Rest between steps: ${restSeconds}s`}
              min="0"
              max="10"
              step="1"
              value={restSeconds}
              onChange={setRestSeconds}
            />
          </div>
        </details>
      </div>
    </main>
  );
}

/* ---------------- helpers ---------------- */

// tiny speech helper (elder-friendly prompts)
function speak(text) {
  try {
    if (!window.speechSynthesis) return;
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.0;
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* no-op */ }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function ensureVideoReady(video) {
  const start = performance.now();
  while ((!video.videoWidth || !video.videoHeight || video.readyState < 2) &&
         performance.now() - start < 6000) {
    await sleep(50);
  }
  if (!video.videoWidth || !video.videoHeight) throw new Error("Video has zero dimensions");
}

function LV({ label, value }) {
  return (
    <div className="rounded-xl border border-[#c49e85]/50 bg-[rgba(255,214,175,0.4)] px-3 py-2 text-[#4b2f23]">
      <div className="text-[11px] uppercase tracking-wide text-[#4b2f23] opacity-60">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}
function Slider({ label, value, onChange, ...rest }) {
  return (
    <label className="text-sm text-[#4b2f23]">
      <div className="mb-1 font-medium text-[#4b2f23] opacity-80">{label}</div>
      <input
        type="range"
        className="w-full accent-[#6b4b3e]"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        {...rest}
      />
    </label>
  );
}

// Bounding box + simple guides
function drawGuides(ctx, k) {
  if (!k?.length) return;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for (const p of k) { if (!p) continue; minX=Math.min(minX,p.x); minY=Math.min(minY,p.y); maxX=Math.max(maxX,p.x); maxY=Math.max(maxY,p.y); }
  ctx.lineWidth=3; ctx.strokeStyle="rgba(220,0,70,0.9)";
  ctx.strokeRect(minX-8,minY-8,(maxX-minX)+16,(maxY-minY)+16);

  const L={top:159,bot:145,left:33,right:133}, R={top:386,bot:374,left:362,right:263}, M={top:13,bot:14,left:61,right:291};
  const line=(a,b,col="rgba(0,120,255,0.9)")=>{
    if(!k[a]||!k[b]) return; ctx.strokeStyle=col; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(k[a].x,k[a].y); ctx.lineTo(k[b].x,k[b].y); ctx.stroke();
  };
  line(L.left,L.right); line(L.top,L.bot);
  line(R.left,R.right); line(R.top,R.bot);
  line(M.left,M.right); line(M.top,M.bot);
}

// Elder-friendly rest overlay
function drawRestOverlay(ctx, nextText, secondsLeft) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.fillStyle = "rgba(107,75,62,0.68)";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = PALETTE.lightBrown;
  ctx.textAlign = "center";
  ctx.font = "bold 34px system-ui";
  ctx.fillText("Take a cozy pause", w / 2, h / 2 - 30);
  ctx.fillStyle = "#fff";
  ctx.font = "24px system-ui";
  ctx.fillText(`${nextText}`, w / 2, h / 2 + 4);
  ctx.fillStyle = PALETTE.lavender;
  ctx.font = "bold 60px system-ui";
  ctx.fillText(`${secondsLeft}s`, w / 2, h / 2 + 80);
}

// Metrics (EAR / MAR / EB)
function computeMetrics(k) {
  const L_TOP=159, L_BOT=145, L_L=33, L_R=133;
  const R_TOP=386, R_BOT=374, R_L=362, R_R=263;
  const leftEAR  = ratio(k[L_TOP], k[L_BOT], k[L_L], k[L_R]);
  const rightEAR = ratio(k[R_TOP], k[R_BOT], k[R_L], k[R_R]);
  const EAR = (leftEAR + rightEAR) / 2;

  const M_TOP=13, M_BOT=14, M_L=61, M_R=291;
  const MAR = ratio(k[M_TOP], k[M_BOT], k[M_L], k[M_R]);

  const LBROW=70, RBROW=300;
  const L_EYE_C = mid(k[L_L], k[L_R]);
  const R_EYE_C = mid(k[R_L], k[R_R]);
  const EB = (dist(k[LBROW], L_EYE_C) + dist(k[RBROW], R_EYE_C)) / 2;

  return { EAR, MAR, EB };
}
function ratio(top, bot, left, right) {
  if (!top||!bot||!left||!right) return 0;
  const v = dist(top, bot), h = dist(left, right);
  return h ? v / h : 0;
}
function mid(a,b){ return (!a||!b) ? {x:0,y:0} : { x:(a.x+b.x)/2, y:(a.y+b.y)/2 }; }
function dist(a,b){ if(!a||!b) return 0; const dx=a.x-b.x, dy=a.y-b.y; return Math.hypot(dx,dy); }
function checkStep(id, { EAR, MAR, EB }, t) {
  if (id === "blink") return EAR > 0 && EAR < t.BLINK_EAR_MAX;
  if (id === "smile") return MAR > t.SMILE_MAR_MIN;
  if (id === "brows") return EB  > t.BROWS_EB_MIN;
  return false;
}
function drawHUD(ctx, { m, step, consec, needed }) {
  const text = `Step: ${step} | EAR ${m.EAR.toFixed(2)}  MAR ${m.MAR.toFixed(2)}  EB ${m.EB.toFixed(0)} | ${consec}/${needed}`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(8, 8, Math.max(260, text.length*7.2), 30);
  ctx.fillStyle = "#000";
  ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(text, 14, 28);
}

/* Disable SSR to avoid hydration mismatches */
export default dynamic(() => Promise.resolve(Page), { ssr: false });
