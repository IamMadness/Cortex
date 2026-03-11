import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Thread } from './components/Thread';
import { db } from './db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Command, Settings, User, Bell, Plus, Link as LinkIcon, X, Terminal, Shield, Globe, Radio, Target, Activity, Clock, History, Compass, Layout, ChevronRight, Sparkles, Zap, Hash, Layers, Trash2 } from 'lucide-react';
import { Command as CommandMenu } from 'cmdk';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeMatterId, setActiveMatterId] = useState<number | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isBacklinksOpen, setIsBacklinksOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [threadSearchQuery, setThreadSearchQuery] = useState('');
  
  const matters = useLiveQuery(() => db.matters.toArray());
  const activeMatter = useLiveQuery(
    () => activeMatterId ? db.matters.get(activeMatterId) : Promise.resolve(null),
    [activeMatterId]
  );

  // Search results for tags and content
  const searchResults = useLiveQuery(async () => {
    if (!searchQuery) return { nodes: [], epochs: [] };
    const query = searchQuery.toLowerCase();
    
    const nodes = await db.nodes
      .filter(node => 
        node.content.toLowerCase().includes(query) || 
        (node.tags || []).some(tag => tag.toLowerCase().includes(query))
      )
      .toArray();

    const epochs = await db.matters
      .filter(epoch => 
        epoch.title.toLowerCase().includes(query) || 
        (epoch.tags || []).some(tag => tag.toLowerCase().includes(query))
      )
      .toArray();

    return { nodes, epochs };
  }, [searchQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNewMatter = async () => {
    const id = await db.matters.add({
      title: 'NEW_PROJECT_TIMELINE',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setActiveMatterId(id as number);
  };

  const handlePurge = async () => {
    if (confirm('CRITICAL: Purge all temporal data? This action is irreversible and will dissolve the entire timeline.')) {
      await db.matters.clear();
      await db.nodes.clear();
      setActiveMatterId(null);
    }
  };

  const handleUpdateTitle = async (title: string) => {
    if (activeMatterId) {
      await db.matters.update(activeMatterId, { title, updatedAt: Date.now() });
    }
  };

  return (
    <div className="flex h-screen bg-neural-bg text-neural-text font-sans overflow-hidden selection:bg-neural-primary selection:text-neural-bg">
      {/* Temporal Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neural-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neural-secondary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Temporal Pulses */}
        <div className="soma-pulse w-[600px] h-[600px] top-[20%] left-[30%]" />
        <div className="soma-pulse w-[400px] h-[400px] bottom-[10%] right-[20%]" style={{ animationDelay: '-5s', background: 'radial-gradient(circle, var(--color-neural-secondary) 0%, transparent 70%)' }} />

        {/* Neurotransmitters */}
        {[...Array(40)].map((_, i) => (
          <div 
            key={i}
            className="neurotransmitter"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              opacity: Math.random() * 0.3,
              scale: Math.random() * 2
            }}
          />
        ))}
      </div>

      <Sidebar 
        activeMatterId={activeMatterId} 
        onSelectMatter={setActiveMatterId}
        onNewMatter={handleNewMatter}
        onPurge={handlePurge}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        {/* Cortex Header */}
        <header className="h-24 border-b border-white/5 bg-neural-bg/40 backdrop-blur-3xl flex items-center justify-between px-12 sticky top-0 z-10">
          <div className="flex items-center gap-10 flex-1">
            {activeMatter ? (
              <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-3 text-[10px] text-white/20 font-mono uppercase tracking-widest font-bold">
                  <Layers className="w-4 h-4" />
                  <span>Synaptic Cluster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
                <input
                  value={activeMatter.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  className="text-2xl font-display font-bold bg-transparent border-none focus:ring-0 p-0 w-full max-w-xl text-neural-text placeholder-white/10 tracking-tight focus:placeholder-transparent transition-all"
                  placeholder="ENTER_CLUSTER_IDENTITY"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Compass className="w-5 h-5 text-white/10" />
                <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] font-mono">Awaiting Temporal Signal</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex justify-center px-8">
            <div className="relative group max-w-2xl w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-neural-primary transition-colors" />
              <input 
                value={threadSearchQuery}
                onChange={(e) => setThreadSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-4 pl-16 pr-24 text-base text-neural-text placeholder-white/20 focus:ring-0 focus:border-neural-primary/40 focus:bg-white/10 transition-all font-mono shadow-inner"
                placeholder="SEARCH_NEURAL_PATHWAYS..."
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {threadSearchQuery && (
                  <button 
                    onClick={() => setThreadSearchQuery('')}
                    className="p-1.5 hover:bg-white/10 rounded-full text-white/20 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="font-mono text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-white/20">⌘K</kbd>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="w-px h-10 bg-white/5 mx-2" />
            
            <button 
              onClick={() => setIsBacklinksOpen(!isBacklinksOpen)}
              className={`p-3.5 rounded-2xl transition-all border duration-500 ${isBacklinksOpen ? 'bg-neural-primary text-neural-bg border-neural-primary shadow-[0_0_30px_rgba(0,242,255,0.3)]' : 'bg-white/5 border-white/10 text-white/20 hover:text-neural-primary hover:border-neural-primary/40'}`}
            >
              <LinkIcon className="w-5.5 h-5.5" />
            </button>
            
            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block font-mono">
                <p className="text-[10px] font-bold text-neural-text uppercase tracking-widest">Time_Weaver</p>
                <p className="text-[8px] text-neural-primary/40 uppercase font-bold tracking-tighter">Project Architect</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neural-primary via-neural-info to-neural-secondary p-0.5 shadow-[0_0_30px_rgba(0,242,255,0.1)] group cursor-pointer">
                <div className="w-full h-full rounded-[14px] bg-neural-bg flex items-center justify-center text-neural-primary text-sm font-bold font-mono group-hover:bg-transparent group-hover:text-neural-bg transition-all duration-500">
                  TW
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Temporal Content Area */}
        <div className="flex-1 overflow-auto scroll-smooth custom-scrollbar relative">
          {activeMatterId ? (
            <Thread key={activeMatterId} matterId={activeMatterId} searchQuery={threadSearchQuery} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="relative mb-24">
                <div className="w-48 h-48 bg-white/5 border border-white/10 rounded-[3rem] flex items-center justify-center relative shadow-[0_0_100px_rgba(16,185,129,0.05)] animate-float">
                  <Sparkles className="w-20 h-20 text-aether-primary" />
                  <div className="absolute inset-0 border-2 border-aether-primary/10 rounded-[3rem] animate-[ping_4s_linear_infinite]" />
                </div>
                <div className="absolute -inset-12 border border-aether-primary/5 rounded-full animate-[spin_30s_linear_infinite]" />
                <div className="absolute -inset-24 border border-aether-secondary/5 rounded-full animate-[spin_45s_linear_infinite_reverse]" />
              </div>
              
              <h2 className="text-7xl font-display font-bold tracking-tighter text-neural-text mb-10">
                Chrono<span className="neural-gradient-text">Log</span>
              </h2>
              <p className="text-white/20 font-mono text-[12px] uppercase tracking-[0.6em] max-w-2xl mb-24 leading-loose font-bold">
                Time is a sequence of milestones. Initialize a project timeline to begin tracking the infinite.
              </p>
              
              <button
                onClick={handleNewMatter}
                className="px-20 py-7 bg-gradient-to-r from-neural-primary via-neural-info to-neural-secondary text-neural-bg rounded-[2.5rem] font-bold uppercase tracking-[0.4em] text-[12px] hover:scale-105 transition-all shadow-[0_0_60px_rgba(0,242,255,0.2)] group"
              >
                <span className="group-hover:tracking-[0.5em] transition-all duration-500 inline-block">Initialize Project Timeline</span>
              </button>
            </div>
          )}
        </div>

        {/* Temporal Links Side Panel */}
        <AnimatePresence>
          {isBacklinksOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 35, stiffness: 350 }}
              className="absolute right-0 top-24 bottom-0 w-[500px] bg-aether-bg/95 backdrop-blur-3xl border-l border-white/5 shadow-2xl z-20 flex flex-col"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-neural-primary/10 rounded-2xl border border-neural-primary/20">
                    <LinkIcon className="w-6 h-6 text-neural-primary" />
                  </div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.4em] text-neural-text font-mono">Synaptic Links</h3>
                </div>
                <button 
                  onClick={() => setIsBacklinksOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-2xl text-white/20 transition-all border border-transparent hover:border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-neural-primary/30 transition-all group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-neural-primary/10 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-[13px] font-bold text-neural-text uppercase tracking-widest">Synapse_Link_01</p>
                    <span className="text-[10px] font-mono text-neural-primary/60 font-bold uppercase tracking-widest">Verified</span>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed">Cross-timeline connection detected. Temporal stability within acceptable parameters.</p>
                </div>
                
                <div className="text-center py-32 border border-dashed border-white/5 rounded-[2.5rem] mt-12">
                  <p className="text-[11px] text-white/10 font-mono uppercase tracking-[0.5em] italic font-bold">No Further Synaptic Links</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Temporal Command Palette */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-neural-bg/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="w-full max-w-4xl bg-neural-surface rounded-[40px] shadow-[0_0_150px_rgba(0,242,255,0.1)] border border-white/10 overflow-hidden"
            >
              <CommandMenu label="Command Menu" onKeyDown={(e) => e.key === 'Escape' && setIsCommandOpen(false)}>
                <div className="flex items-center border-b border-white/5 px-12 py-10 gap-8 bg-white/5">
                  <Terminal className="w-8 h-8 text-neural-primary" />
                  <CommandMenu.Input 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="SEARCH_CORTEX..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-neural-text placeholder-white/10 font-mono text-lg uppercase tracking-[0.3em] font-bold"
                  />
                </div>
                <CommandMenu.List className="max-h-[600px] overflow-y-auto p-10 custom-scrollbar">
                  {searchQuery ? (
                    <>
                      <CommandMenu.Group heading="Synaptic Clusters" className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/20 px-10 py-6 font-mono">
                        {searchResults?.epochs.map(epoch => (
                          <CommandMenu.Item
                            key={epoch.id}
                            onSelect={() => {
                              setActiveMatterId(epoch.id!);
                              setIsCommandOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-8 px-10 py-6 rounded-3xl text-sm text-white/40 hover:bg-white/5 hover:text-neural-primary cursor-pointer transition-all border border-transparent hover:border-white/5 group"
                          >
                            <span className="font-mono opacity-40 text-[11px] font-bold">CLUSTER_{String(epoch.id).padStart(2, '0')}</span>
                            <div className="flex flex-col gap-1">
                              <span className="uppercase tracking-[0.2em] font-bold text-white/60 group-hover:text-white">{epoch.title}</span>
                              <div className="flex gap-2">
                                {epoch.tags?.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-white/10">#{tag}</span>
                                ))}
                              </div>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <Target className="w-6 h-6 text-neural-primary" />
                            </div>
                          </CommandMenu.Item>
                        ))}
                      </CommandMenu.Group>

                      <CommandMenu.Group heading="Neurons" className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/20 px-10 py-6 font-mono mt-8">
                        {searchResults?.nodes.map(node => (
                          <CommandMenu.Item
                            key={node.id}
                            onSelect={() => {
                              setActiveMatterId(node.matterId);
                              setIsCommandOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex flex-col gap-3 px-10 py-6 rounded-3xl text-sm text-white/40 hover:bg-white/5 hover:text-neural-primary cursor-pointer transition-all border border-transparent hover:border-white/5 group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-neural-primary/60">NEURON_{node.id}</span>
                              <div className="flex gap-2">
                                {node.tags?.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-white/5 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-white/10">#{tag}</span>
                                ))}
                              </div>
                            </div>
                            <p className="line-clamp-2 text-white/60 group-hover:text-white transition-colors">{node.content || 'Empty neuron'}</p>
                          </CommandMenu.Item>
                        ))}
                      </CommandMenu.Group>

                      {searchResults?.nodes.length === 0 && searchResults?.epochs.length === 0 && (
                        <div className="py-20 text-center text-[11px] font-mono text-white/10 uppercase tracking-[0.5em] font-bold">
                          No_Temporal_Matches_Found
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <CommandMenu.Group heading="Synaptic Clusters" className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/20 px-10 py-6 font-mono">
                        {matters?.map(matter => (
                          <CommandMenu.Item
                            key={matter.id}
                            onSelect={() => {
                              setActiveMatterId(matter.id!);
                              setIsCommandOpen(false);
                            }}
                            className="flex items-center gap-8 px-10 py-6 rounded-3xl text-sm text-white/40 hover:bg-white/5 hover:text-neural-primary cursor-pointer transition-all border border-transparent hover:border-white/5 group"
                          >
                            <span className="font-mono opacity-40 text-[11px] font-bold">CLUSTER_{String(matter.id).padStart(2, '0')}</span>
                            <span className="uppercase tracking-[0.2em] font-bold">{matter.title}</span>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <Target className="w-6 h-6 text-neural-primary" />
                            </div>
                          </CommandMenu.Item>
                        ))}
                      </CommandMenu.Group>
                      
                      <CommandMenu.Group heading="Temporal Operations" className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/20 px-10 py-6 mt-12 font-mono">
                        <CommandMenu.Item 
                          onSelect={handleNewMatter}
                          className="flex items-center gap-8 px-10 py-6 rounded-3xl text-sm text-white/40 hover:bg-white/5 hover:text-neural-primary cursor-pointer transition-all border border-transparent hover:border-white/5"
                        >
                          <Plus className="w-7 h-7" />
                          <span className="uppercase tracking-[0.2em] font-bold">Initialize New Cluster</span>
                        </CommandMenu.Item>
                        <CommandMenu.Item 
                          onSelect={handlePurge}
                          className="flex items-center gap-8 px-10 py-6 rounded-3xl text-sm text-white/40 hover:bg-white/5 hover:text-neural-secondary cursor-pointer transition-all border border-transparent hover:border-white/5"
                        >
                          <Trash2 className="w-7 h-7" />
                          <span className="uppercase tracking-[0.2em] font-bold">Purge Cortex Data</span>
                        </CommandMenu.Item>
                        <CommandMenu.Item className="flex items-center gap-8 px-10 py-6 rounded-3xl text-sm text-white/40 hover:bg-white/5 hover:text-neural-primary cursor-pointer transition-all border border-transparent hover:border-white/5">
                          <Settings className="w-7 h-7" />
                          <span className="uppercase tracking-[0.2em] font-bold">Cortex Configuration</span>
                        </CommandMenu.Item>
                      </CommandMenu.Group>
                    </>
                  )}
                </CommandMenu.List>
              </CommandMenu>
              
              {/* Bottom HUD bar */}
              <div className="px-12 py-5 bg-white/5 border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-5">
                  <div className="w-3 h-3 bg-aether-primary/40 rounded-sm" />
                  <div className="w-3 h-3 bg-aether-secondary/40 rounded-sm" />
                  <div className="w-3 h-3 bg-aether-accent/40 rounded-sm" />
                  <div className="w-3 h-3 bg-aether-info/40 rounded-sm" />
                </div>
                <span className="text-[10px] font-mono text-white/10 uppercase tracking-widest font-bold">AETHER_TERMINAL_V9.4.1</span>
              </div>
            </motion.div>
            <div className="absolute inset-0 -z-10" onClick={() => setIsCommandOpen(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



