'use client';

import { useState } from 'react';
import { Upload, X, FileMusic, Video, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface UploadZoneProps {
  onSuccess: () => void;
}

export default function UploadZone({ onSuccess }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus('processing');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData);
      setStatus('success');
      setTimeout(() => {
        setFile(null);
        setStatus('idle');
        setUploading(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setUploading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-8 mb-8 border-2 border-dashed border-white/10 hover:border-primary/50 transition-all group relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!file ? (
        <label className="flex flex-col items-center justify-center cursor-pointer py-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="text-primary w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-1">Upload Live Sansad Feed</h3>
          <p className="text-white/40 text-sm">Drop audio/video file to summarize</p>
          <input 
            type="file" 
            className="hidden" 
            accept="audio/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      ) : (
        <div className="flex flex-col items-center py-4">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl w-full mb-6 relative">
            {file.type.startsWith('audio') ? <FileMusic className="text-primary" /> : <Video className="text-primary" />}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{file.name}</p>
              <p className="text-[10px] text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded-full">
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI Processing...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Successfully Added
              </>
            ) : (
              'Start Summarization'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
