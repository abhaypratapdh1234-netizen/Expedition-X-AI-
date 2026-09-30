import React, { useState } from 'react';
import { Newspaper, Download, PlayCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateMediaKitPdf } from '../../utils/generateMediaKitPdf';

export function PressPage() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await new Promise(r => setTimeout(r, 600));
      generateMediaKitPdf();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[16px] font-bold font-display mb-8 text-[#000000] border-2 border-[#000000]/10 shadow-sm"
            style={{ background: 'var(--bg-card)' }}>
            <Newspaper size={18} className="text-[#FC6C26]" /> Press & Media
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-8 tracking-tight text-[#000000] leading-[1.1]">
            ExpeditionX AI in the news.
          </h1>
          <p className="text-[24px] font-medium font-display max-w-3xl mx-auto text-[var(--text-primary)] leading-[1.7]">
            Everything you need to write about how we're building the intelligence layer for global travel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-12 rounded-[32px] bg-[var(--bg-card)] border-2 border-transparent hover:border-[#000000]/10 transition-all shadow-sm flex flex-col"
          >
            <h3 className="text-[32px] font-bold font-display mb-6 text-[#000000] tracking-tight">Media Kit</h3>
            <p className="mb-10 text-[19px] font-medium font-display leading-[1.8] text-[var(--text-primary)] flex-1">
              Download our official brand assets, including high-res logos, product screenshots, founder headshots, and company fact sheets.
            </p>
            <button 
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-3 bg-[#000000] hover:bg-[#FC6C26] text-white px-8 py-4 rounded-full text-[17px] font-bold font-display uppercase tracking-wider transition-colors shadow-md w-full disabled:opacity-75 cursor-pointer"
            >
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing Brand Kit PDF...</span>
                </>
              ) : downloaded ? (
                <>
                  <Check size={20} className="text-emerald-400" />
                  <span>Brand Kit Downloaded!</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span>Download Brand Kit (PDF)</span>
                </>
              )}
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-12 rounded-[32px] bg-[var(--bg-card)] border-2 border-transparent hover:border-[#000000]/10 transition-all shadow-sm flex flex-col"
          >
            <h3 className="text-[32px] font-bold font-display mb-6 text-[#000000] tracking-tight">Press Inquiries</h3>
            <p className="mb-10 text-[19px] font-medium font-display leading-[1.8] text-[var(--text-primary)] flex-1">
              Working on a story? We are happy to provide quotes, data insights on travel trends, or arrange an interview with our executive team.
            </p>
            <a href="mailto:press@expeditionx.ai" className="inline-flex items-center justify-center gap-3 bg-[#000000] hover:bg-[#FC6C26] text-white px-8 py-4 rounded-full text-[17px] font-bold font-display uppercase tracking-wider transition-colors shadow-md w-full">
              Email press@expeditionx.ai
            </a>
          </motion.div>
        </div>

        <h2 className="text-5xl font-display font-bold mb-14 text-center tracking-tight text-[#000000]">Recent Coverage</h2>
        
        <div className="space-y-6 max-w-5xl mx-auto">
          {[
            { outlet: 'TechCrunch', date: 'June 18, 2026', title: 'ExpeditionX AI raises $45M Series B to automate trip planning.', url: 'https://techcrunch.com/' },
            { outlet: 'Forbes', date: 'May 04, 2026', title: 'The Next Generation of Travel: How AI is taking over the itinerary.', url: 'https://www.forbes.com/' },
            { outlet: 'Bloomberg', date: 'February 22, 2026', title: 'ExpeditionX hits 100,000 active users as travel rebounds.', url: 'https://www.bloomberg.com/' },
          ].map((press, i) => (
            <motion.a 
              href={press.url}
              target="_blank"
              rel="noopener noreferrer"
              key={press.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="group p-8 rounded-3xl flex items-center justify-between cursor-pointer bg-[var(--bg-card)] border-2 border-transparent hover:border-[#000000] transition-all shadow-sm block"
            >
              <div>
                <div className="flex items-center gap-4 mb-3 text-[16px]">
                  <span className="font-bold font-display text-[#000000] uppercase tracking-wider">{press.outlet}</span>
                  <span className="font-bold text-[var(--text-primary)]/60">{press.date}</span>
                </div>
                <h4 className="text-[24px] font-bold font-display text-[#000000] group-hover:text-[#FC6C26] transition-colors tracking-tight">{press.title}</h4>
              </div>
              <PlayCircle size={32} className="text-[#000000] group-hover:text-[#FC6C26] transition-colors" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
