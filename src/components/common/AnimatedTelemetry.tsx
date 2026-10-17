import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Animated ECG Waveform Monitor with live BPM telemetry and pulsing heart
 */
export const LiveECGMonitor: React.FC<{
  bpm?: number;
  label?: string;
  status?: 'normal' | 'tachycardia' | 'alert';
  compact?: boolean;
}> = ({
  bpm = 74,
  label = 'Normal Sinus Rhythm',
  status = 'normal',
  compact = false
}) => {
  const [currentBpm, setCurrentBpm] = useState(bpm);

  // Subtle natural clinical variation in BPM (+/- 1-2 beats)
  useEffect(() => {
    const interval = setInterval(() => {
      const variance = (Math.random() - 0.5) * 3;
      setCurrentBpm(Math.round(bpm + variance));
    }, 3200);
    return () => clearInterval(interval);
  }, [bpm]);

  const colorScheme = {
    normal: {
      text: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      stroke: '#0D9488',
      glow: 'rgba(13, 148, 136, 0.3)',
      dot: 'bg-teal-500'
    },
    tachycardia: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      stroke: '#D97706',
      glow: 'rgba(217, 119, 6, 0.3)',
      dot: 'bg-amber-500'
    },
    alert: {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      stroke: '#E11D48',
      glow: 'rgba(225, 29, 72, 0.3)',
      dot: 'bg-rose-500'
    }
  }[status];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${colorScheme.bg} border ${colorScheme.border} text-xs font-medium`}>
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorScheme.dot} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${colorScheme.dot}`} />
        </span>
        <Heart className={`w-3.5 h-3.5 ${colorScheme.text} animate-heartbeat`} />
        <span className="font-mono font-bold text-slate-800">{currentBpm}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">BPM</span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-2xl ${colorScheme.bg} border ${colorScheme.border} shadow-xs relative overflow-hidden`}>
      {/* Subtle background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '12px 12px'
        }}
      />

      <div className="flex items-center justify-between mb-1.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className={`absolute w-5 h-5 rounded-full ${colorScheme.bg} animate-pulse-ring`} />
            <Heart className={`w-4 h-4 ${colorScheme.text} animate-heartbeat relative z-10`} />
          </div>
          <span className="text-xs font-bold text-slate-800 font-display">{label}</span>
        </div>
        <div className="flex items-baseline gap-1 font-mono">
          <motion.span 
            key={currentBpm}
            initial={{ scale: 1.15, color: '#0F766E' }}
            animate={{ scale: 1, color: '#0F172A' }}
            transition={{ duration: 0.3 }}
            className="text-base font-extrabold"
          >
            {currentBpm}
          </motion.span>
          <span className="text-[10px] text-slate-500 font-medium">BPM</span>
        </div>
      </div>

      {/* Dynamic Animated ECG Path */}
      <div className="relative h-8 w-full overflow-hidden flex items-center">
        <svg 
          viewBox="0 0 240 40" 
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          {/* Faded background trail */}
          <path
            d="M 0,20 L 30,20 L 35,22 L 40,18 L 45,20 L 70,20 L 75,25 L 80,4 L 85,36 L 90,16 L 95,22 L 100,20 L 130,20 L 135,22 L 140,18 L 145,20 L 170,20 L 175,25 L 180,4 L 185,36 L 190,16 L 195,22 L 200,20 L 240,20"
            fill="none"
            stroke={colorScheme.stroke}
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
          {/* Animated active pulse stroke */}
          <path
            d="M 0,20 L 30,20 L 35,22 L 40,18 L 45,20 L 70,20 L 75,25 L 80,4 L 85,36 L 90,16 L 95,22 L 100,20 L 130,20 L 135,22 L 140,18 L 145,20 L 170,20 L 175,25 L 180,4 L 185,36 L 190,16 L 195,22 L 200,20 L 240,20"
            fill="none"
            stroke={colorScheme.stroke}
            strokeWidth="2"
            className="ecg-stroke"
          />
        </svg>

        {/* Traveling light beam scanner */}
        <motion.div
          animate={{ x: ['-20%', '120%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 bottom-0 w-12 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${colorScheme.glow}, transparent)`
          }}
        />
      </div>
    </div>
  );
};

/**
 * CareLoop Radar Scanner Visualizer
 */
export const AnimatedCareRadar: React.FC<{
  activeGapsCount: number;
  totalMonitored: number;
  onScanClick?: () => void;
}> = ({
  activeGapsCount,
  totalMonitored,
  onScanClick
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2400);
    onScanClick?.();
  };

  return (
    <div className="relative flex items-center gap-3 p-3 bg-white/90 backdrop-blur-xs rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
      {/* Radar dish with animated concentric rings */}
      <div 
        onClick={triggerScan}
        className="relative w-12 h-12 rounded-full bg-teal-900 flex items-center justify-center cursor-pointer group shrink-0 overflow-hidden"
        title="Click to trigger Live CareLoop Radar Scan"
      >
        {/* Animated concentric waves */}
        <div className="absolute inset-0 rounded-full border border-teal-400/40 animate-radar-wave" />
        <div 
          className="absolute inset-0 rounded-full border border-teal-300/30 animate-radar-wave"
          style={{ animationDelay: '1s' }} 
        />
        <div 
          className="absolute inset-0 rounded-full border border-emerald-400/20 animate-radar-wave"
          style={{ animationDelay: '2s' }} 
        />

        {/* Radar sweeping beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: isScanning ? 1.2 : 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 origin-center pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(45, 212, 191, 0.45) 360deg)'
          }}
        />

        {/* Center dot / blip */}
        <div className="relative z-10 w-3 h-3 rounded-full bg-teal-300 shadow-sm flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-900" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800 font-display">CareLoop Radar</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-semibold">
            {isScanning ? 'Scanning...' : 'Live Engine'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
          <span className="font-semibold text-teal-700">{activeGapsCount} active gaps</span> flagged among {totalMonitored} patients
        </p>
      </div>

      <button
        onClick={triggerScan}
        disabled={isScanning}
        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-all active:scale-95 shrink-0"
      >
        {isScanning ? 'Analyzing...' : 'Scan'}
      </button>
    </div>
  );
};

/**
 * Animated Counter Component for delightful number rollups
 */
export const AnimatedCounter: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}> = ({ value, prefix = '', suffix = '', className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * value);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {prefix && <span>{prefix}</span>}
      <motion.span
        key={value}
        initial={{ opacity: 0.8, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {displayValue.toLocaleString()}
      </motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};

/**
 * Particle celebration effect triggered on successful resolution or sign-off
 */
export const CelebrationBurst: React.FC<{
  show: boolean;
  message?: string;
  onComplete?: () => void;
}> = ({ show, message = 'Care Gap Resolved Successfully!', onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-teal-300/40 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold font-display">{message}</p>
              <p className="text-[11px] text-teal-100">Care continuity closed · Audit trail locked</p>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
