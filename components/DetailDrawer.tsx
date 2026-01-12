
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { fetchTaskById, updateTask } from '../api/tasks';

interface DetailDrawerProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const STATUS_OPTIONS = [
  { value: '待跟进', label: '待跟进', color: 'text-gray-400' },
  { value: '计划中', label: '计划中', color: 'text-blue-400' },
  { value: '搁置', label: '搁置', color: 'text-orange-400' },
  { value: '已解决', label: '已解决', color: 'text-green-400' },
  { value: '丢弃', label: '丢弃', color: 'text-red-400' },
];

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ isOpen, task, onClose, onTaskUpdated }) => {
  const [taskDetails, setTaskDetails] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // 当抽屉打开且有任务时，从后端获取详情
  useEffect(() => {
    if (isOpen && task?.id) {
      loadTaskDetails(task.id);
    }
  }, [isOpen, task?.id]);

  const loadTaskDetails = async (taskId: string) => {
    setLoading(true);
    try {
      const details = await fetchTaskById(taskId);
      setTaskDetails(details);
    } catch (error) {
      console.error('Failed to load task details:', error);
      // Fallback to task prop
      setTaskDetails(task);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!taskDetails?.id || updating) return;

    setUpdating(true);
    setShowStatusMenu(false);

    try {
      const updated = await updateTask(taskDetails.id, { status: newStatus });
      setTaskDetails(updated);
      // 通知父组件刷新列表
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('更新状态失败，请重试');
    } finally {
      setUpdating(false);
    }
  };

  const displayTask = taskDetails || task;
  if (!displayTask) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 md:left-auto md:top-0 md:w-[450px] bg-darkCard z-50 shadow-2xl transition-transform duration-300 transform rounded-t-2xl md:rounded-none h-[85vh] md:h-screen ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}`}>
        {/* Handle for mobile */}
        <div className="flex md:hidden w-full items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-14 rounded-full bg-gray-700"></div>
        </div>

        {/* Header toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-darkBorder">
          <div className="flex gap-2">
            <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-darkBorder rounded transition-colors">
              <span className="material-icons-outlined text-lg">open_in_full</span>
            </button>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-darkBorder rounded transition-colors">
              <span className="material-icons-outlined text-lg">more_horiz</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-darkBorder rounded transition-colors">
              <span className="material-icons-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto h-full pb-32">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-8 outline-none focus:ring-0" contentEditable suppressContentEditableWarning>
                {displayTask.title}
              </h1>

              <div className="space-y-6">
                <PropertyRow icon="category" label="性质" value={displayTask.type || '任务'} />

                {/* 状态属性 - 可点击更新 */}
                <div className="flex items-center min-h-[36px] group">
                  <div className="flex items-center gap-2.5 w-32 text-gray-500 shrink-0">
                    <span className="material-icons-outlined text-lg">timelapse</span>
                    <span className="text-sm">处理状态</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      disabled={updating}
                      className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-sm transition-colors ${getStatusClasses(displayTask.status)} ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {displayTask.status}
                      <span className="material-icons-outlined text-sm">expand_more</span>
                    </button>

                    {/* 状态下拉菜单 */}
                    {showStatusMenu && (
                      <div className="absolute top-full left-0 mt-1 bg-darkCard border border-darkBorder rounded-lg shadow-xl z-10 min-w-[120px]">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusUpdate(option.value)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-darkBorder transition-colors ${option.color} ${displayTask.status === option.value ? 'bg-darkBorder' : ''}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 更新时间 */}
                {displayTask.updatedAt && (
                  <PropertyRow
                    icon="schedule"
                    label="更新时间"
                    value={new Date(displayTask.updatedAt).toLocaleString('zh-CN')}
                  />
                )}

                <div className="pt-6 border-t border-darkBorder mt-8">
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <span className="material-icons-outlined text-sm">notes</span>
                    <span className="text-sm font-medium">备注</span>
                  </div>
                  <div
                    className="text-gray-400 text-sm leading-relaxed min-h-[100px] outline-none"
                    contentEditable
                    placeholder="点击输入内容..."
                    suppressContentEditableWarning
                  >
                    这里是任务详情描述内容，您可以直接在此进行编辑。支持多行文本输入。
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const PropertyRow = ({ icon, label, value, variant }: { icon: string, label: string, value: string, variant?: string }) => {
  const getBadgeStyle = () => {
    if (variant === 'urgent') return 'bg-red-900/30 text-red-400 hover:bg-red-900/50';
    if (variant === 'status') return 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50';
    return 'hover:bg-darkBorder text-gray-300';
  };

  return (
    <div className="flex items-center min-h-[36px] group">
      <div className="flex items-center gap-2.5 w-32 text-gray-500 shrink-0">
        <span className="material-icons-outlined text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <button className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-sm transition-colors ${getBadgeStyle()}`}>
        {value}
      </button>
    </div>
  );
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case '计划中': return 'bg-blue-900/40 text-blue-400 hover:bg-blue-900/50';
    case '已解决': return 'bg-green-900/40 text-green-400 hover:bg-green-900/50';
    case '搁置': return 'bg-orange-900/40 text-orange-400 hover:bg-orange-900/50';
    case '丢弃': return 'bg-red-900/40 text-red-400 hover:bg-red-900/50';
    default: return 'bg-gray-800 text-gray-400 hover:bg-gray-700';
  }
};
