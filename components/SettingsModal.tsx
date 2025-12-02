import React, { useState, useEffect } from 'react';
import { X, Key, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  youtubeKey: string;
  onSave: (gemini: string, youtube: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, geminiKey, youtubeKey, onSave }) => {
  const [gKey, setGKey] = useState(geminiKey);
  const [yKey, setYKey] = useState(youtubeKey);

  useEffect(() => {
    setGKey(geminiKey);
    setYKey(youtubeKey);
  }, [geminiKey, youtubeKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-dark-border bg-gradient-to-r from-brand-900/50 to-transparent">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-500" />
            API Configuration
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-400">
            To use CommentIQ, you need your own API keys. These are stored locally in your browser.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Gemini API Key</label>
            <input 
              type="password"
              value={gKey}
              onChange={(e) => setGKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none text-white placeholder-gray-600"
            />
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-brand-500 hover:underline">Get Gemini Key (Free)</a>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">YouTube API Key</label>
            <input 
              type="password"
              value={yKey}
              onChange={(e) => setYKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none text-white placeholder-gray-600"
            />
             <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noreferrer" className="text-xs text-brand-500 hover:underline">Get YouTube Data API v3 Key</a>
          </div>
        </div>

        <div className="p-6 border-t border-dark-border bg-dark-bg/50 flex justify-end">
          <button 
            onClick={() => onSave(gKey, yKey)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-lg shadow-brand-500/20"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
