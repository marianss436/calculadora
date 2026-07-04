import { Theme } from '../types';
import { motion } from 'motion/react';
import { Check, Palette, Sparkles } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  themes: Theme[];
}

export default function ThemeSelector({ currentTheme, onSelectTheme, themes }: ThemeSelectorProps) {
  return (
    <div className={`p-4 rounded-2xl border transition-colors duration-300 ${currentTheme.calcBg} ${currentTheme.cardBorder} h-full flex flex-col justify-between`}>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className={`w-5 h-5 ${currentTheme.accentText}`} />
          <h2 className={`font-semibold text-lg ${currentTheme.displayText} tracking-tight`}>
            Temas de la Calculadora
          </h2>
        </div>
        <p className={`text-xs mb-4 ${currentTheme.displaySubtext}`}>
          Elige una paleta de diseño para transformar completamente tu experiencia táctil y visual.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 gap-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
          {themes.map((theme) => {
            const isSelected = theme.id === currentTheme.id;
            return (
              <motion.button
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? `${theme.displayBg} ${theme.cardBorder} ring-2 ring-offset-2 ring-offset-transparent ${
                        theme.id === 'cyberpunk'
                          ? 'ring-fuchsia-500'
                          : theme.id === 'retro'
                          ? 'ring-[#306230]'
                          : theme.id === 'forest'
                          ? 'ring-emerald-700'
                          : theme.id === 'pastel'
                          ? 'ring-pink-400'
                          : 'ring-blue-500'
                      }`
                    : 'bg-transparent border-transparent opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id={`theme-btn-${theme.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-semibold truncate ${isSelected ? theme.displayText : 'opacity-90'}`}>
                      {theme.name}
                    </span>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`inline-block ${theme.accentText}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </div>
                  <span className={`text-[11px] block truncate opacity-70 ${isSelected ? theme.displaySubtext : ''}`}>
                    {theme.description}
                  </span>
                </div>

                {/* Theme Palette Swatch */}
                <div className="flex items-center gap-1.5 shrink-0 bg-black/10 dark:bg-white/10 p-1.5 rounded-lg">
                  <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: getSwatchColor(theme, 'number') }}></span>
                  <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: getSwatchColor(theme, 'operator') }}></span>
                  <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: getSwatchColor(theme, 'equal') }}></span>
                  {isSelected && (
                    <div className={`ml-1 ${theme.accentText}`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className={`mt-4 pt-3 border-t text-[10px] ${currentTheme.cardBorder} text-center opacity-60 ${currentTheme.displaySubtext}`}>
        Prueba temas como <span className="font-semibold">Cyberpunk</span> o <span className="font-semibold">GameBoy Retro</span>. ¡Soportan sonido táctil!
      </div>
    </div>
  );
}

// Quick helper to map background colors for swatch icons
function getSwatchColor(theme: Theme, element: 'number' | 'operator' | 'equal'): string {
  if (element === 'equal') {
    if (theme.id === 'light') return '#2563eb'; // blue-600
    if (theme.id === 'dark') return '#f59e0b';  // amber-500
    if (theme.id === 'cyberpunk') return '#facc15'; // yellow-400
    if (theme.id === 'retro') return '#306230'; // GameBoy green
    if (theme.id === 'forest') return '#d97706'; // amber-600
    if (theme.id === 'pastel') return '#f472b6'; // pink-400
    if (theme.id === 'terminal') return '#15803d'; // green-700
  }
  if (element === 'operator') {
    if (theme.id === 'light') return '#eff6ff'; // blue-50
    if (theme.id === 'dark') return '#1e293b';  // slate-800
    if (theme.id === 'cyberpunk') return '#4a044e'; // fuchsia-950
    if (theme.id === 'retro') return '#4b5563'; // gray-600
    if (theme.id === 'forest') return '#065f46'; // emerald-800
    if (theme.id === 'pastel') return '#fce7f3'; // pink-100
    if (theme.id === 'terminal') return '#18181b'; // zinc-900
  }
  // Element is number
  if (theme.id === 'light') return '#f8fafc'; // slate-50
  if (theme.id === 'dark') return '#1e293b';  // slate-800
  if (theme.id === 'cyberpunk') return '#262626'; // neutral-800
  if (theme.id === 'retro') return '#d4d4d8'; // zinc-300
  if (theme.id === 'forest') return '#ecfdf5'; // emerald-50
  if (theme.id === 'pastel') return '#faf5ff'; // purple-50
  if (theme.id === 'terminal') return '#18181b'; // zinc-900
  return '#ffffff';
}
