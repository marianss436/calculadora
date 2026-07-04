import { useState, useEffect } from 'react';
import { Theme, HistoryItem, KeyType } from './types';
import { THEMES } from './themes';
import { evaluateExpression } from './evaluator';
import { playClickSound, playSuccessSound, resumeAudioContext } from './audio';
import ThemeSelector from './components/ThemeSelector';
import CalculatorHistory from './components/CalculatorHistory';
import CalculatorDisplay from './components/CalculatorDisplay';
import CalculatorKeys from './components/CalculatorKeys';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, Keyboard, Info, Volume2, Moon, Sun, MonitorPlay } from 'lucide-react';

export default function App() {
  // --- Persistent Preferences ---
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('calc_theme_id');
    const matched = THEMES.find((t) => t.id === saved);
    return matched || THEMES[0];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('calc_sound_enabled');
    return saved !== 'false'; // Default to true
  });

  const [scientificEnabled, setScientificEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('calc_sci_enabled');
    return saved === 'true'; // Default to false
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('calc_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map string dates back to Date objects
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // --- Calculator Engine State ---
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // --- UI Layout State ---
  const [activeMobileTab, setActiveMobileTab] = useState<'calc' | 'themes' | 'history'>('calc');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('calc_theme_id', currentTheme.id);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('calc_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('calc_sci_enabled', String(scientificEnabled));
  }, [scientificEnabled]);

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  // --- Keyboard Shortcuts Support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing shortcuts if typing in an input elsewhere
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key;

      // Number keys
      if (/[0-9]/.test(key)) {
        handleKeyPress(key, 'number');
        e.preventDefault();
      }
      // Decimal point
      else if (key === '.' || key === ',') {
        handleKeyPress('.', 'number');
        e.preventDefault();
      }
      // Operators
      else if (key === '+') {
        handleKeyPress('+', 'operator');
        e.preventDefault();
      } else if (key === '-') {
        handleKeyPress('-', 'operator');
        e.preventDefault();
      } else if (key === '*' || key.toLowerCase() === 'x') {
        handleKeyPress('×', 'operator');
        e.preventDefault();
      } else if (key === '/') {
        handleKeyPress('÷', 'operator');
        e.preventDefault();
      } else if (key === '%') {
        handleKeyPress('%', 'operator');
        e.preventDefault();
      } else if (key === '^') {
        handleKeyPress('^', 'operator');
        e.preventDefault();
      }
      // Parentheses
      else if (key === '(') {
        handleKeyPress('(', 'function');
        e.preventDefault();
      } else if (key === ')') {
        handleKeyPress(')', 'function');
        e.preventDefault();
      }
      // Actions
      else if (key === 'Enter' || key === '=') {
        handleKeyPress('=', 'action');
        e.preventDefault();
      } else if (key === 'Backspace') {
        handleKeyPress('BACKSPACE', 'action');
        e.preventDefault();
      } else if (key === 'Escape') {
        handleKeyPress('AC', 'action');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expression, displayValue, isFinished, soundEnabled]);

  // --- Calculator Key Press Handler ---
  const handleKeyPress = (value: string, type: KeyType) => {
    // Resume audio context upon user interaction if blocked by browser
    resumeAudioContext();

    // Sound effect
    if (soundEnabled) {
      if (value === 'AC') {
        playClickSound('clear');
      } else {
        playClickSound(type);
      }
    }

    // Process key value
    switch (value) {
      case 'AC':
        setExpression('');
        setDisplayValue('0');
        setIsFinished(false);
        break;

      case 'BACKSPACE':
        if (isFinished) {
          setExpression('');
          setDisplayValue('0');
          setIsFinished(false);
        } else {
          // If expression ends with function like "sin(" or "cos(", delete the whole function
          const matchFunc = expression.match(/(sin\(|cos\(|tan\(|log\(|ln\(|√\()$/);
          if (matchFunc) {
            setExpression((prev) => prev.slice(0, -matchFunc[0].length));
          } else {
            setExpression((prev) => prev.trimEnd().slice(0, -1).trimEnd());
          }

          // Update display value
          setDisplayValue((prev) => {
            if (prev.length <= 1) return '0';
            return prev.slice(0, -1);
          });
        }
        break;

      case '=':
        if (!expression) return;
        
        // Auto-close open parentheses before evaluation for convenience
        let openCount = (expression.match(/\(/g) || []).length;
        let closeCount = (expression.match(/\)/g) || []).length;
        let balancedExpr = expression;
        while (openCount > closeCount) {
          balancedExpr += ')';
          closeCount++;
        }
        if (balancedExpr !== expression) {
          setExpression(balancedExpr);
        }

        const evaluation = evaluateExpression(balancedExpr);
        
        if (evaluation.success) {
          // Play success chime
          if (soundEnabled) {
            playSuccessSound();
          }

          // Add to history list (max 50 items)
          const newHistoryItem: HistoryItem = {
            id: Math.random().toString(36).substring(2, 9),
            expression: balancedExpr,
            result: evaluation.result,
            timestamp: new Date(),
          };
          setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
          
          setDisplayValue(evaluation.result);
          setIsFinished(true);
        } else {
          setDisplayValue(evaluation.result);
          setIsFinished(true);
        }
        break;

      case '±':
        // Negate the current display value
        if (displayValue === '0' || displayValue === 'Error') return;
        
        if (displayValue.startsWith('-')) {
          const positive = displayValue.slice(1);
          setDisplayValue(positive);
          
          // Rebuild expression replacing the last negative term
          if (isFinished) {
            setExpression(positive);
            setIsFinished(false);
          } else {
            // Find last term and negate it
            setExpression((prev) => {
              const lastSpace = prev.lastIndexOf(' ');
              if (lastSpace === -1) return positive;
              return prev.slice(0, lastSpace + 1) + positive;
            });
          }
        } else {
          const negative = `-${displayValue}`;
          setDisplayValue(negative);
          
          if (isFinished) {
            setExpression(negative);
            setIsFinished(false);
          } else {
            setExpression((prev) => {
              const lastSpace = prev.lastIndexOf(' ');
              if (lastSpace === -1) return negative;
              return prev.slice(0, lastSpace + 1) + `(${negative})`;
            });
          }
        }
        break;

      case '1/x':
        // Reciprocal of current display value
        if (displayValue === '0' || displayValue === 'Error') return;
        
        const reciprocalExpr = `1÷(${expression || displayValue})`;
        setExpression(reciprocalExpr);
        
        const recipEval = evaluateExpression(reciprocalExpr);
        setDisplayValue(recipEval.result);
        setIsFinished(true);
        
        if (recipEval.success && soundEnabled) {
          playSuccessSound();
        }
        break;

      default:
        // Handles standard digits, constants, operators, and functions
        if (type === 'operator') {
          if (isFinished) {
            setExpression(displayValue + ' ' + value + ' ');
            setDisplayValue('0');
            setIsFinished(false);
          } else {
            // If the expression already ends with an operator, replace it!
            const endsWithOperator = /[\+\-\×\÷\^%]\s*$/.test(expression);
            if (endsWithOperator && expression.length > 0) {
              setExpression((prev) => {
                const trimmed = prev.trimEnd();
                // Find and strip the last operator character
                const stripped = trimmed.slice(0, -1).trimEnd();
                return stripped + ' ' + value + ' ';
              });
            } else {
              setExpression((prev) => prev + ' ' + value + ' ');
            }
            setDisplayValue('0');
          }
        } else if (type === 'function') {
          // e.g., sin(, cos(, tan(, log(, ln(, sqrt(
          if (isFinished) {
            setExpression(value);
            setDisplayValue('0');
            setIsFinished(false);
          } else {
            setExpression((prev) => prev + value);
            setDisplayValue('0');
          }
        } else {
          // Standard digits (0-9, ., π, e)
          if (value === '.') {
            // Avoid multiple decimal points in one number
            if (displayValue.includes('.')) return;
            
            if (isFinished) {
              setExpression('0.');
              setDisplayValue('0.');
              setIsFinished(false);
              return;
            }
          }

          if (isFinished) {
            setExpression(value);
            setDisplayValue(value);
            setIsFinished(false);
          } else {
            setExpression((prev) => prev + value);
            setDisplayValue((prev) => {
              if (prev === '0' && value !== '.') return value;
              return prev + value;
            });
          }
        }
        break;
    }
  };

  // --- Load History Item ---
  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (soundEnabled) playClickSound('function');
    setExpression(item.expression);
    setDisplayValue(item.result);
    setIsFinished(true);
    setActiveMobileTab('calc'); // switch back to calculator view on mobile
  };

  // --- Clear History ---
  const handleClearHistory = () => {
    if (soundEnabled) playClickSound('clear');
    setHistory([]);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} font-sans flex flex-col justify-between`}>
      
      {/* Decorative ambient background lights (cyberpunk/pastel/forest only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
        {currentTheme.id === 'cyberpunk' && (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-fuchsia-500 rounded-full blur-[160px]"></div>
            <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500 rounded-full blur-[160px]"></div>
          </>
        )}
        {currentTheme.id === 'pastel' && (
          <>
            <div className="absolute top-10 left-10 w-80 h-80 bg-pink-200 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-200 rounded-full blur-[120px]"></div>
          </>
        )}
        {currentTheme.id === 'forest' && (
          <>
            <div className="absolute top-20 right-20 w-84 h-84 bg-emerald-200 rounded-full blur-[140px]"></div>
          </>
        )}
      </div>

      {/* --- Top App Header --- */}
      <header className="w-full max-w-6xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${currentTheme.calcBg} ${currentTheme.cardBorder} border shadow-sm`}>
            <span className={`text-xl font-extrabold tracking-tighter ${currentTheme.accentText}`}>
              ±
            </span>
          </div>
          <div>
            <h1 className={`text-lg font-extrabold tracking-tight ${currentTheme.displayText} flex items-center gap-1.5`}>
              Calculadora Multitema
              <Sparkles className={`w-4 h-4 ${currentTheme.accentText} hidden sm:inline`} />
            </h1>
            <p className={`text-[10px] sm:text-xs opacity-75 ${currentTheme.displaySubtext}`}>
              Diseño adaptativo, sonido táctil y fórmulas científicas
            </p>
          </div>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-2">
          {/* Keyboard help tooltip button */}
          <button
            onClick={() => {
              if (soundEnabled) playClickSound('function');
              setShowKeyboardHelp(!showKeyboardHelp);
            }}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${currentTheme.calcBg} ${currentTheme.cardBorder} hover:opacity-100 flex items-center gap-1.5 text-xs font-semibold ${currentTheme.displayText}`}
            title="Ver atajos de teclado"
            id="keyboard-help-toggle-btn"
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline">Teclado</span>
          </button>
        </div>
      </header>

      {/* --- Main Dashboard Body --- */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-start z-10">
        
        {/* PANEL 1: Theme Selector (Desktop: visible, Mobile: activeMobileTab === 'themes') */}
        <section className={`md:col-span-4 h-full ${activeMobileTab === 'themes' ? 'block' : 'hidden md:block'}`}>
          <ThemeSelector
            currentTheme={currentTheme}
            onSelectTheme={(theme) => {
              // Play a special success sound to welcome a new theme
              if (soundEnabled) {
                playSuccessSound();
              }
              setCurrentTheme(theme);
            }}
            themes={THEMES}
          />
        </section>

        {/* PANEL 2: The Core Physical Calculator (Always visible on mobile/desktop unless tab is switched) */}
        <section className={`md:col-span-5 flex flex-col gap-4 ${activeMobileTab === 'calc' ? 'block' : 'hidden md:block'}`}>
          <div className={`p-5 rounded-3xl border ${currentTheme.calcBg} ${currentTheme.cardBorder} ${currentTheme.shadowClass} transition-all duration-300`}>
            
            {/* Real Hardware Logo Badge */}
            <div className="flex items-center justify-between mb-3 text-xs opacity-60 px-1 font-mono tracking-widest select-none">
              <span className={currentTheme.displayText}>MATRIX FX-991</span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-3 bg-neutral-400/20 dark:bg-neutral-200/15 border border-black/5 dark:border-white/5 rounded-sm"></span>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              </div>
            </div>

            {/* Visual Calculator Display screen */}
            <CalculatorDisplay
              expression={expression}
              displayValue={displayValue}
              isFinished={isFinished}
              currentTheme={currentTheme}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              scientificEnabled={scientificEnabled}
              onToggleScientific={() => setScientificEnabled(!scientificEnabled)}
            />

            {/* Space buffer */}
            <div className="h-4"></div>

            {/* Tactile Keypad */}
            <CalculatorKeys
              currentTheme={currentTheme}
              onKeyPress={handleKeyPress}
              scientificEnabled={scientificEnabled}
            />

            {/* Quick scientific expansion toggle */}
            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={() => {
                  if (soundEnabled) playClickSound('function');
                  setScientificEnabled(!scientificEnabled);
                }}
                className={`text-xs font-semibold py-1 px-3.5 rounded-full border cursor-pointer hover:scale-102 transition-transform select-none ${currentTheme.badgeBg} ${currentTheme.badgeText}`}
                id="toggle-scientific-btn"
              >
                {scientificEnabled ? 'ocultar científica' : 'mostrar funciones científicas'}
              </button>
            </div>
          </div>
        </section>

        {/* PANEL 3: Historical Log (Desktop: visible, Mobile: activeMobileTab === 'history') */}
        <section className={`md:col-span-3 h-full ${activeMobileTab === 'history' ? 'block' : 'hidden md:block'}`}>
          <CalculatorHistory
            history={history}
            onSelectItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            currentTheme={currentTheme}
          />
        </section>

      </main>

      {/* --- Mobile View Tab Bar Controller --- */}
      <div className={`md:hidden sticky bottom-0 left-0 right-0 p-3 bg-white/70 dark:bg-black/70 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 z-20 select-none flex justify-around items-center`}>
        <button
          onClick={() => {
            if (soundEnabled) playClickSound('function');
            setActiveMobileTab('themes');
          }}
          className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-xl transition-all ${
            activeMobileTab === 'themes'
              ? `${currentTheme.badgeBg} ${currentTheme.badgeText} font-bold`
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          id="mobile-tab-themes"
        >
          <span className="text-base">🎨</span>
          <span>Temas</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) playClickSound('function');
            setActiveMobileTab('calc');
          }}
          className={`flex flex-col items-center gap-1 text-xs py-1.5 px-4 rounded-xl transition-all ${
            activeMobileTab === 'calc'
              ? `${currentTheme.badgeBg} ${currentTheme.badgeText} font-bold scale-105`
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          id="mobile-tab-calc"
        >
          <span className="text-base">🔢</span>
          <span>Calculadora</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) playClickSound('function');
            setActiveMobileTab('history');
          }}
          className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-xl transition-all ${
            activeMobileTab === 'history'
              ? `${currentTheme.badgeBg} ${currentTheme.badgeText} font-bold`
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          id="mobile-tab-history"
        >
          <span className="text-base">📜</span>
          <span>Historial</span>
        </button>
      </div>

      {/* --- Keyboard Shortcuts Modal Dialog --- */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${currentTheme.calcBg} ${currentTheme.cardBorder}`}
              id="keyboard-help-dialog"
            >
              <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: 'rgba(128,128,128,0.15)' }}>
                <h3 className={`text-base font-bold flex items-center gap-2 ${currentTheme.displayText}`}>
                  <Keyboard className="w-5 h-5" /> Atajos de Teclado
                </h3>
                <button
                  onClick={() => {
                    if (soundEnabled) playClickSound('clear');
                    setShowKeyboardHelp(false);
                  }}
                  className={`text-sm px-2.5 py-1 rounded-lg border cursor-pointer opacity-70 hover:opacity-100 ${currentTheme.badgeBg} ${currentTheme.badgeText}`}
                >
                  Cerrar
                </button>
              </div>

              <div className={`space-y-2.5 text-xs opacity-95 ${currentTheme.displaySubtext}`}>
                <p className="mb-3">
                  Puedes controlar esta calculadora completamente usando tu teclado físico en la computadora. Prueba las siguientes teclas rápidas:
                </p>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Números</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">0 - 9</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Decimal</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">. o ,</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Suma</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">+</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Resta</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">-</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Multiplica</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">* o x</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Divide</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">/</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center col-span-2">
                    <span>Potencia (Científica)</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">^</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Paréntesis</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">( )</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Porcentaje</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">%</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Calcular</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">Enter o =</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center">
                    <span>Retroceder</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">⌫ Backspace</kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between items-center col-span-2">
                    <span>Borrar todo (AC)</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-black/15 dark:bg-white/15 text-[10px] font-bold">Esc o C</kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Footer --- */}
      <footer className="w-full text-center py-4 text-[11px] opacity-55 font-mono select-none" style={{ color: 'inherit' }}>
        Calculadora con Temas • Creado con React y Vite
      </footer>
    </div>
  );
}
