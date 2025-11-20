import React from 'react';
import { ChevronLeft, Settings } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  deckName?: string;
  onBack: () => void;
  onOpenSettings?: () => void; // Placeholder for future use or import triggers
}

const Header: React.FC<HeaderProps> = ({ 
  viewMode, 
  deckName, 
  onBack,
  onOpenSettings
}) => {
  
  if (viewMode === 'library') {
    return (
      <header className="bg-slate-50 sticky top-0 z-20 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">FlashScroll</h1>
              <p className="text-xs font-medium text-slate-500">Your Learning Playlists</p>
           </div>
           {/* Placeholder for global settings/profile if needed */}
           <button className="p-2 bg-white border border-slate-200 text-slate-400 rounded-full shadow-sm hover:text-indigo-600 transition-colors">
             <Settings className="w-5 h-5" />
           </button>
        </div>
      </header>
    );
  }

  // Player View Header
  return (
    <header className="fixed top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/60 to-transparent text-white">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button 
            onClick={onBack}
            className="flex items-center gap-1 pr-3 py-1 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md border border-white/20 bg-black/20"
        >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold pr-1">Library</span>
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2 top-4 max-w-[150px]">
             <h1 className="text-sm font-bold text-white text-center truncate drop-shadow-md opacity-90">{deckName}</h1>
        </div>

        <div className="w-8" /> {/* Spacer for balance */}
      </div>
    </header>
  );
};

export default Header;