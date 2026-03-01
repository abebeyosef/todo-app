export type Task = {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
  project?: string;        // display name
  projectId?: string;      // UUID from projects table
  projectColour?: string;  // hex colour
  scheduledAt?: Date;
  duration?: number;       // in minutes
  priority: 'p1' | 'p2' | 'p3';
  isBacklog: boolean;
  completedAt?: Date;
  googleEventId?: string;
};
