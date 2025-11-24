import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripMarkdownCodeBlocks(text: string): string {
  let cleaned = text.trim();
  
  cleaned = cleaned.replace(/^```[a-zA-Z]*\s*\n?/gm, '');
  cleaned = cleaned.replace(/\n?```\s*$/gm, '');
  cleaned = cleaned.replace(/```[a-zA-Z]*\s*/g, '');
  cleaned = cleaned.replace(/\s*```/g, '');
  
  return cleaned.trim();
}
