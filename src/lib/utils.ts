import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MathUtils, type EulerOrder } from "three";

export type Position = [x: number, y: number, z: number];
export type Rotation = [x: number, y: number, z: number, order: EulerOrder];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trimString(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
}

export function degreesToEuler(xDeg: number, yDeg: number, zDeg: number): Rotation {
  const xRad = MathUtils.degToRad(xDeg);
  const yRad = MathUtils.degToRad(yDeg);
  const zRad = MathUtils.degToRad(zDeg);
  return [xRad, yRad, zRad, "XYZ"];
}
