import React, { useRef, useEffect } from "react";
import { LM, type NormalizedLandmark } from "../lib/scoring";

interface Props {
  landmarks: NormalizedLandmark[];
  score: number;
}

function drawOverlay(
  canvas: HTMLCanvasElement,
  landmarks: NormalizedLandmark[],
  score: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const w = rect.width * window.devicePixelRatio;
  const h = rect.height * window.devicePixelRatio;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  ctx.clearRect(0, 0, rect.width, rect.height);

  const toX = (x: number) => x * rect.width;
  const toY = (y: number) => y * rect.height;

  const color = score >= 60 ? "#10B981" : "#6366F1";
  const alpha = 0.75;

  // Draw outer lip outline
  const outerLip = LM.OUTER_LIP;
  ctx.beginPath();
  ctx.moveTo(toX(landmarks[outerLip[0]].x), toY(landmarks[outerLip[0]].y));
  for (let i = 1; i < outerLip.length; i++) {
    const lm = landmarks[outerLip[i]];
    if (lm) ctx.lineTo(toX(lm.x), toY(lm.y));
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = alpha;
  ctx.stroke();

  // Draw inner lip outline
  const innerLip = LM.INNER_LIP;
  ctx.beginPath();
  ctx.moveTo(toX(landmarks[innerLip[0]].x), toY(landmarks[innerLip[0]].y));
  for (let i = 1; i < innerLip.length; i++) {
    const lm = landmarks[innerLip[i]];
    if (lm) ctx.lineTo(toX(lm.x), toY(lm.y));
  }
  ctx.stroke();

  // Draw key landmark dots
  const keyPoints = [
    LM.LEFT_CORNER,
    LM.RIGHT_CORNER,
    LM.UPPER_LIP_CENTER_INNER,
    LM.LOWER_LIP_CENTER_INNER,
  ];

  keyPoints.forEach((idx) => {
    const lm = landmarks[idx];
    if (!lm) return;
    ctx.beginPath();
    ctx.arc(toX(lm.x), toY(lm.y), 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

export function LandmarkOverlay({ landmarks, score }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !landmarks?.length) return;
    drawOverlay(canvasRef.current, landmarks, score);
  }, [landmarks, score]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ transform: "scaleX(-1)" }}
    />
  );
}
