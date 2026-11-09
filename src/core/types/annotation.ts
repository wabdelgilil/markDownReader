/**
 * Domain Type Definitions for Document Highlights & Annotations
 */

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export interface AnnotationRangeInfo {
  prefix?: string;
  suffix?: string;
  occurrenceIndex?: number;
}

export interface Annotation {
  id: string;
  docId: string;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: number;
  updatedAt: number;
  rangeInfo?: AnnotationRangeInfo;
}

export interface AnnotationColorMeta {
  id: HighlightColor;
  name: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  hex: string;
}

export const HIGHLIGHT_PALETTE: Record<HighlightColor, AnnotationColorMeta> = {
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    bgClass: 'bg-yellow-300/35 hover:bg-yellow-300/50 dark:bg-yellow-400/25 dark:hover:bg-yellow-400/35',
    borderClass: 'border-yellow-400',
    badgeClass: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-300 border-yellow-400/40',
    hex: '#eab308',
  },
  green: {
    id: 'green',
    name: 'Green',
    bgClass: 'bg-emerald-300/35 hover:bg-emerald-300/50 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/35',
    borderClass: 'border-emerald-400',
    badgeClass: 'bg-emerald-400/20 text-emerald-600 dark:text-emerald-300 border-emerald-400/40',
    hex: '#10b981',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    bgClass: 'bg-sky-300/35 hover:bg-sky-300/50 dark:bg-sky-400/25 dark:hover:bg-sky-400/35',
    borderClass: 'border-sky-400',
    badgeClass: 'bg-sky-400/20 text-sky-600 dark:text-sky-300 border-sky-400/40',
    hex: '#0ea5e9',
  },
  pink: {
    id: 'pink',
    name: 'Pink',
    bgClass: 'bg-rose-300/35 hover:bg-rose-300/50 dark:bg-rose-400/25 dark:hover:bg-rose-400/35',
    borderClass: 'border-rose-400',
    badgeClass: 'bg-rose-400/20 text-rose-600 dark:text-rose-300 border-rose-400/40',
    hex: '#f43f5e',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    bgClass: 'bg-purple-300/35 hover:bg-purple-300/50 dark:bg-purple-400/25 dark:hover:bg-purple-400/35',
    borderClass: 'border-purple-400',
    badgeClass: 'bg-purple-400/20 text-purple-600 dark:text-purple-300 border-purple-400/40',
    hex: '#a855f7',
  },
};
