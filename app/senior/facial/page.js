"use client";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

/* ---------------- UI / thresholds ---------------- */
const STEPS = [
  { id: "blink", text: "Blink both eyes" },
  { id: "smile", text: "Smile 🙂" },
  { id: "brows", text: "Raise your eyebrows" },
];
const DEFAULTS = {
  BLINK_EAR_MAX: 0.30,   // Looser default; use Calibrate to personalize
  SMILE_MAR_MIN: 0.35,
  BROWS_EB_MIN: 22,
  FRAMES_REQUIRED: 3,
};

function Page() {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lmRef = useRef(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  // State
  const [status, setStatus] = useState("idle");
  const [instruction, setInstruction] = useState("Click Start and look at the camera");
  const [stepIdx, setStepIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isOk, setIsOk] = useState(false);

  const [metrics, setMetrics] = useState({ EAR: 0, MAR: 0, EB: 0 });
  const [faceDetected, setFaceDetected] = useState(false);

  const [blinkEAR, setBlinkEAR] = useState(DEFAULTS.BLINK_EAR_MAX);
  const [smileMAR, setSmileMAR] = useState(DEFAULTS.SMILE_MAR_MIN);
  const [browsEB,  setBrowsEB]  = useState(DEFAULTS.BROWS_EB_MIN);
  const [framesRequired, setFramesRequired] = useState(DEFAULTS.FRAMES_REQUIRED);

  /* -------------- Start: camera + model -------------- */
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

      // WASM runtime files
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10/wasm"
      );

      // Face Landmarker (model served from GCS — NOT from the wasm folder)
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

      setStatus("ready");
      setInstruction(STEPS[0].text);
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
    const v = videoRef.current;
    if (v?.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
    if (v) v.srcObject = null;
    setStatus("idle");
    setIsOk(false);
    setFaceDetected(false);
    setInstruction("Stopped. Click Start to try again.");
  }

  function reset() {
    setStepIdx(0);
    setScore(0);
    setInstruction(STEPS[0].text);
    setIsOk(false);
  }

  /* ---------------- Main loop ---------------- */
  async function run() {
    runningRef.current = true;
    setStatus("running");
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const res = lmRef.current?.detectForVideo(video, performance.now());
      const lm = res?.faceLandmarks?.[0]; // normalized [0..1]

      let ok = false;

      if (lm?.length) {
        setFaceDetected(true);

        // Convert to pixel coords
        const k = lm.map(p => ({ x: p.x * canvas.width, y: p.y * canvas.height }));

        drawGuides(ctx, k);                             // bounding box + eye/mouth guides
        const m = computeMetrics(k);                    // EAR / MAR / EB
        setMetrics(m);

        ok = checkStep(STEPS[stepIdx].id, m, {
          BLINK_EAR_MAX: blinkEAR,
          SMILE_MAR_MIN: smileMAR,
          BROWS_EB_MIN:  browsEB,
        });

        consec = ok ? consec + 1 : 0;
        drawHUD(ctx, { m, step: STEPS[stepIdx].id, consec, needed: framesRequired });

        if (ok && consec >= framesRequired) {
          consec = 0;
          if (stepIdx < STEPS.length - 1) {
            setStepIdx(i => i + 1);
            setInstruction(STEPS[stepIdx + 1].text);
          } else {
            setInstruction("Great job! Session complete.");
            setScore(s => s + 3);
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
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#900"; ctx.font = "bold 18px system-ui";
        ctx.fillText("No face detected — move closer / add light", 16, 32);
      }

      setIsOk(ok);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => () => stop(), []); // cleanup on unmount

  /* -------------- Calibrate blink (open eyes) -------------- */
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
      const thr = Number((mean * 0.72).toFixed(2)); // 72% of open-eye EAR
      setBlinkEAR(thr);
    }
  }

  return (
    <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-4" suppressHydrationWarning>
      <h1 className="text-2xl font-bold">Facial Exercise (MediaPipe)</h1>

      <div className="flex gap-2 items-center flex-wrap">
        <button onClick={start}  className="rounded-full border px-4 h-10">Start</button>
        <button onClick={reset}  className="rounded-full border px-4 h-10">Restart</button>
        <button onClick={stop}   className="rounded-full border px-4 h-10">Stop</button>
        <button
          onClick={calibrate}
          className="rounded-full border px-4 h-10"
          disabled={status!=="running" || !faceDetected}
          title="Look at the camera with eyes open"
        >
          Calibrate (open eyes)
        </button>

        <div className="ml-auto text-sm grid grid-cols-4 gap-2">
          <LabelValue label="Face" value={faceDetected ? "Yes" : "No"} />
          <LabelValue label="EAR"  value={metrics.EAR.toFixed(3)} />
          <LabelValue label="MAR"  value={metrics.MAR.toFixed(3)} />
          <LabelValue label="EB"   value={metrics.EB.toFixed(1)} />
        </div>
      </div>

      <div className="rounded-xl border p-3 relative">
        <div className="text-lg mb-2">
          <b>Status:</b> {status} &nbsp; | &nbsp; <b>Instruction:</b> {instruction} &nbsp; | &nbsp; <b>Score:</b> {score}
        </div>

        <video ref={videoRef} className="hidden" playsInline />
        <div className="relative">
          <canvas ref={canvasRef} className="w-full rounded-lg border" />
          <div className="absolute top-3 right-3 text-5xl select-none">
            {isOk ? <span className="text-green-600">✅</span> : <span className="text-red-600">❌</span>}
          </div>
        </div>

        <div className="text-sm opacity-70 mt-2">
          If “Face: No”, move closer and add front lighting. This version does <b>not</b> use TensorFlow.
        </div>
      </div>

      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer font-medium">Thresholds</summary>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <Slider label={`Blink EAR < ${blinkEAR.toFixed(2)}`} min="0.05" max="0.50" step="0.01" value={blinkEAR} onChange={setBlinkEAR}/>
          <Slider label={`Smile MAR > ${smileMAR.toFixed(2)}`} min="0.20" max="0.70" step="0.01" value={smileMAR} onChange={setSmileMAR}/>
          <Slider label={`Brows EB  > ${browsEB.toFixed(0)} px`} min="10" max="60" step="1" value={browsEB} onChange={setBrowsEB}/>
          <Slider label={`Frames needed: ${framesRequired}`} min="2" max="12" step="1" value={framesRequired} onChange={setFramesRequired}/>
        </div>
      </details>
    </main>
  );
}

/* ---------------- helpers ---------------- */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function ensureVideoReady(video) {
  const start = performance.now();
  while ((!video.videoWidth || !video.videoHeight || video.readyState < 2) &&
         performance.now() - start < 6000) {
    await sleep(50);
  }
  if (!video.videoWidth || !video.videoHeight) throw new Error("Video has zero dimensions");
}

function LabelValue({ label, value }) {
  return (
    <div className="rounded-lg border px-2 py-1">
      <div className="text-[11px] opacity-60">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  );
}
function Slider({ label, value, onChange, ...rest }) {
  return (
    <label className="text-sm">
      {label}
      <input type="range" className="w-full" value={value} onChange={(e)=>onChange(Number(e.target.value))} {...rest}/>
    </label>
  );
}

// Draw bounding box + guides for the key indices we use
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

// Metrics used for steps
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
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(8, 8, Math.max(260, text.length*7.2), 28);
  ctx.fillStyle = "#000";
  ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(text, 14, 27);
}

/* Disable SSR to avoid hydration mismatches */
export default dynamic(() => Promise.resolve(Page), { ssr: false });
