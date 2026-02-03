
import React, { useState, useCallback, useRef } from 'react';
import { analyzeVoice } from './services/geminiService';
import { AnalysisResponse, DetectionResult } from './types';
import { ResultDisplay } from './components/ResultDisplay';
import { Recorder } from './components/Recorder';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB limit.");
        return;
      }
      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleRecordingComplete = (blob: Blob) => {
    const recordedFile = new File([blob], "recording.webm", { type: 'audio/webm' });
    setFile(recordedFile);
    setAudioUrl(URL.createObjectURL(blob));
    setResult(null);
    setError(null);
  };

  const performAnalysis = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await fileToBase64(file);
      const analysis = await analyzeVoice(base64, file.type);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze audio. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setAudioUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      {/* Header */}
      <header className="text-center mb-12 space-y-4">
        <div className="inline-block bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-indigo-500/20">
          POWERED BY GEMINI AI
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          VoxAudit
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
          Advanced forensic voice analysis to detect deepfakes and AI-generated speech in 
          <span className="text-white font-medium"> Tamil, Hindi, Malayalam, Telugu, </span> and 
          <span className="text-white font-medium"> English.</span>
        </p>
      </header>

      <main className="space-y-8">
        {/* Interaction Zone */}
        {!file ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-gray-800 transition-all group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="audio/*"
              />
              <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <i className="fas fa-upload text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Audio</h3>
              <p className="text-gray-500 text-center text-sm">MP3, WAV, M4A, WEBM<br/>Max 20MB</p>
            </div>

            {/* Record Box */}
            <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-3xl p-12 flex items-center justify-center transition-all">
              <Recorder onRecordingComplete={handleRecordingComplete} />
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 truncate">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fas fa-file-audio text-xl"></i>
                </div>
                <div className="truncate">
                  <h3 className="font-bold truncate">{file.name}</h3>
                  <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={reset}
                className="text-gray-500 hover:text-white transition-colors"
                title="Remove file"
              >
                <i className="fas fa-times-circle text-2xl"></i>
              </button>
            </div>

            {audioUrl && (
              <div className="bg-gray-900/50 p-4 rounded-2xl">
                <audio controls src={audioUrl} className="w-full h-10 brightness-90 contrast-125" />
              </div>
            )}

            {!result && !isAnalyzing && (
              <button
                onClick={performAnalysis}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
              >
                ANALYZE VOICE SAMPLE
              </button>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                   <i className="fas fa-microchip absolute inset-0 flex items-center justify-center text-indigo-400"></i>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-bold text-indigo-400 animate-pulse">Running Forensic Scan...</p>
                  <p className="text-sm text-gray-500">Evaluating prosody, intonation, and synthesis artifacts</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3">
            <i className="fas fa-exclamation-triangle mt-1"></i>
            <div>
              <p className="font-bold">Analysis Failed</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && <ResultDisplay result={result} />}

        {/* Info Section */}
        <section className="mt-20 grid sm:grid-cols-3 gap-8 text-center sm:text-left">
           <div className="space-y-3">
              <div className="text-indigo-500 text-2xl"><i className="fas fa-globe-asia"></i></div>
              <h4 className="font-bold">Multi-Language</h4>
              <p className="text-sm text-gray-500">Native support for major Indian languages and English.</p>
           </div>
           <div className="space-y-3">
              <div className="text-indigo-500 text-2xl"><i className="fas fa-shield-halved"></i></div>
              <h4 className="font-bold">Deep Scan</h4>
              <p className="text-sm text-gray-500">Checks for micro-synthesis patterns invisible to the human ear.</p>
           </div>
           <div className="space-y-3">
              <div className="text-indigo-500 text-2xl"><i className="fas fa-bolt"></i></div>
              <h4 className="font-bold">Real-time</h4>
              <p className="text-sm text-gray-500">High-speed analysis using the latest Gemini multimodal engine.</p>
           </div>
        </section>
      </main>

      <footer className="mt-24 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© 2024 VoxAudit - Advanced Voice Authentication Labs</p>
      </footer>
    </div>
  );
};

export default App;
