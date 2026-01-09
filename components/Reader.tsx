import React, { useEffect } from 'react';
import { Chapter, User } from '../types';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface ReaderProps {
  chapter: Chapter;
  user: User | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ chapter, user, onClose, onNext, onPrev }) => {
  // Protection Logic
  useEffect(() => {
    const handleContext = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen (some browsers) or Inspect Element shortcuts
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || e.key === 'F12') {
        e.preventDefault();
        alert('وێنەگرتنی شاشە ڕێگەپێدراو نییە!');
      }
    };

    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const canView = !chapter.isPremium || (user && (user.isPremium || user.role !== 'user'));

  if (!canView) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4">
        <Lock size={64} className="text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">ئەم بەشە پریمیۆمە</h2>
        <p className="text-slate-400 mb-6 text-center">تکایە ئەکاونتەکەت بکە بە پریمیۆم بۆ بینینی ئەم بەشە.</p>
        <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg text-white">
          گەڕانەوە
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto select-none no-context-menu">
      {/* Top Bar */}
      <div className="sticky top-0 bg-slate-900/90 backdrop-blur p-4 flex justify-between items-center z-20 border-b border-slate-800">
        <div className="flex gap-2">
            <button onClick={onClose} className="text-white hover:text-indigo-400 text-sm md:text-base">داخستن ✕</button>
        </div>
        <h3 className="text-white font-medium truncate max-w-[50%]">{chapter.title}</h3>
        <div className="flex gap-2">
          <button 
            disabled={!onPrev} 
            onClick={onPrev} 
            className="p-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-30 text-white"
          >
            <ArrowRight size={20} />
          </button>
          <button 
            disabled={!onNext} 
            onClick={onNext} 
            className="p-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-30 text-white"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="max-w-3xl mx-auto relative min-h-screen bg-neutral-900">
        {chapter.pages.map((url, idx) => (
          <div key={idx} className="relative w-full">
            {/* Image */}
            <img 
              src={url} 
              alt={`Page ${idx + 1}`} 
              className="w-full h-auto block pointer-events-none" 
              loading="lazy"
            />
            
            {/* Watermark Overlay Grid */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 pointer-events-none overflow-hidden opacity-20 z-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-center transform -rotate-45">
                  <span className="text-slate-500 text-xl font-bold whitespace-nowrap">
                    KurdManhua - {user?.email || 'Guest'}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Transparent blocker to prevent drag/save */}
            <div className="absolute inset-0 z-20"></div>
          </div>
        ))}

        {/* Bottom Navigation Area */}
        <div className="p-8 flex flex-col items-center justify-center gap-4 bg-slate-900 text-white">
          <p className="text-slate-400">کۆتایی بەش</p>
          <div className="flex gap-4">
            {onPrev && (
               <button onClick={onPrev} className="px-6 py-2 bg-slate-800 rounded hover:bg-slate-700">بەشی پێشوو</button>
            )}
             {onNext && (
               <button onClick={onNext} className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-500">بەشی داهاتوو</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};