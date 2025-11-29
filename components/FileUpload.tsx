import React, { useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ selectedFile, onFileSelect, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <div className="w-full bg-gray-800 rounded-2xl border border-gray-700 p-4 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-400">
            <File className="w-6 h-6" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-white font-medium truncate">{selectedFile.name}</span>
            <span className="text-gray-400 text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
        <button 
          onClick={onClear}
          className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-red-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-full h-48 border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-gray-800/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group"
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
        <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
      </div>
      <p className="text-gray-300 font-medium group-hover:text-white">Click or Drag to upload file</p>
      <p className="text-gray-500 text-sm mt-1">Any file type supported</p>
    </div>
  );
};