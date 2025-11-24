import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips markdown code block wrappers from text.
 * Handles formats like ```html, ```HTML, ```, etc.
 * 
 * @param text - The text that may contain markdown code block wrappers
 * @returns The text with markdown code block wrappers removed
 */
export function stripMarkdownCodeBlocks(text: string): string {
  let cleaned = text.trim();
  
  // Remove opening code block markers (```html, ```HTML, ```, etc.)
  cleaned = cleaned.replace(/^```[a-zA-Z]*\s*\n?/gm, '');
  // Remove closing code block markers
  cleaned = cleaned.replace(/\n?```\s*$/gm, '');
  // Handle inline code blocks (less common but possible)
  cleaned = cleaned.replace(/```[a-zA-Z]*\s*/g, '');
  cleaned = cleaned.replace(/\s*```/g, '');
  
  return cleaned.trim();
}
