
export type DayOfWeek = 'Backlog' | 'Понедельник' | 'Вторник' | 'Среда' | 'Четверг' | 'Пятница' | 'Суббота' | 'Воскресенье';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье'
];

export const ALL_COLUMNS: DayOfWeek[] = [
  'Backlog',
  ...DAYS_OF_WEEK
];

export type TimeBlock = 'morning' | 'day' | 'evening';

// Color Palette Definition
export type ColorKey = 'slate' | 'red' | 'orange' | 'amber' | 'green' | 'emerald' | 'teal' | 'cyan' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';

export interface ColorScheme {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const COLOR_PALETTE: Record<ColorKey, ColorScheme> = {
  slate:   { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
  red:     { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  orange:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  amber:   { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  green:   { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  teal:    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  cyan:    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  blue:    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  indigo:  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  violet:  { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  purple:  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', dot: 'bg-fuchsia-500' },
  pink:    { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
  rose:    { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
};

export interface Tag {
  id: string;
  label: string;
  color: ColorKey;
}

// Initial defaults
export const DEFAULT_TAGS: Tag[] = [
  { id: 'work', label: 'Работа', color: 'blue' },
  { id: 'personal', label: 'Личное', color: 'emerald' },
  { id: 'urgent', label: 'Срочно', color: 'red' },
];

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  day: DayOfWeek;
  timeBlock: TimeBlock;
  tagId: string; 
  description?: string;
  subtasks?: Subtask[];
}

export enum FilterType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}
