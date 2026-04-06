import React, { useCallback, useState } from 'react';
import { UploadCloud, CheckCircle } from 'lucide-react';

interface UploaderProps {
  onDataLoaded: (data: any) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onDataLoaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload_kpi`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        onDataLoaded(data);
      } else {
        alert("Upload failed: " + data.detail);
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div 
      className={`glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 border-2 ${
        isDragOver ? "border-indigo-400 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.3)] scale-[1.02]" : "border-white/10 border-dashed"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
    >
      <div className="w-16 h-16 rounded-full bg-slate-800/80 flex flex-col items-center justify-center mb-4 text-indigo-400 group relative">
        <div className="absolute inset-0 rounded-full border border-indigo-400/0 hover:border-indigo-400/100 hover:animate-ping opacity-20" />
        {success ? <CheckCircle size={32} className="text-emerald-400" /> : <UploadCloud size={32} />}
      </div>
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300">
        {uploading ? "Analyzing File..." : success ? "KPI Ready" : "Upload KPI File"}
      </h2>
      <p className="text-slate-400 mt-2 max-w-sm text-sm font-light">
        {uploading ? "Processing large dataset, optimizing chunk rendering..." : "Drag & drop your CSV file here or click to browse. Max size 50MB."}
      </p>
      
      {!uploading && !success && (
        <label className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full cursor-pointer transition-colors shadow-lg shadow-indigo-500/25 active:scale-95 text-sm font-medium">
          Select File
          <input 
            type="file" 
            className="hidden" 
            accept=".csv" 
            onChange={(e) => e.target.files && handleUpload(e.target.files[0])} 
          />
        </label>
      )}
    </div>
  );
};

export default Uploader;
