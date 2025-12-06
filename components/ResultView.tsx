import React, { useState } from 'react';
import { GeneratedContent } from '../types';
import { Card, Button, Badge } from './UIComponents';

interface ResultViewProps {
  data: GeneratedContent;
  topic?: string;
  onReset: () => void;
  onSave?: (topic: string, data: GeneratedContent) => Promise<void>;
  isReadOnly?: boolean;
}

const ResultView: React.FC<ResultViewProps> = ({ data, topic, onReset, onSave, isReadOnly = false }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = async () => {
    if (!onSave || !topic) return;
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');
    try {
      await onSave(topic, data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) {
      console.error("Save handler caught:", e);
      setSaveStatus('error');
      // Extract the most relevant error message
      const msg = e instanceof Error ? e.message : (e.message || JSON.stringify(e) || "Failed to save");
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          {isReadOnly ? (
            <>
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Archived Content
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Generated Success
            </>
          )}
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
           {!isReadOnly && onSave && (
            <div className="relative">
              <Button 
                variant="secondary" 
                onClick={handleSave} 
                disabled={isSaving || saveStatus === 'success'}
                className={`!py-2 !px-4 text-sm w-full sm:w-auto ${
                  saveStatus === 'success' ? '!bg-green-600 !text-white' : 
                  saveStatus === 'error' ? '!bg-red-600 !text-white' : ''
                }`}
              >
                {isSaving ? 'Saving...' : 
                 saveStatus === 'success' ? 'Saved to Library ✓' : 
                 saveStatus === 'error' ? 'Error Saving' : 
                 'Save to Library'}
              </Button>
            </div>
          )}
          <Button variant="ghost" onClick={onReset} className="!py-2 !px-4 text-sm w-full sm:w-auto whitespace-nowrap">
            {isReadOnly ? '← Back to Library' : 'Create New'}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="w-full bg-red-900/40 backdrop-blur text-red-100 text-sm p-4 rounded-xl border border-red-500/30 flex items-center justify-between">
           <span>{errorMessage}</span>
           <button onClick={() => setErrorMessage('')} className="text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content */}
      <Card title="Main Script / Content" className="relative group">
        <div className="prose prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-200">{data.content}</p>
        </div>
        
        {/* Actions Bar inside Card */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <Button variant="ghost" onClick={() => copyToClipboard(data.content)} className="!p-2 text-xs bg-slate-800/80 backdrop-blur">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
            Copy Text
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Captions */}
        <Card title="Viral Captions" className="h-full">
          <div className="space-y-4">
            {data.captions.map((caption, idx) => (
              <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex justify-between gap-4 items-start group hover:bg-slate-800 transition-colors">
                <p className="text-sm text-slate-300 italic">"{caption}"</p>
                <button 
                  onClick={() => copyToClipboard(caption)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                  title="Copy caption"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Visual Guide */}
        <Card title="Visual Direction" className="h-full bg-gradient-to-br from-slate-900 to-slate-800">
           <div className="flex flex-col h-full justify-between">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scene Description</h4>
                <p className="text-slate-300 italic border-l-2 border-purple-500 pl-4">
                  {data.visual_guide || "No specific visual guide provided. Use high-energy, fast-paced cuts."}
                </p>
              </div>
              
              {data.cta && (
                <div className="mt-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Recommended CTA</span>
                  <p className="font-bold text-pink-200 mt-1 text-lg">{data.cta}</p>
                </div>
              )}
           </div>
        </Card>
      </div>

      {/* Hashtags & Keywords */}
      <Card>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {data.hashtags.map((tag, i) => (
                <Badge key={i}>#{tag.replace(/^#/, '')}</Badge>
              ))}
              <button 
                onClick={() => copyToClipboard(data.hashtags.join(' '))}
                className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Copy All
              </button>
            </div>
          </div>
          
          {data.keywords && data.keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">SEO Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {data.keywords.map((kw, i) => (
                  <span key={i} className="text-xs text-slate-400 bg-slate-800/50 border border-slate-700/50 px-2 py-1 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Alt Version */}
      {data.alt_version && (
        <Card title="Alternative Version (A/B Test)" className="border-l-4 border-l-purple-500">
           <p className="whitespace-pre-wrap text-slate-300">{data.alt_version}</p>
        </Card>
      )}

      <div className="h-12"></div>
    </div>
  );
};

export default ResultView;