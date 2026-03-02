export type TrackingType = 'checkbox' | 'count' | 'duration' | 'amount' | 'rating' | 'mood' | 'yesno';

export type Habit = {
  id: string;
  name: string;
  emoji?: string;
  sortOrder: number;
  createdAt: Date;
  trackingType: TrackingType;
  unit?: string;
  goal?: number;
};

export type HabitLog = {
  id: string;
  habitId: string;
  completedOn: string; // ISO date string YYYY-MM-DD
};
