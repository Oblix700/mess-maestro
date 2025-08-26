import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates which day of the 28-day cycle a given date falls on.
 * @param date The date to calculate the cycle day for.
 * @returns The day number (1-28) in the cycle.
 */
export function getDayOf28DayCycle(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1); // January 1st of the given year
  const diffTime = Math.abs(date.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = (diffDays % 28) + 1;
  return cycleDay;
}
