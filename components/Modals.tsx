import React, { useState, useRef } from 'react';
import { X, Plus, FileJson, FileType, Loader2, Sparkles, Layout, ChevronRight } from 'lucide-react';
import { GenerationStatus, Deck } from '../types';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- AI Generator Modal ---
interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string) => void;
  status: GenerationStatus;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ isOpen, onClose, onGenerate, status }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onGenerate(text);
      setText(""); 
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Generate with AI">
      <div className="space-y-4">
        <div className="bg-indigo-50 p-4 rounded-lg flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-800">Paste your notes, an article, or a topic summary. AI will extract key concepts and create flashcards for you.</p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here..."
          className="w-full h-40 p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-sm"
          disabled={status === GenerationStatus.LOADING}
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || status === GenerationStatus.LOADING}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {status === GenerationStatus.LOADING ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Cards</span>
            </>
          )}
        </button>
      </div>
    </BaseModal>
  );
};

// --- Manual Creator Modal ---
interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (front: string, back: string) => void;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onCreate(front, back);
      setFront("");
      setBack("");
      onClose();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Add New Card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Front (Question)</label>
          <input
            type="text"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="e.g., What is a closure?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Back (Answer)</label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="w-full p-3 h-32 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
            placeholder="e.g., A function bundled with its lexical environment."
          />
        </div>
        <button
          type="submit"
          disabled={!front.trim() || !back.trim()}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Card</span>
        </button>
      </form>
    </BaseModal>
  );
};

// --- Create Deck Modal ---
interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name);
      setName("");
      onClose();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="New Playlist">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Playlist Name</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="e.g., History 101"
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Layout className="w-5 h-5" />
          <span>Create Playlist</span>
        </button>
      </form>
    </BaseModal>
  );
};

// --- Deck Selector Modal ---
interface DeckSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: Deck[];
  onSelect: (deckId: string) => void;
}

export const DeckSelectorModal: React.FC<DeckSelectorModalProps> = ({ isOpen, onClose, decks, onSelect }) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Select Playlist">
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {decks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
                No playlists found.
            </div>
        ) : (
            decks.map((deck) => (
                <button
                    key={deck.id}
                    onClick={() => onSelect(deck.id)}
                    className="w-full p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-between group text-left"
                >
                    <div>
                        <h3 className="font-medium text-slate-800 group-hover:text-indigo-700">{deck.name}</h3>
                        <p className="text-xs text-slate-500">{deck.cards.length} cards</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                </button>
            ))
        )}
      </div>
    </BaseModal>
  );
};

// --- Import Modal ---
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string, type: 'json' | 'csv') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        onImport(content, 'json');
        onClose();
      } else if (file.name.endsWith('.csv')) {
        onImport(content, 'csv');
        onClose();
      } else {
        alert('Unsupported file type. Please use JSON or CSV.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Import Cards">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Upload a JSON or CSV file to bulk add cards.
          <br/>
          <span className="text-xs text-slate-400 mt-1 block">
            JSON format: Array of objects with `front` and `back` keys.<br/>
            CSV format: Header `front,back` then rows.
          </span>
        </p>
        
        <input 
            type="file" 
            accept=".json,.csv" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
        />

        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
                <FileJson className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-700">Select JSON</span>
            </button>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
                <FileType className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 mb-2" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-700">Select CSV</span>
            </button>
        </div>
      </div>
    </BaseModal>
  );
};