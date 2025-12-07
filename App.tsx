import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ContentMode, ContentLength, ContentStyle, GeneratedContent, GenerationRequest, DatabaseItem } from './types';
import { generateViralContent } from './services/gemini';
import { saveContent } from './services/supabase';
import { Button, Select, Card } from './components/UIComponents';
import ResultView from './components/ResultView';
import Dashboard from './components/Dashboard';

type ViewState = 'generator' | 'library';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('generator');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If viewing a history item, we want to know so we can show "ReadOnly" mode or just prepopulate
  const [viewingHistoryItem, setViewingHistoryItem] = useState<boolean>(false);

  const [formData, setFormData] = useState<GenerationRequest>({
    topic: '',
    mode: 'general',
    style: 'general',
    length: 'medium'
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setViewingHistoryItem(false);

    try {
      const data = await generateViralContent(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your API Key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async (topic: string, data: GeneratedContent) => {
    await saveContent(topic, data);
  };

  const handleSelectHistoryItem = (item: DatabaseItem) => {
    setResult(item.data);
    // When viewing history, we might want to set the topic in form data too, just in case they want to regenerate
    setFormData(prev => ({ ...prev, topic: item.topic }));
    setViewingHistoryItem(true);
    setView('generator');
  };

  const handleReset = () => {
    setResult(null);
    setViewingHistoryItem(false);
    setView('generator');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-pink-500 selection:text-white pb-20">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-pink-900/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter cursor-pointer" onClick={() => setView('generator')}>
              Room<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Myst</span>
            </h1>
          </div>
          
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <button 
              onClick={() => setView('generator')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'generator' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Generator
            </button>
            <button 
              onClick={() => setView('library')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'library' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Library
            </button>
          </div>
        </div>

        {/* View Routing */}
        {view === 'library' ? (
          <Dashboard onSelect={handleSelectHistoryItem} onNew={() => setView('generator')} />
        ) : (
          <>
             {/* Tagline (only show if no result) */}
            {!result && (
              <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                 <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Transform simple ideas into high-octane, FOMO-inducing content for social media domination.
                </p>
              </div>
            )}

            {/* Input Form - Hidden when result shows */}
            {!result ? (
              <form onSubmit={handleGenerate} className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700 delay-150">
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <textarea
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="What's your topic? (e.g., 'Solo traveling to Japan on a budget' or 'New iPhone 16 launch')"
                    className="relative w-full bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700 rounded-xl p-6 text-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[160px] resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select 
                    label="Mode" 
                    value={formData.mode} 
                    onChange={(e) => setFormData({...formData, mode: e.target.value as ContentMode})}
                  >
                    <option value="general">General</option>
                    <option value="travel">Travel</option>
                    <option value="myth-storytelling">Myth/Story</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
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
                    <option value="short">Short (Reels/Shorts)</option>
                    <option value="medium">Medium (Caption)</option>
                    <option value="long">Long (Script)</option>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="w-full text-lg">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Hype...
                      </>
                    ) : (
                      'Generate Content'
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                    {error}
                  </div>
                )}
              </form>
            ) : (
              <ResultView 
                data={result} 
                topic={formData.topic} 
                onReset={handleReset} 
                onSave={handleSaveToLibrary}
                isReadOnly={viewingHistoryItem}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;