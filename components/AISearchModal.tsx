
import React from 'react';
import { SearchResult } from '../types';
import Button from './Button';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SearchResult | null;
  isLoading: boolean;
}

const AISearchModal: React.FC<AISearchModalProps> = ({ isOpen, onClose, result, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/80 dark:bg-background-dark/90 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">AI Shoe Consultant</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-5/6 animate-pulse"></div>
                <div className="h-20 bg-gray-200 dark:bg-white/10 rounded w-full animate-pulse mt-8"></div>
                <div className="flex items-center justify-center gap-3 py-8">
                  <div className="size-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="size-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="size-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : result ? (
              <>
                <div className="prose dark:prose-invert max-w-none text-charcoal/80 dark:text-white/80 leading-relaxed mb-8">
                  {result.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">{line}</p>
                  ))}
                </div>

                {result.sources.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Verified Sources</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.web?.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-background-alt dark:bg-charcoal border border-border-light dark:border-border-dark rounded-xl hover:border-primary transition-colors group"
                        >
                          <span className="material-symbols-outlined text-sm opacity-50 text-primary">link</span>
                          <span className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                            {source.web?.title || 'External link'}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-12 gap-4">
                <div className="size-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl opacity-30">search_off</span>
                </div>
                <p className="text-center opacity-50 italic">No search results found.</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark flex justify-end">
            <Button variant="primary" onClick={onClose}>Close Insight</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchModal;
