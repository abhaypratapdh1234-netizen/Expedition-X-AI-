import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scaleY, setScaleY] = useState(1);
  const textRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);





  useEffect(() => {
    const calculateScale = () => {
      if (textRef.current) {
        const height = textRef.current.offsetHeight;
        if (height > 0) {
          setScaleY((window.innerHeight / height) * 1.4);
        }
      }
    };
    setTimeout(calculateScale, 10);
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = ["About Us", "Programs", "Reviews", "FAQ", "Contacts"];

  return (
    <div 
      className="w-full h-screen overflow-hidden flex flex-col font-['Inter'] relative"
      style={{ background: 'linear-gradient(to bottom, #FF8233, #FDAC55)' }}
    >
      {/* Background 404 Text Effect */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-80"
        style={{ 
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 95%)'
        }}
      >
        <h1
          ref={textRef}
          className="text-white font-bold leading-none tracking-tight whitespace-nowrap absolute"
          style={{
            fontSize: 'clamp(200px, 48vw, 800px)',
            transform: `scale(1.15, ${scaleY * 1.4})`,
            transformOrigin: 'center'
          }}
        >
          404
        </h1>
        <div
          className="bg-[var(--bg-card)] rounded-full absolute h-[22vh] sm:h-[26vh] md:h-[50vh]"
          style={{
            width: 'clamp(120px, 20vw, 400px)',
            transform: `scaleY(${scaleY})`,
            transformOrigin: 'center'
          }}
        />
      </div>



      {/* Center Video (Bulletproof Lifetime Fix) */}
      <div 
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none mix-blend-multiply"
        style={{ marginTop: 'calc(-6vh - 40px)' }}
      >
        <div className="w-[120vw] h-[85vh] sm:w-[70vw] sm:h-[70vh] md:w-[62vw] md:h-[78vh]">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-contain"
            src="/fox.mp4"
          />
        </div>
      </div>

      {/* Bottom Content */}
      <div className="relative z-30 mt-auto pb-8 sm:pb-16 flex flex-col items-center text-center px-4">
        <h2 className="text-white text-lg sm:text-xl md:text-2xl font-medium mb-3 sm:mb-4">
          Oops, something went wrong!
        </h2>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base hover:scale-105 hover:shadow-lg transition-all"
          style={{ backgroundColor: '#F16524' }}
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Home
        </a>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full sm:w-[380px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ background: 'linear-gradient(135deg, #FF6B1A 0%, #FF9642 100%)' }}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-end mb-12">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-[var(--bg-card)]/20 text-white hover:bg-[var(--bg-card)]/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <a
                  key={link}
                  href="#"
                  className={`px-6 py-4 text-lg font-semibold text-white rounded-2xl bg-[var(--bg-card)]/10 hover:bg-[var(--bg-card)]/20 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: isMenuOpen ? `${150 + i * 60}ms` : '0ms' }}
                >
                  {link}
                </a>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <a
                href="/"
                className={`w-full py-4 rounded-full bg-[var(--bg-card)] font-semibold text-base flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300 ${
                  isMenuOpen ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  color: '#F16524',
                  transitionDelay: isMenuOpen ? '450ms' : '0ms'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServerErrorPage() {
  return <NotFoundPage />;
}
