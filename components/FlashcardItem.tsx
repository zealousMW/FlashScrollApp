
import React, { useState, useRef, useEffect } from 'react';
import { Flashcard, Grade } from '../types';
import { Trash2, MousePointerClick, Check, X } from 'lucide-react';

interface FlashcardItemProps {
  card: Flashcard;
  onDelete: (id: string) => void;
  total: number;
  index: number;
  onRate?: (id: string, grade: Grade) => void;
  grade?: Grade;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({ card, onDelete, total, index, onRate, grade }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Swipe Logic State
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null); // Track Y to prevent scroll interference
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const SWIPE_THRESHOLD = 100; // px to trigger action

  const handleStart = (clientX: number, clientY: number) => {
    setStartX(clientX);
    setStartY(clientY);
    setIsDragging(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (startX === null || startY === null) return;
    
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Only process horizontal swipe if it exceeds vertical movement (locking axis)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setSwipeX(deltaX);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (Math.abs(swipeX) > SWIPE_THRESHOLD && onRate) {
        if (swipeX > 0) {
            onRate(card.id, 'correct');
        } else {
            onRate(card.id, 'incorrect');
        }
        // Reset swipe visual after a delay or immediately if controlled by parent
        setTimeout(() => setSwipeX(0), 200);
    } else {
        setSwipeX(0);
    }
    setStartX(null);
    setStartY(null);
  };

  // Touch Events
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  // Mouse Events (for desktop swipe testing)
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => {
    if(isDragging) handleMove(e.clientX, e.clientY);
  }
  const onMouseUp = () => {
      if(isDragging) handleEnd();
  };
  const onMouseLeave = () => {
      if(isDragging) handleEnd();
  }

  const handleFlip = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent flip if dragging
    if (Math.abs(swipeX) > 5) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsFlipped(!isFlipped);
  };

  // Calculate styles based on swipe
  const rotation = swipeX * 0.05; // slight rotation
  const opacity = Math.max(0, 1 - Math.abs(swipeX) / 500); // fade out if pulled too far
  const cardStyle = {
    transform: `translateX(${swipeX}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
    opacity: 1 // Keep opacity 1, handle overlay opacity instead
  };

  const getBorderColor = () => {
      if (grade === 'correct') return 'border-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]';
      if (grade === 'incorrect') return 'border-rose-500 shadow-[0_0_30px_-5px_rgba(244,63,94,0.4)]';
      return 'border-slate-700/50';
  };

  return (
    <div className="snap-center h-full w-full flex items-center justify-center bg-slate-900 relative overflow-hidden select-none">
        {/* Background Blur Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className={`absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] mix-blend-screen animate-pulse`} />
            <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000`} />
        </div>

        {/* Swipe Indicators (Background) */}
        <div className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-emerald-600/20 to-transparent pointer-events-none transition-opacity duration-300 ${swipeX > 50 ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-rose-600/20 to-transparent pointer-events-none transition-opacity duration-300 ${swipeX < -50 ? 'opacity-100' : 'opacity-0'}`} />

        {/* Card Container */}
        <div 
            className="w-full h-full max-w-md perspective-1000 relative z-10 p-0 sm:p-4 pb-[100px] sm:pb-[100px] pt-[60px]"
        >
            <div 
                className="relative w-full h-full cursor-pointer"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onClick={handleFlip}
                style={cardStyle}
            >
                {/* Inner container handling the 3D rotation */}
                <div 
                    className={`relative w-full h-full transition-transform duration-500 ease-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                >
                
                {/* Front Face */}
                <div className={`absolute inset-0 w-full h-full bg-slate-800 sm:rounded-3xl flex flex-col justify-center p-8 [backface-visibility:hidden] shadow-2xl border-2 transition-colors ${getBorderColor()}`}>
                    
                    {/* Swipe Overlay Indicators */}
                    <div className={`absolute top-8 right-8 p-4 rounded-full border-4 border-emerald-500 text-emerald-500 font-bold text-xl uppercase tracking-widest opacity-0 ${swipeX > 50 ? 'opacity-100' : ''} transition-opacity`}>
                        Known
                    </div>
                    <div className={`absolute top-8 left-8 p-4 rounded-full border-4 border-rose-500 text-rose-500 font-bold text-xl uppercase tracking-widest opacity-0 ${swipeX < -50 ? 'opacity-100' : ''} transition-opacity`}>
                        Unknown
                    </div>

                    {/* Content */}
                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                         <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-6 bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-500/20">
                            Question
                         </span>
                        <p className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-wide max-h-[60vh] overflow-y-auto no-scrollbar">
                            {card.front}
                        </p>
                    </div>
                    
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-40">
                        <div className="flex items-center gap-2 text-slate-400 text-sm animate-bounce">
                             <MousePointerClick className="w-4 h-4" />
                             <span>Tap to flip</span>
                        </div>
                    </div>
                </div>

                {/* Back Face */}
                <div className={`absolute inset-0 w-full h-full bg-slate-100 sm:rounded-3xl flex flex-col justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-2xl border-2 ${grade ? (grade === 'correct' ? 'border-emerald-500' : 'border-rose-500') : 'border-transparent'}`}>
                    
                    {/* Header Controls inside Card (Back) */}
                    <div className="absolute top-4 right-4">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(card.id);
                            }}
                            className="text-slate-300 hover:text-red-500 bg-slate-200 hover:bg-red-50 rounded-full p-2 transition-all"
                            title="Remove from playlist"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-6 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                            Answer
                         </span>
                        <p className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed max-h-[60vh] overflow-y-auto no-scrollbar">
                            {card.back}
                        </p>
                    </div>
                </div>

                </div>
            </div>

            {/* Desktop/Touch Action Buttons (Below Card content but inside item area) */}
            <div className="absolute bottom-[80px] sm:bottom-6 left-0 right-0 flex justify-center gap-12 z-20 pointer-events-none">
                <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${isFlipped || grade ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRate?.(card.id, 'incorrect'); }}
                        className="w-14 h-14 rounded-full bg-rose-100/10 backdrop-blur-md border border-rose-500/50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Don't Know</span>
                </div>

                <div className={`flex flex-col items-center gap-2 transition-opacity duration-300 ${isFlipped || grade ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRate?.(card.id, 'correct'); }}
                        className="w-14 h-14 rounded-full bg-emerald-100/10 backdrop-blur-md border border-emerald-500/50 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                    >
                        <Check className="w-8 h-8" />
                    </button>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Know</span>
                </div>
            </div>
        </div>
        
        {/* Page Indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 hidden sm:flex">
            <div className="w-1 h-1 rounded-full bg-white/20"></div>
            <div className="w-1 h-8 rounded-full bg-white/50"></div>
            <div className="w-1 h-1 rounded-full bg-white/20"></div>
        </div>
        
        <div className="absolute bottom-[130px] sm:bottom-[90px] right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white/80 border border-white/10">
            {index + 1} / {total}
        </div>

    </div>
  );
};

export default FlashcardItem;
