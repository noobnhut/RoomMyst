import React, { useEffect, useState } from 'react';
import { getSavedContents } from '../services/supabase';
import { DatabaseItem } from '../types';
import { Button, Badge } from './UIComponents';

interface DashboardProps {
  onSelect: (item: DatabaseItem) => void;
  onNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelect, onNew }) => {
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSavedContents();
      setItems(data);
    } catch (err: any) {
      console.error(err);
      // specific message if not configured to be less alarming
      if (err.message.includes('not configured')) {
        setError("Storage is not configured. Please set up Supabase.");
      } else {
        setError("Failed to load history. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="h-10 w-10 bg-purple-500/50 rounded-full mb-4"></div>
        <p className="text-slate-400 font-display tracking-widest uppercase text-sm">Loading library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 flex flex-col items-center">
        <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl max-w-md w-full">
          <div className="text-red-400 mb-2 font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            System Message
          </div>
          <p className="text-slate-300 mb-6">{error}</p>
          <Button onClick={onNew} variant="secondary">Go Back to Generator</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Library Empty</h3>
          <p className="text-slate-400">Your generated viral content will appear here.</p>
        </div>
        <Button onClick={onNew} variant="primary">Create Content</Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#0f172a]/95 backdrop-blur z-20 py-4 border-b border-white/5">
        <h2 className="text-2xl font-display font-bold text-white">Content Library</h2>
        <Button variant="primary" onClick={onNew} className="!py-2 !px-4 text-sm">
          + New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelect(item)}
            className="group cursor-pointer glass-panel rounded-2xl p-6 hover:bg-slate-800/90 transition-all duration-300 border border-slate-700/50 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1"
          >
            {/* <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-900/50 px-2 py-1 rounded">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
              <Badge>{item.data.tone_used}</Badge>
            </div> */}
            
            <h3 className="font-bold text-lg text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
              {item.topic}
            </h3>
            
            <p className="text-slate-400 text-sm line-clamp-3 mb-5 leading-relaxed">
              {item.data.content}
            </p>

            <div className="flex gap-2 flex-wrap pt-4 border-t border-white/5">
              {item.data.captions.slice(0, 2).map((cap, i) => (
                 <span key={i} className="text-[10px] bg-slate-900/50 border border-slate-700 px-2 py-1 rounded text-slate-400 truncate max-w-full">
                   {cap.substring(0, 25)}...
                 </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;