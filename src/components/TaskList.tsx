import { Task } from '@/types/task';
import TaskItem from './TaskItem';

type Props = {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: 'p1' | 'p2' | 'p3') => void;
};

export default function TaskList({ tasks, onComplete, onDelete, onPriorityChange }: Props) {
  if (tasks.length === 0) {
    return <p className="mt-4 px-2 text-sm" style={{ color: 'var(--text-muted)' }}>No tasks yet. Add one above.</p>;
  }

  return (
    <div className="flex flex-col">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
          onPriorityChange={onPriorityChange}
        />
      ))}
    </div>
  );
}
