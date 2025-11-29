import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { AppMode } from '../types';

interface TabSwitcherProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="bg-gray-800 p-1 rounded-2xl flex w-full max-w-md mx-auto mb-8 border border-gray-700">
      <button
        onClick={() => onModeChange(AppMode.ENCRYPT)}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
          currentMode === AppMode.ENCRYPT
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        <Lock className="w-4 h-4" />
        Protect
      </button>
      <button
        onClick={() => onModeChange(AppMode.DECRYPT)}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
          currentMode === AppMode.DECRYPT
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        <Unlock className="w-4 h-4" />
        Unlock
      </button>
    </div>
  );
};