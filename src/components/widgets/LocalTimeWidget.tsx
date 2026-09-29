import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import axios from 'axios';
import { Clock } from 'lucide-react';
import { easeReveal, durations } from '../../motion/tokens';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

interface LocalTimeWidgetProps {
  placeId: string | number;
}

export function LocalTimeWidget({ placeId }: LocalTimeWidgetProps) {
  const [timeData, setTimeData] = useState<any>(null);
  const [localTime, setLocalTime] = useState<Date | null>(null);
  const [userOffset, setUserOffset] = useState<number>(0);

  useEffect(() => {
    // User offset in seconds
    setUserOffset(new Date().getTimezoneOffset() * -60);
    
    const fetchTimezone = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/places/${placeId}/timezone`);
        if (res.data && res.data.status === 'OK') {
          setTimeData(res.data);
          const initialTime = new Date(res.data.formatted);
          setLocalTime(initialTime);
        }
      } catch (err) {
        console.error('Failed to fetch timezone', err);
      }
    };
    fetchTimezone();
  }, [placeId]);

  useEffect(() => {
    if (!localTime) return;
    
    // Tick client side
    const interval = setInterval(() => {
      setLocalTime(prev => prev ? new Date(prev.getTime() + 1000) : null);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [localTime]);

  if (!timeData || !localTime) {
    return (
      <div className="h-16 w-48 rounded-full bg-[var(--bg-card)]/5 backdrop-blur-md animate-pulse border border-white/10" />
    );
  }

  const offsetDiff = timeData.gmtOffset - userOffset;
  const hoursDiff = offsetDiff / 3600;
  const diffText = hoursDiff === 0 
    ? 'Same time as you' 
    : `${Math.abs(hoursDiff)} hours ${hoursDiff > 0 ? 'ahead of' : 'behind'} you`;

  const timeString = localTime.toLocaleTimeString('en-US', { hour12: false });
  const dateString = localTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  // Simple day/night calculation (assuming 6am sunrise, 6pm sunset for MVP if not provided)
  const hour = localTime.getHours();
  const isNight = hour < 6 || hour > 18;
  const arcProgress = (hour % 24) / 24;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.base, ease: easeReveal }}
      className="flex items-center gap-4 bg-[var(--bg-card)]/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2 text-white shadow-xl"
    >
      <div className="relative w-8 h-8 rounded-full border border-white/30 overflow-hidden flex items-center justify-center bg-black/20">
        <motion.div 
          className={`absolute w-3 h-3 rounded-full ${isNight ? 'bg-indigo-400' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'}`}
          style={{ 
            rotate: arcProgress * 360 - 90, 
            transformOrigin: '16px 16px',
            top: '4px', left: '4px'
          }}
        />
        <Clock size={14} className="text-white/50 z-10" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-medium tracking-wider tabular-nums">
            {timeString}
          </span>
          <span className="text-[10px] uppercase font-bold text-white/60 bg-[var(--bg-card)]/10 px-1.5 py-0.5 rounded">
            {timeData.abbreviation}
          </span>
        </div>
        <div className="text-xs text-white/70 font-medium">
          {dateString} • {diffText}
        </div>
      </div>
    </motion.div>
  );
}
