import type { NoteShape } from '../types';

export interface ShapeDefinition {
  id: NoteShape;
  label: string;
  emoji: string;
  containerClass: string;
}

export const NOTE_SHAPES: ShapeDefinition[] = [
  {
    id: 'square',
    label: 'Square Classic',
    emoji: '🟨',
    containerClass: 'rounded-xl',
  },
  {
    id: 'rounded',
    label: 'Soft Pebble',
    emoji: '🫧',
    containerClass: 'rounded-3xl',
  },
  {
    id: 'circle',
    label: 'Circle Memo',
    emoji: '🟡',
    containerClass: 'rounded-full aspect-square flex flex-col justify-center items-center text-center p-6',
  },
  {
    id: 'folded',
    label: 'Folded Corner',
    emoji: '📄',
    containerClass: 'rounded-xl [clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%)] relative before:absolute before:bottom-0 before:right-0 before:w-5 before:h-5 before:bg-black/15 before:rounded-tl-md',
  },
  {
    id: 'tape',
    label: 'Washi Tape',
    emoji: '🩹',
    containerClass: 'rounded-xl pt-6 relative before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:w-16 before:h-6 before:bg-amber-100/90 before:border before:border-amber-300/60 before:shadow-xs before:rotate-[-1.5deg] before:backdrop-blur-xs',
  },
  {
    id: 'tag',
    label: 'Luggage Tag',
    emoji: '🏷️',
    containerClass: 'rounded-b-2xl pt-5 relative before:absolute before:top-2 before:left-1/2 before:-translate-x-1/2 before:w-3.5 before:h-3.5 before:rounded-full before:bg-white before:border before:border-black/20 before:shadow-inner [clip-path:polygon(20px_0,calc(100%-20px)_0,100%_25px,100%_100%,0_100%,0_25px)]',
  },
  {
    id: 'cloud',
    label: 'Dream Cloud',
    emoji: '☁️',
    containerClass: 'rounded-[36px_36px_36px_12px] shadow-lg',
  },
  {
    id: 'badge',
    label: 'Award Badge',
    emoji: '🏵️',
    containerClass: 'rounded-[28px] ring-2 ring-dashed ring-black/20 shadow-md',
  },
  {
    id: 'stamp',
    label: 'Postage Stamp',
    emoji: '💌',
    containerClass: 'rounded-md border-4 border-dashed border-black/15 shadow-md',
  },
  {
    id: 'arch',
    label: 'Tombstone Arch',
    emoji: '🏛️',
    containerClass: 'rounded-t-[70px] rounded-b-xl pt-6 shadow-md',
  },
];
