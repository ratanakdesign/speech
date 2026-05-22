export interface Point {
  x: number;
  y: number;
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalise(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  return values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
}

export function stdDev(values: number[]): number {
  return Math.sqrt(variance(values));
}

export function stabilityFromHistory(values: number[]): number {
  if (values.length < 3) return 100;
  const sd = stdDev(values);
  // sd of 0.05 in normalised metric space → 50% stability
  return clamp(100 - sd * 400, 0, 100);
}
