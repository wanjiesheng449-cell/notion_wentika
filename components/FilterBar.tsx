
import React from 'react';

export const FilterBar: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
      <FilterButton label="状态" />
      <FilterButton label="优先级" />
      <FilterButton label="性质" />
      
      <div className="w-[1px] h-4 bg-darkBorder mx-1 shrink-0" />
      
      <button className="p-1 text-gray-500 hover:text-gray-300 hover:bg-darkBorder rounded transition-colors flex items-center justify-center">
        <span className="material-icons-outlined text-xl">grid_view</span>
      </button>
      
      <button className="ml-auto text-xs text-gray-500 hover:text-gray-300 font-medium px-2 py-1">
        排序
      </button>
    </div>
  );
};

const FilterButton = ({ label }: { label: string }) => (
  <button className="flex h-7 shrink-0 items-center justify-center gap-x-1.5 rounded-md bg-darkCard border border-darkBorder hover:bg-darkBorder px-2.5 transition-colors shadow-sm">
    <p className="text-xs font-medium text-gray-300">{label}</p>
    <span className="material-icons-outlined text-xs text-gray-500">expand_more</span>
  </button>
);
