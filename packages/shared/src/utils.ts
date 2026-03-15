import type { Rect } from "./types";

const idCounters = new Map<string, number>();

export function generateId(prefix = "id"): string {
  const nextValue = (idCounters.get(prefix) ?? 0) + 1;
  idCounters.set(prefix, nextValue);

  return `${prefix}_${nextValue}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function cloneRect(rect: Rect): Rect {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  };
}

export function roundRect(rect: Rect, precision = 2): Rect {
  return {
    x: roundTo(rect.x, precision),
    y: roundTo(rect.y, precision),
    width: roundTo(rect.width, precision),
    height: roundTo(rect.height, precision)
  };
}
