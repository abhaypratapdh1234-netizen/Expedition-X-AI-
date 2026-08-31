import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Link2, Mail, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export function BlogPostPage() {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);

  const getArticle = (s: string) => {
    if (s.includes('eco-tourism')) {
      return {
        title: 'The Rise of "Off-the-Grid" Eco-Tourism in 2026',
        category: 'Travel Trends',
        date: 'July 02, 2026',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1542314831-c6a4d1421008?auto=format&fit=crop&q=80',
        author: {
          name: 'Elena Rodriguez',
          role: 'Sustainable Travel Lead',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80'
        },
        content: `
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8 first-letter:text-7xl first-letter:font-bold first-letter:text-[#FC6C26] first-letter:mr-3 first-letter:float-left first-line:uppercase first-line:tracking-widest">
            The world is changing, and so is the way we travel. Mass tourism in overcrowded capitals is giving way to a profound desire for untouched, remote landscapes.
          </p>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            As climate awareness reaches an all-time high in 2026, travelers are no longer just looking to offset emissions; they want completely carbon-neutral experiences built directly into their itineraries. Our predictive AI models have analyzed global search sentiment, historical climate data, and emerging local infrastructures to determine where eco-conscious travelers are heading next.
          </p>
          
          <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">The Top 10 Emerging Eco-Destinations</h2>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            Based on our machine learning predictions, here are the top 10 remote, off-the-grid destinations that will define eco-tourism this year:
          </p>
          
          <div class="mb-12">
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">1. The Faroe Islands (Denmark)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">Pioneering a "closed for maintenance" initiative, the Faroes are setting the gold standard for regenerative tourism. Expect wind-powered luxury cabins built into the hillsides.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">2. Azores Archipelago (Portugal)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">These volcanic islands in the mid-Atlantic are operating almost entirely on geothermal energy. Our AI predicts a 140% spike in wellness retreats here.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">3. Bhutan's Phobjikha Valley</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">Bhutan remains the only carbon-negative country in the world. New eco-trails are opening for the first time in a decade, strictly regulated for zero-impact hiking.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">4. Stewart Island (New Zealand)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">With 85% of the island protected as a national park, this dark-sky sanctuary is becoming the ultimate destination for astro-tourism and kiwi spotting.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">5. Svalbard (Norway)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">Despite its harsh climate, new solar-powered eco-lodges are offering unprecedented, silent electric-boat tours of the arctic fjords.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">6. The Cardamom Mountains (Cambodia)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">Conservation-led tourism is funding the protection of Southeast Asia's largest remaining rainforest. Stay in floating luxury tents that leave zero footprint.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">7. Dominica (Caribbean)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">Dubbed the "Nature Isle," Dominica is on track to become the world's first climate-resilient nation, focusing entirely on boutique, hurricane-proof eco-resorts.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">8. Patagonia's Aysén Region (Chile)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">Less crowded than Torres del Paine, Aysén is seeing a surge in "rewilding" initiatives where tourists actively participate in conservation efforts.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">9. Yakushima (Japan)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">This ancient cedar forest island is implementing strict caps on daily visitors, preserving its mystical atmosphere and delicate moss ecosystems.</p>
            
            <h3 class="text-2xl font-bold font-display text-[#1B2A4A] mb-3">10. The Skeleton Coast (Namibia)</h3>
            <p class="text-[19px] font-medium font-display leading-[1.8] text-[#374151] mb-6">Solar-desalination technology has allowed for the creation of incredibly remote, hyper-luxury desert camps that operate completely off the grid.</p>
          </div>
          
          <blockquote class="border-l-4 border-[#FC6C26] pl-8 my-12 bg-[#FC6C26]/5 p-8 rounded-r-3xl shadow-sm">
            <p class="text-[26px] font-bold font-display text-[#000000] italic leading-relaxed">
              "We've seen a 300% increase in searches for off-grid cabins and hyper-local stays. ExpeditionX now automatically flags the carbon footprint of every itinerary, suggesting sustainable alternatives without compromising comfort."
            </p>
          </blockquote>
        `
      };
    }
    
    if (s.includes('funding')) {
      return {
        title: 'ExpeditionX AI Secures Series B Funding',
        category: 'Company News',
        date: 'June 18, 2026',
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80',
        author: {
          name: 'Marcus Johnson',
          role: 'CEO & Founder',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80'
        },
        content: `
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8 first-letter:text-7xl first-letter:font-bold first-letter:text-[#FC6C26] first-letter:mr-3 first-letter:float-left first-line:uppercase first-line:tracking-widest">
            We are incredibly proud to announce that ExpeditionX has successfully closed a $45 million Series B funding round, led by Sequoia Capital, to expand our real-time booking engine globally.
          </p>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            When we started this journey, our goal was simple: make travel planning effortless. We saw a fractured ecosystem of booking sites, review aggregators, and manual spreadsheets. With this new capital injection, we are accelerating our roadmap to unify the entire travel experience under one intelligent system.
          </p>
          
          <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">Scaling the Global Booking Engine</h2>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            A significant portion of the $45M will be deployed directly into our real-time infrastructure. By Q4 2026, the ExpeditionX engine will natively integrate with over 2.5 million boutique hotels, regional rail networks, and independent tour operators across 150 countries. 
          </p>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            This means zero redirects. You can plan a hyper-personalized, multi-city European train journey and book every single ticket, hotel, and dinner reservation with one seamless checkout flow.
          </p>
          
          <blockquote class="border-l-4 border-[#FC6C26] pl-8 my-12 bg-[#FC6C26]/5 p-8 rounded-r-3xl shadow-sm">
            <p class="text-[26px] font-bold font-display text-[#000000] italic leading-relaxed">
              "The speed at which ExpeditionX's models learn and adapt to user preference is unmatched. They aren't just changing travel; they're redefining hyper-personalization at a global scale."
            </p>
          </blockquote>
          
          <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">Doubling Our AI Engineering Team</h2>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            To achieve this, we are aggressively expanding our engineering hubs in London and Singapore. We are looking for the top 1% of machine learning engineers who want to solve complex, real-world logistical challenges using cutting-edge predictive models.
          </p>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            We want to thank our early adopters and our incredible community for believing in us. The next chapter of ExpeditionX starts today.
          </p>
        `
      };
    }
    
    if (s.includes('solo')) {
      return {
        title: 'The Future of Solo Travel: Safety and AI Companions',
        category: 'Travel Guides',
        date: 'August 12, 2026',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80',
        author: {
          name: 'James Wright',
          role: 'Lead UX Researcher',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80'
        },
        content: `
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8 first-letter:text-7xl first-letter:font-bold first-letter:text-[#FC6C26] first-letter:mr-3 first-letter:float-left first-line:uppercase first-line:tracking-widest">
            Solo travel has exploded in popularity, up nearly 400% since 2024. But venturing into unknown territories alone still carries inherent logistical and safety challenges.
          </p>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            Historically, solo travelers relied heavily on disjointed forums and outdated blogs for safety tips. At ExpeditionX, we realized that true empowerment comes from hyper-localized, real-time intelligence.
          </p>
          
          <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">Predictive Safety Routing</h2>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            Our latest app update introduces Predictive Safety Routing. By analyzing local news feeds, historical crime statistics, and real-time crowd density via anonymized cellular data, our maps automatically highlight the safest, most well-lit walking routes back to your hotel after dark.
          </p>
          
          <blockquote class="border-l-4 border-[#FC6C26] pl-8 my-12 bg-[#FC6C26]/5 p-8 rounded-r-3xl shadow-sm">
            <p class="text-[26px] font-bold font-display text-[#000000] italic leading-relaxed">
              "We don't just want to tell you where to go. We want to ensure you feel 100% confident and secure getting there, no matter what language you speak."
            </p>
          </blockquote>
          
          <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">Real-Time Translation Companions</h2>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            Beyond navigation, our new AI Audio Companion functions as a seamless, latency-free translator. Built directly into your wireless earbuds, it allows for natural, conversational translation, breaking down the final barriers of solo exploration.
          </p>
        `
      };
    }

    if (s.includes('pricing') || s.includes('algorithms')) {
      return {
        title: 'Demystifying Dynamic Pricing: Hacking Flight Algorithms',
        category: 'Engineering',
        date: 'August 05, 2026',
        readTime: '12 min read',
        image: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&q=80',
        author: {
          name: 'Sarah Chen',
          role: 'Head of AI Engineering',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'
        },
        content: `
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8 first-letter:text-7xl first-letter:font-bold first-letter:text-[#FC6C26] first-letter:mr-3 first-letter:float-left first-line:uppercase first-line:tracking-widest">
            If you've ever watched a flight price jump $200 in the time it took you to text your friends for approval, you have been a victim of dynamic pricing.
          </p>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            Airlines use sophisticated machine learning models to adjust inventory prices based on hundreds of factors: your browsing history, regional demand surges, and even the battery percentage on your device. We decided to build a model that beats them at their own game.
          </p>
          
          <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">The Price-Prediction Engine</h2>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            Our proprietary algorithm reverse-engineers OTA pricing strategies. By tracking inventory release patterns across global distribution systems (GDS), ExpeditionX can predict with 94% accuracy whether a flight price will drop in the next 72 hours.
          </p>
          
          <blockquote class="border-l-4 border-[#FC6C26] pl-8 my-12 bg-[#FC6C26]/5 p-8 rounded-r-3xl shadow-sm">
            <p class="text-[26px] font-bold font-display text-[#000000] italic leading-relaxed">
              "We fundamentally believe that technology should serve the traveler, not the corporation. Our pricing engine levels the playing field."
            </p>
          </blockquote>
          
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            When you search for a route on ExpeditionX, we don't just show you the current price; we show you the projected price curve. If our AI detects an impending drop, we offer a 'Lock & Wait' feature, automatically securing the ticket the moment the algorithm hits the floor price.
          </p>
        `
      };
    }

    if (s.includes('culinary')) {
      return {
        title: 'Culinary Tourism: Mapping Hidden Street Food Stalls',
        category: 'Travel Trends',
        date: 'July 28, 2026',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80',
        author: {
          name: 'David Kim',
          role: 'Content Strategist',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80'
        },
        content: `
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8 first-letter:text-7xl first-letter:font-bold first-letter:text-[#FC6C26] first-letter:mr-3 first-letter:float-left first-line:uppercase first-line:tracking-widest">
            Forget Michelin stars and heavily sponsored Instagram traps. The soul of a city's culinary scene is found in its hidden street food stalls, often operating without a digital footprint.
          </p>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            The problem? Finding these spots usually requires insider knowledge or sheer luck. We wanted to systematize the discovery of authentic, local gastronomy without ruining its charm.
          </p>
          
          <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">Sentiment Analysis on Hyper-Local Forums</h2>
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            ExpeditionX deployed natural language processing (NLP) models to crawl hyper-local message boards, regional social media platforms, and native-language food blogs in cities like Bangkok, Oaxaca, and Taipei. 
          </p>
          
          <blockquote class="border-l-4 border-[#FC6C26] pl-8 my-12 bg-[#FC6C26]/5 p-8 rounded-r-3xl shadow-sm">
            <p class="text-[26px] font-bold font-display text-[#000000] italic leading-relaxed">
              "By analyzing the cadence and passion of local reviews—ignoring tourist platforms entirely—we successfully mapped over 14,000 previously undocumented street food vendors."
            </p>
          </blockquote>
          
          <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
            Now, when you generate an itinerary in ExpeditionX and flag your preference as 'Foodie', the AI will seamlessly route you past these hidden gems, complete with translation guides for ordering the exact off-menu specialties the locals rave about.
          </p>
        `
      };
    }
    
    return {
      title: 'How AI is Rewriting the Rules of Travel Planning',
      category: 'Product',
      date: 'July 10, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80',
      author: {
        name: 'Sarah Chen',
        role: 'Head of AI Engineering',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'
      },
      content: `
        <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8 first-letter:text-7xl first-letter:font-bold first-letter:text-[#FC6C26] first-letter:mr-3 first-letter:float-left first-line:uppercase first-line:tracking-widest">
          The days of scrolling through 15 different browser tabs, comparing prices across three monitors, and building complex Excel spreadsheets just to plan a weekend getaway are officially over.
        </p>
        
        <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">Why Rule-Based Planning is Obsolete</h2>
        <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
          Historically, online travel agencies (OTAs) relied on rigid, rule-based engines. You put in your dates and your destination, and it spit out a list of flights and hotels sorted by price or a generic "recommended" score. But travel isn't a math problem—it's a deeply human experience.
        </p>
        <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
          A rule-based engine cannot understand nuance. It doesn't know that you're willing to take a slightly more expensive flight if it means arriving in time for a sunset dinner. It doesn't know you prefer boutique hotels over massive resorts, unless you manually check a dozen filters.
        </p>
        
        <blockquote class="border-l-4 border-[#FC6C26] pl-8 my-12 bg-[#FC6C26]/5 p-8 rounded-r-3xl shadow-sm">
          <p class="text-[26px] font-bold font-display text-[#000000] italic leading-relaxed">
            "An itinerary that is perfect for a 20-something backpacker is a nightmare for a family of four. Our machine learning models finally allow us to understand the nuance of human preference at scale."
          </p>
        </blockquote>
        
        <h2 class="text-4xl font-bold font-display text-[#000000] tracking-tight mt-16 mb-8">The Predictive Machine Learning Edge</h2>
        <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
          At ExpeditionX, we've replaced rigid rules with adaptive neural networks. Our models analyze millions of data points concurrently: live weather patterns, hyper-local event schedules, historical wait times at attractions, and real-time social sentiment. 
        </p>
        <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
          Imagine arriving in Rome. Instead of a generic top-10 list, your AI assistant knows you love Renaissance art but hate crowds, prefer boutique coffee shops, and have a budget of €150/day. It automatically routes you through a lesser-known gallery during its quietest hour, books a table at a local trattoria, and adjusts the entire schedule dynamically in real-time if it starts raining.
        </p>
        
        <p class="text-[21px] font-medium font-display leading-[1.9] text-[var(--text-primary)] mb-8">
          This isn't the future of travel. This is what we are deploying today. Welcome to the era of effortlessly intelligent exploration.
        </p>
      `
    };
  };

  const article = getArticle(slug || '');

  return (
    <div className="min-h-screen pt-24 pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[15px] font-extrabold font-display text-[#1B2A4A] hover:text-[#FC6C26] transition-colors">
            <ArrowLeft size={16} /> Back to Journal
          </Link>
        </div>

        {/* Article Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-extrabold font-display mb-6 bg-[var(--bg-card)] text-[#1B2A4A] shadow-sm">
            {article.category}
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 tracking-tight text-[#000000] leading-[1.1]">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-[15px] font-bold font-display text-[var(--text-secondary)]">
            <div className="flex items-center gap-3">
              <img src={article.author.avatar} alt={article.author.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
              <div className="text-left">
                <div className="text-[#1B2A4A]">{article.author.name}</div>
                <div className="text-[13px] font-medium">{article.author.role}</div>
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <span className="flex items-center gap-1.5"><Calendar size={16} /> {article.date}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <span className="flex items-center gap-1.5"><Clock size={16} /> {article.readTime}</span>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full aspect-[21/9] md:aspect-[2.5/1] rounded-[32px] overflow-hidden mb-16 shadow-xl"
        >
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Article Body */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Social Share Sidebar */}
          <div className="hidden md:flex flex-col gap-4 sticky top-32 h-fit">
            <span className="text-[13px] font-extrabold font-display text-[var(--text-secondary)] uppercase tracking-wider mb-2">Share</span>
            
            <button 
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({ title: article.title, url: window.location.href });
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                } catch (e) { console.log(e); }
              }}
              className="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[#1B2A4A] hover:bg-[#FC6C26] hover:text-white transition-colors shadow-sm"
              title="Share Article"
            >
              <Share2 size={18} />
            </button>

            <button 
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch (e) { console.log(e); }
              }}
              className="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[#1B2A4A] hover:bg-[#FC6C26] hover:text-white transition-colors shadow-sm"
              title="Copy Link"
            >
              {copied ? <Check size={18} /> : <Link2 size={18} />}
            </button>

            <button 
              onClick={() => {
                const subject = encodeURIComponent(article.title);
                const body = encodeURIComponent(`Read this amazing article on ExpeditionX:\n\n${window.location.href}`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
              }}
              className="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[#1B2A4A] hover:bg-[#FC6C26] hover:text-white transition-colors shadow-sm"
              title="Email Article"
            >
              <Mail size={18} />
            </button>
          </div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
        
      </div>
    </div>
  );
}
