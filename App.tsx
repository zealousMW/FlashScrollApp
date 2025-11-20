
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import FlashcardItem from './components/FlashcardItem';
import LibraryGrid from './components/LibraryGrid';
import SummarySlide from './components/SummarySlide';
import { CreatorModal, ImportModal, AIGeneratorModal, CreateDeckModal, DeckSelectorModal } from './components/Modals';
import { Flashcard, Deck, GenerationStatus, ViewMode, Grade } from './types';
import { generateFlashcardsFromText } from './services/geminiService';
import { Plus, Download, Upload, Wand2, FilePlus, Layout } from 'lucide-react';

const INITIAL_CARDS: Flashcard[] = [
  { id: '1', front: 'What is React?', back: 'A JavaScript library for building user interfaces.' },
  { id: '2', front: 'Explain "State"', back: 'State is mutable data managed within the component.' },
  { id: '3', front: 'What is a Hook?', back: 'Functions that let you "hook into" React features.' },
];

const DEFAULT_DECK_ID = 'default-deck';

const App: React.FC = () => {
  // Data State
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [isDeckSelectorOpen, setIsDeckSelectorOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  
  // Grading State
  const [results, setResults] = useState<Record<string, Grade>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Temporary state for quick adding a card from library
  const [targetDeckId, setTargetDeckId] = useState<string | null>(null);

  // Initialize Data
  useEffect(() => {
    const savedData = localStorage.getItem('flashscroll-data');
    if (savedData) {
      try {
        const parsedDecks = JSON.parse(savedData);
        setDecks(parsedDecks);
      } catch (e) {
        initializeDefault();
      }
    } else {
        // Legacy check
        const legacy = localStorage.getItem('flashcards');
        if (legacy) {
            try {
                const cards = JSON.parse(legacy);
                setDecks([{
                    id: DEFAULT_DECK_ID,
                    name: 'My First Playlist',
                    cards: cards,
                    createdAt: Date.now()
                }]);
            } catch (e) { initializeDefault(); }
        } else {
            initializeDefault();
        }
    }
  }, []);

  const initializeDefault = () => {
    setDecks([{
        id: DEFAULT_DECK_ID,
        name: 'React Basics',
        cards: INITIAL_CARDS,
        createdAt: Date.now()
    }]);
  };

  // Persist Data
  useEffect(() => {
    if (decks.length > 0) {
        localStorage.setItem('flashscroll-data', JSON.stringify(decks));
    }
  }, [decks]);

  // Helpers
  const getActiveDeck = () => decks.find(d => d.id === activeDeckId);
  
  const updateActiveDeck = (updatedCards: Flashcard[]) => {
    if (!activeDeckId) return;
    setDecks(prev => prev.map(d => 
        d.id === activeDeckId ? { ...d, cards: updatedCards } : d
    ));
  };

  // Navigation
  const handleSelectDeck = (id: string) => {
    setActiveDeckId(id);
    setResults({}); // Reset results when starting a new session
    setViewMode('player');
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setActiveDeckId(null);
    setResults({});
  };

  const handleRestart = () => {
      setResults({});
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  // Deck Actions
  const handleCreateDeck = (name: string) => {
    const newDeck: Deck = {
        id: uuidv4(),
        name,
        cards: [],
        createdAt: Date.now()
    };
    setDecks(prev => [...prev, newDeck]);
  };

  const handleDeleteDeck = (id: string) => {
    setDecks(prev => prev.filter(d => d.id !== id));
    if (activeDeckId === id) handleBackToLibrary();
  };

  // Card Actions
  const handleCreateCard = (front: string, back: string) => {
    const deckId = activeDeckId || targetDeckId;
    if (!deckId) return;

    const newCard: Flashcard = { id: uuidv4(), front, back };
    
    setDecks(prev => prev.map(d => 
        d.id === deckId ? { ...d, cards: [newCard, ...d.cards] } : d
    ));
    
    // Reset target if it was used
    if (targetDeckId) setTargetDeckId(null);
  };

  const handleDeleteCard = (id: string) => {
    const currentDeck = getActiveDeck();
    if(currentDeck) {
        updateActiveDeck(currentDeck.cards.filter(c => c.id !== id));
    }
  };

  const handleQuickAddCard = (deckId: string) => {
    setTargetDeckId(deckId);
    setIsDeckSelectorOpen(false);
    setIsCreatorOpen(true);
  };

  // Grading Action
  const handleRateCard = (id: string, grade: Grade) => {
      setResults(prev => ({ ...prev, [id]: grade }));
      
      // Auto scroll to next
      if (scrollContainerRef.current) {
          const height = scrollContainerRef.current.clientHeight;
          scrollContainerRef.current.scrollBy({ top: height, behavior: 'smooth' });
      }
  };

  const handleImport = (content: string, type: 'json' | 'csv') => {
    try {
      let newCards: Flashcard[] = [];
      if (type === 'json') {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          newCards = parsed
            .filter((item: any) => item.front && item.back)
            .map((item: any) => ({ id: uuidv4(), front: item.front, back: item.back }));
        }
      } else if (type === 'csv') {
        const lines = content.split('\n');
        newCards = lines
            .map(line => {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    return { id: uuidv4(), front: parts[0].trim(), back: parts.slice(1).join(',').trim() };
                }
                return null;
            })
            .filter((c): c is Flashcard => c !== null && c.front.length > 0);
      }

      if (newCards.length > 0) {
        if (activeDeckId) {
            // Add to current deck
            updateActiveDeck([...newCards, ...(getActiveDeck()?.cards || [])]);
        } else {
            // Create new deck if importing from Library view
             const newDeck: Deck = {
                id: uuidv4(),
                name: `Imported ${new Date().toLocaleDateString()}`,
                cards: newCards,
                createdAt: Date.now()
            };
            setDecks(prev => [...prev, newDeck]);
            alert(`Created new playlist "${newDeck.name}" with ${newCards.length} cards.`);
        }
      }
    } catch (e) {
      alert('Error parsing file.');
    }
  };

  const handleExport = () => {
      const currentDeck = getActiveDeck();
      if (!currentDeck) return;
      
      const dataStr = JSON.stringify(currentDeck.cards, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentDeck.name.replace(/\s+/g, '_').toLowerCase()}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleAIGenerate = async (text: string) => {
    setAiStatus(GenerationStatus.LOADING);
    try {
      const generated = await generateFlashcardsFromText(text);
      const newCards = generated.map(g => ({
        id: uuidv4(),
        front: g.front,
        back: g.back
      }));
      
      const currentDeck = getActiveDeck();
      if(currentDeck) {
        updateActiveDeck([...newCards, ...currentDeck.cards]);
      }
      
      setAiStatus(GenerationStatus.SUCCESS);
      setTimeout(() => {
          setIsAIOpen(false);
          setAiStatus(GenerationStatus.IDLE);
      }, 500);
    } catch (error) {
      setAiStatus(GenerationStatus.ERROR);
      alert('Failed to generate cards.');
      setAiStatus(GenerationStatus.IDLE);
    }
  };

  const activeDeck = getActiveDeck();

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden">
      
      <Header 
        viewMode={viewMode}
        deckName={activeDeck?.name}
        onBack={handleBackToLibrary}
        onOpenSettings={() => {}} // Placeholder
      />

      {/* View Routing */}
      {viewMode === 'library' ? (
        <>
        <main className="flex-grow overflow-y-auto pb-24">
            <LibraryGrid 
                decks={decks}
                onSelectDeck={handleSelectDeck}
                onCreateDeck={handleCreateDeck}
                onDeleteDeck={handleDeleteDeck}
            />
        </main>
        {/* Library Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-30 flex justify-around items-end pb-6 sm:pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            
            <button 
                onClick={() => setIsCreateDeckOpen(true)}
                className="flex flex-col items-center gap-1 group"
            >
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-slate-300 group-hover:scale-105 transition-transform">
                    <Layout className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-semibold text-slate-600 mt-1">Create Playlist</span>
            </button>

            <button 
                onClick={() => setIsDeckSelectorOpen(true)}
                className="flex flex-col items-center gap-1 group"
            >
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                    <FilePlus className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-semibold text-slate-600 mt-1">Add Card</span>
            </button>

            <button 
                onClick={() => setIsImportOpen(true)}
                className="flex flex-col items-center gap-1 group"
            >
                 <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl text-slate-600 flex items-center justify-center shadow-sm group-hover:bg-slate-50 transition-colors">
                    <Upload className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-semibold text-slate-500 mt-1">Import</span>
            </button>
        </div>
        </>
      ) : (
        <main className="flex-grow relative z-0 h-full w-full bg-slate-900">
            {/* Scroll Container */}
            <div 
                ref={scrollContainerRef}
                className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
            >
                
                {(!activeDeck || activeDeck.cards.length === 0) && (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 snap-center p-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Plus className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-300">Playlist Empty</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Use the buttons below to add cards or generate them with AI.</p>
                        </div>
                    </div>
                )}

                {activeDeck && activeDeck.cards.map((card, index) => (
                    <FlashcardItem 
                        key={card.id} 
                        card={card} 
                        onDelete={handleDeleteCard}
                        total={activeDeck.cards.length}
                        index={index}
                        onRate={handleRateCard}
                        grade={results[card.id]}
                    />
                ))}

                {/* End Summary Slide */}
                {activeDeck && activeDeck.cards.length > 0 && (
                    <SummarySlide 
                        total={activeDeck.cards.length}
                        results={results}
                        onRestart={handleRestart}
                        onExit={handleBackToLibrary}
                    />
                )}
            </div>

            {/* Bottom Action Bar (The "Buttons Below") */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-30 flex justify-center items-center gap-4 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-4">
                    <button 
                        onClick={() => setIsCreatorOpen(true)}
                        className="flex flex-col items-center gap-1 text-white/80 hover:text-white hover:scale-105 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center group-hover:bg-white/20">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold tracking-wide">Add</span>
                    </button>

                    <button 
                        onClick={() => setIsAIOpen(true)}
                        className="flex flex-col items-center gap-1 text-white/80 hover:text-white hover:scale-105 transition-all group -translate-y-2"
                    >
                        <div className="w-14 h-14 bg-indigo-600/80 backdrop-blur-md border border-indigo-400/30 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-500">
                            <Wand2 className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-bold tracking-wide">AI Gen</span>
                    </button>

                    <button 
                        onClick={() => setIsImportOpen(true)}
                        className="flex flex-col items-center gap-1 text-white/80 hover:text-white hover:scale-105 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center group-hover:bg-white/20">
                            <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold tracking-wide">Import</span>
                    </button>

                    <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

                    <button 
                        onClick={handleExport}
                        className="flex flex-col items-center gap-1 text-white/50 hover:text-emerald-400 hover:scale-105 transition-all group"
                    >
                        <div className="w-10 h-10 flex items-center justify-center">
                            <Download className="w-5 h-5" />
                        </div>
                    </button>
                </div>
            </div>
        </main>
      )}

      {/* Modals */}
      <CreatorModal 
        isOpen={isCreatorOpen} 
        onClose={() => {
            setIsCreatorOpen(false);
            setTargetDeckId(null); // Clear target on close
        }}
        onCreate={handleCreateCard} 
      />
      
      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onImport={handleImport} 
      />

      <AIGeneratorModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onGenerate={handleAIGenerate}
        status={aiStatus}
      />

      <CreateDeckModal
        isOpen={isCreateDeckOpen}
        onClose={() => setIsCreateDeckOpen(false)}
        onCreate={handleCreateDeck}
      />

      <DeckSelectorModal
        isOpen={isDeckSelectorOpen}
        onClose={() => setIsDeckSelectorOpen(false)}
        decks={decks}
        onSelect={handleQuickAddCard}
      />
    </div>
  );
};

export default App;
