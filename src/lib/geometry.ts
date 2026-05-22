export interface Point {
  x: number;
  y: number;
  z?: number;
}

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export interface MouthMetrics {
  mouthWidth: number;
  mouthOpening: number;
  roundnessRatio: number;
  symmetryScore: number;
  faceDetected: boolean;
}

// MediaPipe Face Landmarker 478-point model landmark indices
const LANDMARKS = {
  upperLip: 13,
  lowerLip: 14,
  leftCorner: 61,
  rightCorner: 291,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  noseTip: 1,
};

export function computeMouthMetrics(landmarks: Point[]): MouthMetrics {
  if (!landmarks || landmarks.length < 468) {
    return { mouthWidth: 0, mouthOpening: 0, roundnessRatio: 0, symmetryScore: 0, faceDetected: false };
  }

  const upperLip = landmarks[LANDMARKS.upperLip];
  const lowerLip = landmarks[LANDMARKS.lowerLip];
  const leftCorner = landmarks[LANDMARKS.leftCorner];
  const rightCorner = landmarks[LANDMARKS.rightCorner];
  const leftEye = landmarks[LANDMARKS.leftEyeOuter];
  const rightEye = landmarks[LANDMARKS.rightEyeOuter];
  const nose = landmarks[LANDMARKS.noseTip];

  // Inter-ocular distance for normalisation
  const iod = distance(leftEye, rightEye);
  if (iod < 0.001) return { mouthWidth: 0, mouthOpening: 0, roundnessRatio: 0, symmetryScore: 0, faceDetected: false };

  const rawWidth = distance(leftCorner, rightCorner);
  const rawOpening = distance(upperLip, lowerLip);

  const mouthWidth = rawWidth / iod;
  const mouthOpening = rawOpening / iod;
  const roundnessRatio = mouthOpening / Math.max(mouthWidth, 0.001);

  // Symmetry: compare each corner's distance to the face midpoint (nose)
  const leftDist = distance(leftCorner, nose);
  const rightDist = distance(rightCorner, nose);
  const maxDist = Math.max(leftDist, rightDist, 0.001);
  const asymmetry = Math.abs(leftDist - rightDist) / maxDist;
  const symmetryScore = Math.max(0, Math.min(100, (1 - asymmetry * 3) * 100));

  return { mouthWidth, mouthOpening, roundnessRatio, symmetryScore, faceDetected: true };
}
