import { CardColor, ColorDefinition } from '../types';

export const CARD_COLORS: Record<CardColor, ColorDefinition> = {
  yellow: {
    bg: 'bg-[#fef08a]',
    darkBg: 'dark:bg-[#fde047]',
    border: 'border-[#facc15]',
    darkBorder: 'dark:border-[#eab308]',
    header: 'bg-[#fde047]',
    dot: 'bg-amber-500',
    badge: 'bg-amber-200 text-amber-950 font-bold',
  },
  pink: {
    bg: 'bg-[#fbcfe8]',
    darkBg: 'dark:bg-[#f472b6]',
    border: 'border-[#f472b6]',
    darkBorder: 'dark:border-[#ec4899]',
    header: 'bg-[#f472b6]',
    dot: 'bg-pink-600',
    badge: 'bg-pink-200 text-pink-950 font-bold',
  },
  blue: {
    bg: 'bg-[#bae6fd]',
    darkBg: 'dark:bg-[#7dd3fc]',
    border: 'border-[#38bdf8]',
    darkBorder: 'dark:border-[#0284c7]',
    header: 'bg-[#7dd3fc]',
    dot: 'bg-sky-600',
    badge: 'bg-sky-200 text-sky-950 font-bold',
  },
  purple: {
    bg: 'bg-[#e9d5ff]',
    darkBg: 'dark:bg-[#d8b4fe]',
    border: 'border-[#c084fc]',
    darkBorder: 'dark:border-[#a855f7]',
    header: 'bg-[#d8b4fe]',
    dot: 'bg-purple-600',
    badge: 'bg-purple-200 text-purple-950 font-bold',
  },
  green: {
    bg: 'bg-[#bbf7d0]',
    darkBg: 'dark:bg-[#86efac]',
    border: 'border-[#4ade80]',
    darkBorder: 'dark:border-[#22c55e]',
    header: 'bg-[#86efac]',
    dot: 'bg-emerald-600',
    badge: 'bg-emerald-200 text-emerald-950 font-bold',
  },
  peach: {
    bg: 'bg-[#fed7aa]',
    darkBg: 'dark:bg-[#fdba74]',
    border: 'border-[#fb923c]',
    darkBorder: 'dark:border-[#f97316]',
    header: 'bg-[#fdba74]',
    dot: 'bg-orange-600',
    badge: 'bg-orange-200 text-orange-950 font-bold',
  },
};

export const COLOR_OPTIONS: { id: CardColor; label: string; hex: string }[] = [
  { id: 'yellow', label: 'Yellow', hex: '#fef08a' },
  { id: 'pink', label: 'Pink', hex: '#fbcfe8' },
  { id: 'blue', label: 'Blue', hex: '#bae6fd' },
  { id: 'purple', label: 'Purple', hex: '#e9d5ff' },
  { id: 'green', label: 'Green', hex: '#bbf7d0' },
  { id: 'peach', label: 'Peach', hex: '#fed7aa' },
];
