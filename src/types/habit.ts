export type Habit = {
  id: string;
  name: string;
  emoji?: string;
  sortOrder: number;
  createdAt: Date;
};

export type HabitLog = {
  id: string;
  habitId: string;
  completedOn: string; // ISO date string YYYY-MM-DD
};
