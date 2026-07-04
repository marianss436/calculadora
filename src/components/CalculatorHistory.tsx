import { HistoryItem, Theme } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, ArrowUpLeft, Clock } from 'lucide-react';

interface CalculatorHistoryProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  currentTheme: Theme;
}

export default function CalculatorHistory({
  history,
  onSelectItem,
  onClearHistory,
  currentTheme,
}: CalculatorHistoryProps) {
  return (
    <div className={`p-4 rounded-2xl border transition-colors duration-300 ${currentTheme.calcBg} ${currentTheme.cardBorder} h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-3 border-b pb-2.5" style={{ borderColor: 'rgba(128,128,128,0.15)' }}>
        <div className="flex items-center gap-2">
          <History className={`w-5 h-5 ${currentTheme.accentText}`} />
          <h2 className={`font-semibold text-lg ${currentTheme.displayText} tracking-tight`}>
            Historial
          </h2>
        </div>
        {history.length > 0 && (
          <motion.button
            onClick={onClearHistory}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${currentTheme.clearBg} ${currentTheme.clearText} ${currentTheme.clearHover}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Borrar todo el historial"
            id="clear-history-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar</span>
          </motion.button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 px-4 text-center h-full"
            >
              <div className={`p-3 rounded-full mb-3 bg-slate-100 dark:bg-slate-800 opacity-60`}>
                <Clock className={`w-6 h-6 ${currentTheme.accentText}`} />
              </div>
              <h3 className={`text-sm font-semibold ${currentTheme.displayText} mb-1`}>
                Historial Vacío
              </h3>
              <p className={`text-xs ${currentTheme.displaySubtext} max-w-[200px]`}>
                Tus operaciones resueltas aparecerán aquí para reutilizarlas en cualquier momento.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-2.5 rounded-xl border text-right cursor-pointer group transition-all relative overflow-hidden ${currentTheme.displayBg} ${currentTheme.cardBorder} hover:border-slate-400 dark:hover:border-slate-500`}
                  onClick={() => onSelectItem(item)}
                  whileHover={{ x: -2 }}
                  title="Cargar esta fórmula en la calculadora"
                  id={`history-item-${item.id}`}
                >
                  {/* Floating Action Indicator on hover */}
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                      Cargar
                    </span>
                    <ArrowUpLeft className={`w-3.5 h-3.5 ${currentTheme.accentText}`} />
                  </div>

                  {/* Math Formula */}
                  <div className={`text-xs ${currentTheme.displaySubtext} font-medium truncate mb-0.5`}>
                    {item.expression} =
                  </div>
                  
                  {/* Result */}
                  <div className={`text-sm font-bold truncate ${currentTheme.displayText}`}>
                    {item.result}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className={`mt-3 pt-2 text-[10px] ${currentTheme.displaySubtext} text-center opacity-50`}>
        {history.length > 0 && "Haz clic en cualquier fórmula para recargarla"}
      </div>
    </div>
  );
}
