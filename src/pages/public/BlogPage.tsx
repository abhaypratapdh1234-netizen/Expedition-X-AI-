import React from 'react';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function BlogPage() {
  const posts = [
    {
      title: 'How AI is Rewriting the Rules of Travel Planning',
      category: 'Product',
      date: 'July 10, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80',
      excerpt: 'Discover the machine learning models behind our hyper-personalized itineraries and why rule-based planning is obsolete.'
    },
    {
      title: 'The Rise of "Off-the-Grid" Eco-Tourism in 2026',
      category: 'Travel Trends',
      date: 'July 02, 2026',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80',
      excerpt: 'Travelers are increasingly seeking remote, carbon-neutral destinations. Here are the top 10 spots our AI predicts will trend.'
    },
    {
      title: 'ExpeditionX AI Secures Series B Funding',
      category: 'Company News',
      date: 'June 18, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80',
      excerpt: 'We are thrilled to announce a $45M investment round led by Sequoia Capital to expand our real-time booking engine globally.'
    },
    {
      title: 'The Future of Solo Travel: Safety and AI Companions',
      category: 'Travel Guides',
      date: 'August 12, 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80',
      excerpt: 'Solo travel is up 400% since 2024. Discover how real-time AI translation and predictive safety routing empower adventurers.'
    },
    {
      title: 'Demystifying Dynamic Pricing: Hacking Flight Algorithms',
      category: 'Engineering',
      date: 'August 05, 2026',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&q=80',
      excerpt: 'A deep dive into how airlines use machine learning to adjust prices, and how our proprietary price-prediction engine beats them.'
    },
    {
      title: 'Culinary Tourism: Mapping Hidden Street Food Stalls',
      category: 'Travel Trends',
      date: 'July 28, 2026',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80',
      excerpt: 'Forget Michelin stars. Our sentiment models crawled millions of local language reviews to map the absolute best street food globally.'
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[16px] font-bold font-display mb-8 text-[#000000] border-2 border-[#000000]/10 shadow-sm"
            style={{ background: 'var(--bg-card)' }}>
            <BookOpen size={18} className="text-[#FC6C26]" /> ExpeditionX Journal
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-8 tracking-tight text-[#000000] leading-[1.1]">
            Insights for the modern explorer.
          </h1>
          <p className="text-[24px] font-medium font-display max-w-3xl mx-auto text-[var(--text-primary)] leading-[1.7]">
            Engineering deep dives, travel guides, company news, and thoughts on the intersection of AI and exploration.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => {
            const slug = post.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return (
              <Link to={`/blog/${slug}`} key={post.title} className="block h-full">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer rounded-3xl overflow-hidden flex flex-col h-full"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
                >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-5 left-5 px-5 py-2 rounded-full text-[14px] font-bold font-display bg-[var(--bg-card)] text-[#000000] shadow-md border-2 border-transparent group-hover:border-[#000000] transition-colors">
                  {post.category}
                </div>
              </div>
              <div className="p-10 flex flex-col flex-1 bg-[var(--bg-card)]">
                <div className="flex items-center gap-4 text-[15px] font-bold font-display mb-5 text-[#000000]">
                  <span className="flex items-center gap-1.5"><Calendar size={16} className="text-[#000000]" /> {post.date}</span>
                  <span className="text-[#000000] px-2 py-0.5 rounded-md bg-gray-100">{post.readTime}</span>
                </div>
                <h3 className="text-[32px] font-bold font-display mb-5 text-[#000000] tracking-tight group-hover:underline" style={{ lineHeight: 1.2 }}>
                  {post.title}
                </h3>
                <p className="mb-8 flex-1 text-[20px] font-bold font-display leading-[1.8] text-[#000000]">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 font-bold text-[18px] font-display text-[#000000] mt-auto uppercase tracking-wide">
                  Read Article <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
