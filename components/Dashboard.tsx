import React, { useEffect, useState } from 'react';
import { getSavedContents, deleteContent } from '../services/content';
import { DatabaseItem } from '../types';
import { Button, Badge } from './UIComponents';

interface DashboardProps {
  onSelect: (item: DatabaseItem) => void;
  onNew: () => void;
  currentUserId?: string;
  lastUpdated?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelect, onNew, currentUserId, lastUpdated }) => {
  const [items, setItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [lastUpdated]); // Re-fetch whenever the parent signals an update

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSavedContents();
      setItems(data);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('not configured')) {
        setError("Storage is not configured. Please set up Supabase.");
      } else {
        setError("Failed to load history. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this item?")) return;

    setDeletingId(id);
    try {
      await deleteContent(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    // FIX: Removed animate-pulse and loading text. Just reserving space.
    return (
      <div className="min-h-[60vh]"></div>
    );
  }

  if (error) {
    // FIX: Reserve space for error state too
    return (
      <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl max-w-md w-full shadow-sm">
          <div className="text-red-500 mb-2 font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            System Message
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={onNew} variant="secondary">Go Back to Generator</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    // FIX: Reserve space for empty state
    return (
      <div className="text-center min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Library Empty</h3>
          <p className="text-gray-500">Your generated viral content will appear here.</p>
        </div>
        <Button onClick={onNew} variant="primary">Create Content</Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[60vh]">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-neutral-50/95 backdrop-blur z-20 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-display font-bold text-gray-900">Content Library</h2>
        <Button variant="primary" onClick={onNew} className="important:py-2 important:px-4 text-sm">
          + New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {items.map((item) => {
          const isOwner = currentUserId && item.user_id === currentUserId;

          return (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)}
              className="group relative cursor-pointer glass-panel rounded-xl p-6 hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:-translate-y-1 [content-visibility:auto] [contain-intrinsic-size:auto_200px]"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2 items-center">
                  <Badge>{item.data.tone_used}</Badge>
                  {isOwner && (
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={deletingId === item.id}
                      className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all"
                      title="Delete your post"
                    >
                      {deletingId === item.id ? (
                        <span className="animate-spin h-3 w-3 block rounded-full border-2 border-red-500 border-t-transparent"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-black transition-colors">
                {item.topic}
              </h3>
              
              <p className="text-gray-500 text-sm line-clamp-3 mb-5 leading-relaxed font-serif">
                {item.data.content}
              </p>

              <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100">
                {item.data.captions.slice(0, 2).map((cap, i) => (
                   <span key={i} className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-500 truncate max-w-full">
                     {cap.substring(0, 25)}...
                   </span>
                ))}
              </div>

              {isOwner && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Yours</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;