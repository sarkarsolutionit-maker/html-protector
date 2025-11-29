import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="bg-blue-600 p-4 rounded-full mb-4 shadow-lg shadow-blue-500/20">
        <ShieldCheck className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white tracking-tight">
        Secure File Protector
      </h1>
      <p className="text-gray-400 mt-2 text-sm max-w-xs">
        Military-grade AES-GCM encryption for your sensitive files. Works completely offline.
      </p>
    </header>
  );
};