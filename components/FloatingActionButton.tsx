
import React from 'react';

interface FABProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-900/20 active:scale-90 hover:bg-blue-500 transition-all z-30"
    >
      <span className="material-icons-outlined text-3xl">add</span>
    </button>
  );
};
