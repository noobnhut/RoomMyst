
import React, { useEffect, useState, Suspense } from 'react';
import { DatabaseItem } from '../types';
import { getContentById, updateContent } from '../services/content';

// Lazy load ResultView to keep initial bundle small
const ResultView = React.lazy(() => import('./ResultView'));

interface ArticleViewerProps {
  id: string;
  onBack: () => void;
  currentUserId?: string;
}

const ArticleViewer: React.FC<ArticleViewerProps> = ({ id, onBack, currentUserId }) => {
  const [item, setItem] = useState<DatabaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) throw new Error("Invalid Article ID");
        
        const data = await getContentById(numericId);
        setItem(data);
      } catch (err: any) {
        console.error("Error loading article:", err);
        setError("Could not load content. It may have been deleted or you don't have permission.");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const handleUpdate = async (newContent: string) => {
    if (!item) return;
    await updateContent(item.id, { ...item.data, content: newContent });
    // Optimistically update local state
    setItem(prev => prev ? { ...prev, data: { ...prev.data, content: newContent } } : null);
  };

  if (loading) {
    return <div className="min-h-screen"></div>; // Silent loading to prevent layout shift
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h2>
        <p className="text-gray-500 mb-8">{error || "The requested article does not exist."}</p>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const isOwner = currentUserId ? item.user_id === currentUserId : false;

  return (
    <div className="pt-4 pb-20">
      <Suspense fallback={<div className="min-h-screen"></div>}>
        <ResultView 
          data={item.data}
          topic={item.topic}
          onReset={onBack} // Reuse onReset as "Back"
          onUpdate={handleUpdate}
          isReadOnly={false} // Allow editing if owner
          isOwner={isOwner}
          hideHeader={true} // Hides the "Generated Success / Create New" bar
        />
      </Suspense>
    </div>
  );
};

export default ArticleViewer;
