
import React, { useState, useCallback, useEffect } from 'react';
import { TaskCard } from './components/TaskCard';
import { DetailDrawer } from './components/DetailDrawer';
import { FilterBar } from './components/FilterBar';
import { FloatingActionButton } from './components/FloatingActionButton';
import { Task } from './types';
import { fetchTasks, createTask } from './api/tasks';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载任务列表
  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // 可选：20秒轮询刷新
  useEffect(() => {
    const interval = setInterval(() => {
      loadTasks();
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [loadTasks]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const handleAddTask = async () => {
    try {
      setError(null);
      const newTask = await createTask({
        title: '新任务',
        status: '待跟进',
      });

      // 刷新任务列表
      await loadTasks();

      // 打开新任务的详情抽屉
      setSelectedTask(newTask);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleTaskUpdated = async () => {
    // 任务更新后刷新列表
    await loadTasks();
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-darkBg text-gray-200">
      {/* Header & Search */}
      <header className="flex-none bg-darkCard/50 backdrop-blur-md border-b border-darkBorder z-20">
        <div className="px-4 pt-4 pb-2">
          <div className="relative group">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg group-focus-within:text-gray-300 transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="搜索任务..."
              className="w-full bg-darkBorder border-transparent focus:border-gray-600 focus:bg-[#2a2a2a] text-sm rounded-lg pl-10 pr-4 py-2 text-gray-200 placeholder-gray-500 focus:ring-0 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <FilterBar />
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined">error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto pb-24">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
              />
            ))}

            {/* Empty Add Placeholder */}
            <button
              onClick={handleAddTask}
              className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-darkBorder hover:border-gray-700 hover:bg-darkCard/30 transition-all text-gray-600 hover:text-gray-400"
            >
              <span className="material-icons-outlined text-3xl">add</span>
              <span className="text-xs mt-2">新建任务</span>
            </button>
          </div>
        )}
      </main>

      {/* Interactions */}
      <FloatingActionButton onClick={handleAddTask} />

      <DetailDrawer
        isOpen={isDrawerOpen}
        task={selectedTask}
        onClose={handleCloseDrawer}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};

export default App;
