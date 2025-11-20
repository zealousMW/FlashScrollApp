
import React from 'react';
import { RotateCcw, CheckCircle, XCircle, Home } from 'lucide-react';
import { Grade } from '../types';

interface SummarySlideProps {
  total: number;
  results: Record<string, Grade>;
  onRestart: () => void;
  onExit: () => void;
}

const SummarySlide: React.FC<SummarySlideProps> = ({ total, results, onRestart, onExit }) => {
  const correctCount = Object.values(results).filter(r => r === 'correct').length;
  const incorrectCount = Object.values(results).filter(r => r === 'incorrect').length;
  const skippedCount = total - (correctCount + incorrectCount);
  
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // Determine message based on score
  let message = "Keep practicing!";
  if (percentage >= 90) message = "Outstanding!";
  else if (percentage >= 70) message = "Great job!";
  else if (percentage >= 50) message = "Good start!";

  return (
    <div className="snap-center h-full w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-md p-6 text-center">
            <div className="mb-8">
                <h2 className="text-4xl font-black text-white mb-2">{message}</h2>
                <p className="text-slate-400">Session Complete</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
                <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                    {percentage}%
                </div>
                <div className="text-sm font-medium text-indigo-300 uppercase tracking-widest mb-8">
                    Accuracy
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xl font-bold text-white">{correctCount}</span>
                        <span className="text-xs text-slate-400">Known</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                            <XCircle className="w-5 h-5 text-rose-400" />
                        </div>
                        <span className="text-xl font-bold text-white">{incorrectCount}</span>
                        <span className="text-xs text-slate-400">Unknown</span>
                    </div>

                     <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center mb-2">
                            <span className="font-bold text-slate-400">-</span>
                        </div>
                        <span className="text-xl font-bold text-white">{skippedCount}</span>
                        <span className="text-xs text-slate-400">Skipped</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={onRestart}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <RotateCcw className="w-5 h-5" />
                    <span>Restart</span>
                </button>
                <button 
                    onClick={onExit}
                    className="px-6 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-colors"
                >
                    <Home className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default SummarySlide;
