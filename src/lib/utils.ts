import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates which day of the 28-day cycle a given date falls on based on a fixed reference point.
 * This ensures a continuous cycle across years.
 * @param date The date to calculate the cycle day for.
 * @returns The day number (1-28) in the cycle.
 */
export function getDayOf28DayCycle(date: Date): number {
  // Reference date: Monday, December 30, 2024 is defined as Day 1 of a cycle.
  // We use UTC to avoid timezone issues.
  const referenceDate = new Date(Date.UTC(2024, 11, 30)); // Month is 0-indexed (11 = December)

  // Normalize the input date to UTC midnight to ensure a clean day-based calculation.
  const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // Calculate the difference in milliseconds and then convert to days.
  const diffTime = targetDate.getTime() - referenceDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Calculate the cycle day using modulo arithmetic.
  // The result of `diffDays % 28` can be negative, so we add 28 to handle dates before the reference.
  const cycleDay = ((diffDays % 28) + 28) % 28;

  // Return the day, ensuring it's 1-indexed (1-28 instead of 0-27).
  return cycleDay + 1;
}