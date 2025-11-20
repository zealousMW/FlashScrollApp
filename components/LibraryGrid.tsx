import React from 'react';
import { Deck } from '../types';
import { Play, Trash2, GraduationCap } from 'lucide-react';

interface LibraryGridProps {
  decks: Deck[];
  onSelectDeck: (id: string) => void;
  onCreateDeck: (name: string) => void;
  onDeleteDeck: (id: string) => void;
}

const GRADIENTS = [
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
];

const LibraryGrid: React.FC<LibraryGridProps> = ({ 
  decks, 
  onSelectDeck, 
  onDeleteDeck 
}) => {
  
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full pb-24">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Deck Cards */}
        {decks.map((deck, index) => (
          <div 
            key={deck.id} 
            onClick={() => onSelectDeck(deck.id)}
            className="group relative aspect-[4/5] sm:aspect-square cursor-pointer perspective-1000"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} rounded-2xl shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl overflow-hidden`}>
              
              {/* Content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                    <GraduationCap className="w-6 h-6 opacity-80" />
                    {/* Delete visible on hover/focus */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('Delete this playlist?')) onDeleteDeck(deck.id);
                        }}
                        className="p-1.5 bg-black/20 hover:bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                
                <div>
                    <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{deck.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium opacity-90">
                        <span>{deck.cards.length} Cards</span>
                    </div>
                </div>
              </div>

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                 <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all shadow-lg">
                    <Play className="w-5 h-5 text-slate-900 ml-1" />
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryGrid;