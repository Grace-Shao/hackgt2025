"use client";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  { id: "blink", text: "Blink both eyes" },
  { id: "smile", text: "Smile 🙂" },
  { id: "brows", text: "Raise your eyebrows" },
];

const DEFAULTS = {
  BLINK_EAR_MAX: 0.20,
  SMILE_MAR_MIN: 0.35,
  BROWS_EB_MIN: 22,
  FRAMES_REQUIRED: 10,
};

export default function FacialWithTF() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(0);

  const [status, setStatus] = useState("idle");
  const [instruction, setInstruction] = useState("Click Start and look at the camera");
  const [stepIdx, setStepIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [metrics, setMetrics] = useState({ EAR: 0, MAR: 0, EB: 0 });

  const [blinkEAR, setBlinkEAR] = useState(DEFAULTS.BLINK_EAR_MAX);
  const [smileMAR, setSmileMAR] = useState(DEFAULTS.SMILE_MAR_MIN);
  const [browsEB, setBrowsEB]   = useState(DEFAULTS.BROWS_EB_MIN);
  const [framesRequired, setFramesRequired] = useState(DEFAULTS.FRAMES_REQUIRED);

  const okRef = useRef(false);
  const [isOk, setIsOk] = useState(false);

  async function start() {
    if (status === "running") return;
    setStatus("loading");

    try {
      const tf = await import("@tensorflow/tfjs");
      const hasWebGL = await import("@tensorflow/tfjs-backend-webgl").then(() => true).catch(() => false);
      if (hasWebGL) await tf.setBackend("webgl");
      await tf.ready();

      // 🎥 Camera with explicit size so it never starts at 0×0
      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      // Wait until the video really has dimensions
      await ensureVideoReady(video);

      // Size the canvas
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // 👇 New API
      const face = await import("@tensorflow-models/face-landmarks-detection");
      const model = face.SupportedModels.MediaPipeFaceMesh;
      detectorRef.current = await face.createDetector(model, {
        runtime: "tfjs",
        refineLandmarks: true,
        maxFaces: 1,
      });

      setStatus("ready");
      setInstruction(STEPS[0].text);
      run();
    } catch (e) {
      console.error(e);
      setInstruction("Camera or model failed to load. Check permissions.");
      setStatus("idle");
    }
  }

  function stop() {
    cancelAnimationFrame(rafRef.current);
    const v = videoRef.current;
    const s = v?.srcObject;
    if (s) s.getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
    setStatus("idle");
    setInstruction("Stopped. Click Start to try again.");
    setIsOk(false);
  }

  async function run() {
    setStatus("running");
    let consec = 0;

    const tick = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const detector = detectorRef.current;

      // ⛑ Guard: if video momentarily reports 0×0 (tab switch, etc.), skip this frame
      if (!video.videoWidth || !video.videoHeight) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let faces = [];
      try {
        faces = await detector.estimateFaces(video, { flipHorizontal: true });
      } catch (err) {
        // Handle rare race where backend sees 0×0 texture
        if (/texture size.*0x0/i.test(String(err))) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        throw err;
      }

      let okNow = false;

      if (faces?.length) {
        const k = faces[0].keypoints;
        drawOverlay(ctx, k);

        const m = computeMetrics(k);
        setMetrics(m);

        okNow = checkStep(
          STEPS[stepIdx].id,
          m,
          { BLINK_EAR_MAX: blinkEAR, SMILE_MAR_MIN: smileMAR, BROWS_EB_MIN: browsEB }
        );

        consec = okNow ? consec + 1 : 0;
        drawHUD(ctx, { m, step: STEPS[stepIdx].id, consec, needed: framesRequired });

        if (okNow && consec >= framesRequired) {
          consec = 0;
          if (stepIdx < STEPS.length - 1) {
            setStepIdx((i) => i + 1);
            setInstruction(STEPS[stepIdx + 1].text);
          } else {
            setInstruction("Great job! Session complete.");
            setScore((s) => s + 3);
            setStatus("done");
            requestAnimationFrame(() => setIsOk(true)); // final ✅
            return;
          }
        }
      } else {
        okNow = false; // no face
      }

      if (okRef.current !== okNow) {
        okRef.current = okNow;
        setIsOk(okNow);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => () => stop(), []); // cleanup on unmount

  function reset() {
    setStepIdx(0);
    setScore(0);
    setInstruction(STEPS[0].text);
    setIsOk(false);
    if (status === "done") run();
  }

  return (
    <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Facial Exercise (TensorFlow.js)</h1>
      <div className="flex gap-2 items-center">
        <button onClick={start} className="rounded-full border px-4 h-10">Start</button>
        <button onClick={reset} className="rounded-full border px-4 h-10">Restart</button>
        <button onClick={stop}  className="rounded-full border px-4 h-10">Stop</button>
        <div className="ml-auto text-sm grid grid-cols-3 gap-2">
          <LabelValue label="EAR" value={metrics.EAR.toFixed(3)} />
          <LabelValue label="MAR" value={metrics.MAR.toFixed(3)} />
          <LabelValue label="EB"  value={metrics.EB.toFixed(1)} />
        </div>
      </div>

      <div className="rounded-xl border p-3 relative">
        <div className="text-lg mb-2">
          <b>Status:</b> {status} &nbsp; | &nbsp; <b>Instruction:</b> {instruction} &nbsp; | &nbsp; <b>Score:</b> {score}
        </div>

        <video ref={videoRef} className="hidden" playsInline />
        <div className="relative">
          <canvas ref={canvasRef} className="w-full rounded-lg border" />
          <div className="absolute top-3 right-3 text-5xl select-none" aria-live="polite" aria-atomic="true">
            {isOk ? <span className="text-green-600">✅</span> : <span className="text-red-600">❌</span>}
          </div>
        </div>

        <div className="text-sm opacity-70 mt-2">
          Hold the ✅ for {framesRequired} frames to advance. Processing is local; no video is uploaded.
        </div>
      </div>

      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer font-medium">Calibrate thresholds</summary>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <Slider label={`Blink EAR < ${blinkEAR.toFixed(2)}`} min="0.05" max="0.40" step="0.01" value={blinkEAR} onChange={setBlinkEAR}/>
          <Slider label={`Smile MAR > ${smileMAR.toFixed(2)}`} min="0.20" max="0.70" step="0.01" value={smileMAR} onChange={setSmileMAR}/>
          <Slider label={`Brows EB  > ${browsEB.toFixed(0)} px`} min="10" max="60" step="1" value={browsEB} onChange={setBrowsEB}/>
          <Slider label={`Frames needed: ${framesRequired}`} min="3" max="20" step="1" value={framesRequired} onChange={setFramesRequired}/>
        </div>
      </details>
    </main>
  );
}

/* ---------- helpers ---------- */

// Wait until the video element has non-zero dimensions and current data
async function ensureVideoReady(video) {
  const start = performance.now();
  while (
    (!video.videoWidth || !video.videoHeight || video.readyState < 2) &&
    performance.now() - start < 5000
  ) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("Video has zero dimensions");
  }
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

/* ---------- math/drawing ---------- */
function drawOverlay(ctx, k) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  const pts = [33,133,362,263,159,145,386,374,61,291,13,14,70,300];
  pts.forEach(i => { const p = k[i]; if (!p) return; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.stroke(); });
}
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
