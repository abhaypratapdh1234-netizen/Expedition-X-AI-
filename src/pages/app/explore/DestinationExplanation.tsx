import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Info, Star } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { t } from '../../../utils/formatters';

export function DestinationExplanation({ placeName }: { placeName: string }) {
  const [explanation, setExplanation] = useState<string>('');
  const [facts, setFacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useSettingsStore();

  useEffect(() => {
    async function fetchWikiDetails() {
      setLoading(true);
      try {
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=0&explaintext=1&titles=${encodeURIComponent(placeName)}`);
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId && pageId !== '-1') {
            const extract = pages[pageId].extract;
            if (extract) {
              // Extract a good explanation (first 2-3 paragraphs)
              const paragraphs = extract.split('\n').filter((p: string) => p.trim().length > 50 && !p.includes('=='));
              if (paragraphs.length > 0) {
                setExplanation(paragraphs.slice(0, 3).join('\n\n'));
              }
              
              // Extract interesting facts based on keywords
              const sentences = extract.split('. ');
              const factCandidates = sentences.filter((s: string) => 
                s.toLowerCase().includes('first') || 
                s.toLowerCase().includes('largest') || 
                s.toLowerCase().includes('oldest') || 
                s.toLowerCase().includes('built in') || 
                s.toLowerCase().includes('known for') || 
                s.toLowerCase().includes('million')
              );
              
              setFacts(factCandidates.slice(0, 4).map((f: string) => f.trim() + (f.endsWith('.') ? '' : '.')));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch explanation', err);
      }
      setLoading(false);
    }
    
    if (placeName) {
      fetchWikiDetails();
    }
  }, [placeName]);

  if (loading) {
    return (
      <div className="mt-8 animate-pulse rounded-[2rem] bg-bg-card border border-border-subtle p-8 shadow-card flex gap-4">
        <div className="w-10 h-10 bg-bg-secondary rounded-full shrink-0"></div>
        <div className="space-y-3 flex-1 pt-2">
          <div className="h-4 bg-bg-secondary rounded w-full"></div>
          <div className="h-4 bg-bg-secondary rounded w-5/6"></div>
          <div className="h-4 bg-bg-secondary rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-teal-500 tracking-tight">
        {t('Discover', language)} {placeName}
      </h3>
      
      <div className="p-6 sm:p-8 rounded-[2rem] bg-bg-card border border-border-subtle shadow-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-opacity duration-700"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:opacity-100 opacity-50 transition-opacity duration-700"></div>
        
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex gap-4 sm:gap-6">
            <div className="mt-1 w-12 h-12 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-teal-100/60">
              <Info size={24} />
            </div>
            <div className="space-y-4 pt-1">
              {explanation.split('\n\n').map((para, i) => (
                <p key={i} className="text-[1.05rem] text-[var(--text-secondary)] leading-[1.8] font-medium tracking-wide">
                  {para}
                </p>
              ))}
            </div>
          </div>
          
          {facts.length > 0 && (
            <div className="pt-6 border-t border-border-subtle">
              <h4 className="flex items-center gap-2 font-bold text-lg text-[var(--text-primary)] mb-5">
                <Sparkles size={20} className="text-amber-500" /> 
                {t('Interesting Facts', language)}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facts.map((fact, i) => (
                  <motion.li 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-start gap-3 bg-bg-secondary/50 hover:bg-bg-secondary p-4 rounded-xl transition-colors border border-transparent hover:border-border-subtle"
                  >
                    <Star size={16} className="text-amber-500 mt-1 shrink-0" fill="currentColor" />
                    <span className="text-[0.95rem] font-medium text-[var(--text-secondary)] leading-relaxed">{fact}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
