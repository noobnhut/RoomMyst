
import React, { useState, Suspense, useEffect } from 'react';
import { GeneratedContent, GenerationRequest, ContentMode, ContentStyle, ContentLength, UserProfile, DatabaseItem } from '../types';
import { Button, Select } from './UIComponents';

const ResultView = React.lazy(() => import('./ResultView'));

interface GeneratorProps {
  userProfile: UserProfile;
  onContentSaved?: () => void;
  initialItem?: DatabaseItem | null; // Added prop to receive history item
}

const Generator: React.FC<GeneratorProps> = ({ userProfile, onContentSaved, initialItem }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<GenerationRequest>({
    topic: '',
    mode: 'general',
    style: 'general',
    length: 'medium'
  });

  // Watch for changes in initialItem (when user clicks from Library)
  useEffect(() => {
    if (initialItem) {
      setResult(initialItem.data);
      setFormData(prev => ({ ...prev, topic: initialItem.topic }));
    } else {
      // If initialItem is cleared, reset to form view
      setResult(null);
      setFormData(prev => ({ ...prev, topic: '' }));
    }
  }, [initialItem]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!userProfile?.apikey) {
        throw new Error("API Key is missing.");
      }

      // Dynamic imports
      const [{ generateViralContent }, { decryptData }] = await Promise.all([
        import('../services/gemini'),
        import('../services/crypto')
      ]);

      const decryptedKey = decryptData(userProfile.apikey);
      if (!decryptedKey) {
        throw new Error("Could not decrypt API Key. Please try logging in again.");
      }

      const data = await generateViralContent(formData, decryptedKey);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async (topic: string, data: GeneratedContent) => {
    const { saveContent } = await import('../services/content');
    await saveContent(topic, data);
    
    // Notify parent to update the "Signal" for Dashboard
    if (onContentSaved) {
      onContentSaved();
    }
  };

  const handleUpdateContent = async (newContent: string) => {
    // Current Generator view doesn't persist ID unless saved, 
    // so this is a local update for the displayed result only.
    if (result) {
        setResult({ ...result, content: newContent });
    }
  };

  const handleReset = () => {
    setResult(null);
    // Ideally clear the selection in parent, but clearing local result works for UX
  };

  if (result) {
    return (
      <Suspense fallback={<div className="min-h-screen"></div>}>
        <ResultView 
          data={result} 
          topic={formData.topic} 
          onReset={handleReset} 
          onSave={handleSaveToLibrary}
          onUpdate={handleUpdateContent}
          isOwner={true}
        />
      </Suspense>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
         <h2 className="text-3xl font-display font-bold mb-3">Create Viral Content</h2>
         <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Transform your ideas into high-engagement posts, scripts, and captions using advanced AI.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="max-w-2xl mx-auto space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-gray-200 to-gray-300 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <textarea
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="What's your topic? (e.g., 'Solo traveling to Japan on a budget' or 'New iPhone 16 launch')"
            className="relative w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl p-6 text-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-40 resize-none shadow-sm transition-shadow hover:shadow-md"
            required
            spellCheck={false}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select 
            label="Mode" 
            value={formData.mode} 
            onChange={(e) => setFormData({...formData, mode: e.target.value as ContentMode})}
          >
            <option value="general">General Post</option>
            <option value="travel">Travel Guide</option>
            <option value="myth-storytelling">Storytelling</option>
            <option value="marketing">Marketing Copy</option>
            <option value="sales">Sales Pitch</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="tts">Voiceover Script</option>
          </Select>

          <Select 
            label="Tone & Style" 
            value={formData.style} 
            onChange={(e) => setFormData({...formData, style: e.target.value as ContentStyle})}
          >
            <option value="general">Standard Viral</option>
            <option value="cinematic">Cinematic</option>
            <option value="emotional">Emotional</option>
            <option value="mystery">Mystery/Hook</option>
            <option value="humor">Humorous</option>
            <option value="motivational">Motivational</option>
          </Select>

          <Select 
            label="Length" 
            value={formData.length} 
            onChange={(e) => setFormData({...formData, length: e.target.value as ContentLength})}
          >
            <option value="short">Short (Reels/TikTok)</option>
            <option value="medium">Medium (FB/Insta)</option>
            <option value="long">Long (Script/Blog)</option>
          </Select>
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={loading} className="w-full text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
            {loading ? 'Crafting Magic...' : 'Generate Content ✨'}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default Generator;
