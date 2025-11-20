import React, { useState } from 'react';
import { Plus, Library, Trash2, X, ChevronRight } from 'lucide-react';
import { Deck } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  decks: Deck[];
  activeDeckId: string;
  onSelectDeck: (id: string) => void;
  onCreateDeck: (name: string) => void;
  onDeleteDeck: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  decks,
  activeDeckId,
  onSelectDeck,
  onCreateDeck,
  onDeleteDeck
}) => {
  const [newDeckName, setNewDeckName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName);
      setNewDeckName('');
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Library className="w-5 h-5 text-indigo-600" />
              <span>Your Playlists</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Deck List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {decks.map(deck => (
              <div 
                key={deck.id}
                onClick={() => {
                    onSelectDeck(deck.id);
                    // On mobile, auto close after selection
                    if (window.innerWidth < 640) onClose();
                }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeDeckId === deck.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate">{deck.name}</span>
                  <span className={`text-xs truncate ${activeDeckId === deck.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {deck.cards.length} cards
                  </span>
                </div>
                
                {decks.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm('Delete this playlist?')) onDeleteDeck(deck.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                        activeDeckId === deck.id 
                        ? 'hover:bg-indigo-500 text-indigo-200 hover:text-white' 
                        : 'hover:bg-red-100 text-slate-300 hover:text-red-500'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Create New Deck Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            {isCreating ? (
              <form onSubmit={handleCreate} className="flex flex-col gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Playlist name..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Create
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 bg-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-3 bg-white border border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl transition-all flex items-center justify-center gap-2 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Playlist</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;