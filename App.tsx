import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { TabSwitcher } from './components/TabSwitcher';
import { FileUpload } from './components/FileUpload';
import { Button } from './components/Button';
import { AppMode } from './types';
import { encryptFileContent, decryptFileContent } from './services/cryptoService';
import { Lock, Unlock, Download, RefreshCw, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

// Helper to guess MIME type based on extension
const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'html': 'text/html',
    'htm': 'text/html',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'zip': 'application/zip',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'json': 'application/json',
    'xml': 'text/xml',
    'svg': 'image/svg+xml',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
};

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.ENCRYPT);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setFile(null);
    setPassword('');
    setResult(null);
    setError(null);
  }, []);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    resetState();
  };

  const handleProcess = async () => {
    if (!file || !password) return;

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (mode === AppMode.ENCRYPT) {
        const encryptedBuffer = await encryptFileContent(arrayBuffer, password);
        const fileName = `${file.name}.enc`;
        const blob = new Blob([encryptedBuffer], { type: 'application/octet-stream' });
        setResult({
          blob,
          fileName
        });
      } else {
        const decryptedBuffer = await decryptFileContent(arrayBuffer, password);
        // Try to recover original name by removing .enc if present
        const originalName = file.name.endsWith('.enc') 
          ? file.name.slice(0, -4) 
          : `decrypted_${file.name}`;
        
        // Use the original MIME type if possible so Android handles it correctly
        const mimeType = getMimeType(originalName);
        const blob = new Blob([decryptedBuffer], { type: mimeType });
        
        setResult({
          blob,
          fileName: originalName
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!result) return;
    
    // Create a blob URL
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = result.fileName;
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <Header />
        
        <TabSwitcher currentMode={mode} onModeChange={handleModeChange} />

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-6 shadow-2xl">
          
          {!result ? (
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">
                  {mode === AppMode.ENCRYPT ? 'Select File to Protect' : 'Select Encrypted File'}
                </label>
                <FileUpload 
                  selectedFile={file} 
                  onFileSelect={setFile} 
                  onClear={resetState} 
                />
              </div>

              {/* Password Section */}
              {file && (
                <div className="space-y-2 animate-fade-in-up">
                  <label className="text-sm font-medium text-gray-400 ml-1">
                    {mode === AppMode.ENCRYPT ? 'Set Protection Password' : 'Enter Decryption Password'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-600"
                    />
                  </div>
                  {mode === AppMode.ENCRYPT && password.length > 0 && password.length < 6 && (
                     <p className="text-xs text-yellow-500 ml-1">Recommendation: Use at least 6 characters for better security.</p>
                  )}
                </div>
              )}

              {/* Action Button */}
              {file && password && (
                <div className="pt-2 animate-fade-in-up">
                  <Button 
                    fullWidth 
                    variant={mode === AppMode.ENCRYPT ? 'primary' : 'success'}
                    onClick={handleProcess}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {mode === AppMode.ENCRYPT ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        {mode === AppMode.ENCRYPT ? 'Protect File' : 'Unlock File'}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-xl flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : (
            // Success State
            <div className="text-center py-6 space-y-6 animate-scale-in">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {mode === AppMode.ENCRYPT ? 'File Protected!' : 'File Unlocked!'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {mode === AppMode.ENCRYPT 
                    ? 'Your file is now encrypted and safe.' 
                    : 'Your file has been successfully restored.'}
                </p>
              </div>

              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                <span className="text-gray-300 truncate max-w-[200px]">{result.fileName}</span>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-500 uppercase">
                  {(result.blob.size / 1024).toFixed(2)} KB
                </span>
              </div>

              <div className="space-y-3">
                <Button fullWidth variant="success" onClick={downloadFile}>
                  <Download className="w-5 h-5" />
                  Download File
                </Button>
                <Button fullWidth variant="secondary" onClick={resetState}>
                  Process Another File
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-center text-gray-600 text-xs mt-8">
          Files are processed locally on your device. No data is ever sent to a server.
        </p>
      </div>
    </div>
  );
}