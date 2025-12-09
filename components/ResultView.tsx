
import React, { useState, useRef, useEffect } from 'react';
import { GeneratedContent } from '../types';
import { Card, Button, Badge } from './UIComponents';

interface ResultViewProps {
  data: GeneratedContent;
  topic?: string;
  onReset: () => void;
  onSave?: (topic: string, data: GeneratedContent) => Promise<void>;
  onUpdate?: (newContent: string) => Promise<void>;
  isReadOnly?: boolean;
  isOwner?: boolean;
  hideHeader?: boolean; // New prop to control header visibility
}

const ResultView: React.FC<ResultViewProps> = ({ 
  data, 
  topic, 
  onReset, 
  onSave, 
  onUpdate,
  isReadOnly = false,
  isOwner = false,
  hideHeader = false
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(data.content);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Ref for optimized focus management to prevent forced reflows
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      // requestAnimationFrame ensures the focus logic runs AFTER the browser has finished 
      // the current paint cycle, preventing synchronous layout thrashing (Forced Reflow).
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [isEditing]);

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
      const msg = e instanceof Error ? e.message : (e.message || JSON.stringify(e) || "Failed to save");
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!onUpdate) return;
    setIsUpdating(true);
    try {
      await onUpdate(editedContent);
      setIsEditing(false);
    } catch (e: any) {
      setErrorMessage("Failed to update content: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditedContent(data.content);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Actions - Conditionally Rendered */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-3">
            {isReadOnly ? (
              <>
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Archived Content
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
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
                  className={`important:py-2 important:px-4 text-sm w-full sm:w-auto ${
                    saveStatus === 'success' ? 'important:bg-green-600 important:text-white important:border-green-600' : 
                    saveStatus === 'error' ? 'important:bg-red-600 important:text-white important:border-red-600' : ''
                  }`}
                >
                  {isSaving ? 'Saving...' : 
                   saveStatus === 'success' ? 'Saved to Library ✓' : 
                   saveStatus === 'error' ? 'Error Saving' : 
                   'Save to Library'}
                </Button>
              </div>
            )}
            <Button variant="ghost" onClick={onReset} className="important:py-2 important:px-4 text-sm w-full sm:w-auto whitespace-nowrap">
              {isReadOnly ? '← Back to Library' : 'Create New'}
            </Button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="w-full bg-red-50 text-red-800 text-sm p-4 rounded-lg border border-red-200 flex items-center justify-between">
           <span>{errorMessage}</span>
           <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-900">✕</button>
        </div>
      )}

      {/* Main Content */}
      <Card title="Main Script / Content" className="relative group">
        
        {/* Edit Button for Owners */}
        {isOwner && onUpdate && !isEditing && (
          <div className="absolute top-6 right-6">
            <button 
              onClick={() => {
                setEditedContent(data.content);
                setIsEditing(true);
              }}
              className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="appearance-none w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none focus:outline-none font-sans text-lg leading-relaxed text-gray-900 resize-y"
              spellCheck={false}
              // autoFocus removed to prevent reflow, appearance-none & !outline-none added to fix double cursor
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={cancelEdit} disabled={isUpdating} className="important:py-2 important:px-4 text-sm">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdate} disabled={isUpdating} className="important:py-2 important:px-4 text-sm">
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700 font-sans">{data.content}</p>
          </div>
        )}
        
        {/* Actions Bar inside Card */}
        {!isEditing && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
            <Button variant="ghost" onClick={() => copyToClipboard(data.content)} className="important:p-2 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
              Copy Text
            </Button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Captions */}
        <Card title="Viral Captions" className="h-full">
          <div className="space-y-4">
            {data.captions.map((caption, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between gap-4 items-start group hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-600 italic">"{caption}"</p>
                <button 
                  onClick={() => copyToClipboard(caption)}
                  className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                  title="Copy caption"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Visual Guide */}
        <Card title="Visual Direction" className="h-full important:bg-gray-900 important:border-gray-900">
           <div className="flex flex-col justify-between">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Scene Description</h4>
                <p className="text-gray-600 italic border-l-2 border-white pl-4">
                  {data.visual_guide || "No specific visual guide provided. Use high-energy, fast-paced cuts."}
                </p>
              </div>
              
              {data.cta && (
                <div className="mt-4 p-4 bg-gray-50 border border-white/10 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Recommended CTA</span>
                  <p className="font-bold text-gray-400 mt-1 text-lg">{data.cta}</p>
                </div>
              )}
           </div>
        </Card>
      </div>

      {/* Hashtags & Keywords */}
      <Card>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {data.hashtags.map((tag, i) => (
                <Badge key={i}>#{tag.replace(/^#/, '')}</Badge>
              ))}
              <button 
                onClick={() => copyToClipboard(data.hashtags.join(' '))}
                className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors border border-gray-200"
              >
                Copy All
              </button>
            </div>
          </div>
          
          {data.keywords && data.keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">SEO Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {data.keywords.map((kw, i) => (
                  <span key={i} className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
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
        <Card title="Alternative Version (A/B Test)" className="border-l-4 border-l-gray-900">
           <p className="whitespace-pre-wrap text-gray-700">{data.alt_version}</p>
        </Card>
      )}

      <div className="h-12"></div>
    </div>
  );
};

export default ResultView;
