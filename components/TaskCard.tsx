
import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case '计划中': return 'bg-blue-900/40 text-blue-400';
      case '已解决': return 'bg-green-900/40 text-green-400';
      case '搁置': return 'bg-orange-900/40 text-orange-400';
      case '丢弃': return 'bg-red-900/40 text-red-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col aspect-square overflow-hidden rounded-xl bg-darkCard border border-darkBorder hover:border-gray-600 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
    >
      {/* Decorative top bar */}
      <div
        className="h-2 w-full shrink-0"
        style={{ backgroundColor: task.color || '#3b82f6' }}
      ></div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-gray-200 line-clamp-3 mb-auto">
          {task.title}
        </h3>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="material-icons-outlined text-sm">{task.icon || 'check_circle'}</span>
            <span className="truncate">{task.type || '任务'}</span>
          </div>

          <div className="flex">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${getStatusClasses(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
