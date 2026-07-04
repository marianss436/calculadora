import { useRef, useEffect } from 'react';
import { Theme } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Binary, Sparkles } from 'lucide-react';

interface CalculatorDisplayProps {
  expression: string;
  displayValue: string;
  isFinished: boolean;
  currentTheme: Theme;
  soundEnabled: boolean;
  onToggleSound: () => void;
  scientificEnabled: boolean;
  onToggleScientific: () => void;
}

export default function CalculatorDisplay({
  expression,
  displayValue,
  isFinished,
  currentTheme,
  soundEnabled,
  onToggleSound,
  scientificEnabled,
  onToggleScientific,
}: CalculatorDisplayProps) {
  const displayEndRef = useRef<HTMLDivElement>(null);
  const exprEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to the end of expression and display value when they change,
  // preventing text overflow on long equations.
  useEffect(() => {
    displayEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
  }, [displayValue]);

  useEffect(() => {
    exprEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
  }, [expression]);

  return (
    <div className={`p-5 rounded-2xl ${currentTheme.displayBg} transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[150px] shadow-inner border ${currentTheme.cardBorder}`}>
      
      {/* Theme specific vintage overlay effects */}
      {currentTheme.id === 'retro' && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(18,18,18,0.05)_1px,transparent_1px)] [background-size:4px_4px] opacity-40"></div>
      )}
      {currentTheme.id === 'terminal' && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]"></div>
      )}
      {currentTheme.id === 'cyberpunk' && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(244,63,94,0.1)_95%)] bg-[size:100%_20px]"></div>
      )}

      {/* Screen Header Indicators */}
      <div className="flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-2">
          {/* Scientific Mode Indicator Badge */}
          <button
            onClick={onToggleScientific}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
              scientificEnabled
                ? `${currentTheme.badgeBg} ${currentTheme.badgeText}`
                : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
            }`}
            id="toggle-scientific-screen-badge"
          >
            <Binary className="w-3 h-3" />
            <span>CIENTÍFICA</span>
          </button>
          
          {isFinished && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>RESUELTO</span>
            </motion.div>
          )}
        </div>

        {/* Audio click indicator toggle */}
        <button
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
            soundEnabled
              ? `${currentTheme.badgeBg} ${currentTheme.badgeText}`
              : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
          }`}
          title={soundEnabled ? "Desactivar sonido táctil" : "Activar sonido táctil"}
          id="toggle-sound-btn"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Mathematical expression line */}
      <div className="text-right z-10 w-full overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        <div className="inline-flex min-w-full justify-end pr-1">
          <span className={`text-sm md:text-base font-medium tracking-wide ${currentTheme.displaySubtext}`}>
            {expression || ' '}
          </span>
          <div ref={exprEndRef} />
        </div>
      </div>

      {/* Main digits output line */}
      <div className="text-right z-10 w-full overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="inline-flex min-w-full justify-end items-baseline pr-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={displayValue + (isFinished ? '-done' : '-typing')}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-3xl md:text-4xl font-bold tracking-tight ${currentTheme.displayText}`}
            >
              {displayValue}
            </motion.span>
          </AnimatePresence>
          
          {/* Glowing Cursor for Terminal/Cyberpunk style */}
          {(currentTheme.id === 'terminal' || currentTheme.id === 'cyberpunk') && !isFinished && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
              className={`w-2 h-7 ml-1 inline-block align-middle ${
                currentTheme.id === 'cyberpunk' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-green-500'
              }`}
            />
          )}
          <div ref={displayEndRef} />
        </div>
      </div>
    </div>
  );
}
