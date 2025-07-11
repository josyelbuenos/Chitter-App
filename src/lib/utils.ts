import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDirectChatId = (id1: string, id2: string): string => {
  if (!id1 || !id2) return '';
  return [id1, id2].sort().join('_');
};
