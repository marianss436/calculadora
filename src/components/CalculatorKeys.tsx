import { Theme, KeyType } from '../types';
import { motion } from 'motion/react';
import { Delete, HelpCircle } from 'lucide-react';

interface KeyConfig {
  label: string;
  value: string;
  type: KeyType;
  customClass?: string;
}

interface CalculatorKeysProps {
  currentTheme: Theme;
  onKeyPress: (value: string, type: KeyType) => void;
  scientificEnabled: boolean;
}

export default function CalculatorKeys({
  currentTheme,
  onKeyPress,
  scientificEnabled,
}: CalculatorKeysProps) {
  
  // Standard Keys Configuration
  const standardKeys: KeyConfig[] = [
    { label: 'AC', value: 'AC', type: 'action', customClass: 'clear' },
    { label: '⌫', value: 'BACKSPACE', type: 'action' },
    { label: '%', value: '%', type: 'operator' },
    { label: '÷', value: '÷', type: 'operator' },
    
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '×', value: '×', type: 'operator' },
    
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '-', value: '-', type: 'operator' },
    
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '+', value: '+', type: 'operator' },
    
    { label: '±', value: '±', type: 'function' },
    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'number' },
    { label: '=', value: '=', type: 'action', customClass: 'equal' },
  ];

  // Scientific Keys Configuration
  const scientificKeys: KeyConfig[] = [
    { label: 'sin', value: 'sin(', type: 'function' },
    { label: 'cos', value: 'cos(', type: 'function' },
    { label: 'tan', value: 'tan(', type: 'function' },
    { label: '(', value: '(', type: 'function' },
    
    { label: 'ln', value: 'ln(', type: 'function' },
    { label: 'log', value: 'log(', type: 'function' },
    { label: '√', value: '√(', type: 'function' },
    { label: ')', value: ')', type: 'function' },
    
    { label: 'π', value: 'π', type: 'number' },
    { label: 'e', value: 'e', type: 'number' },
    { label: 'xʸ', value: '^', type: 'operator' },
    { label: '1/x', value: '1/x', type: 'function' }, // Inverse/Reciprocal
  ];

  // Helper to get button style based on its theme settings and type
  const getButtonStyles = (key: KeyConfig): string => {
    // Check specific custom actions
    if (key.customClass === 'equal') {
      return `${currentTheme.equalBg} ${currentTheme.equalText} ${currentTheme.equalHover}`;
    }
    if (key.customClass === 'clear' || key.value === 'AC') {
      return `${currentTheme.clearBg} ${currentTheme.clearText} ${currentTheme.clearHover}`;
    }

    switch (key.type) {
      case 'number':
        return `${currentTheme.btnNumberBg} ${currentTheme.btnNumberText} ${currentTheme.btnNumberHover}`;
      case 'operator':
        return `${currentTheme.btnOperatorBg} ${currentTheme.btnOperatorText} ${currentTheme.btnOperatorHover}`;
      case 'function':
        return `${currentTheme.btnFunctionBg} ${currentTheme.btnFunctionText} ${currentTheme.btnFunctionHover}`;
      case 'action':
        return `${currentTheme.btnActionBg} ${currentTheme.btnActionText} ${currentTheme.btnActionHover}`;
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col gap-3.5 select-none">
      
      {/* Conditionally Rendered Scientific Panel */}
      {scientificEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          className="grid grid-cols-4 gap-2.5 p-3 rounded-xl border border-dashed"
          style={{ borderColor: 'rgba(128,128,128,0.2)' }}
        >
          {scientificKeys.map((key, idx) => (
            <motion.button
              key={`sci-${idx}-${key.label}`}
              onClick={() => onKeyPress(key.value, key.type)}
              className={`py-2 px-1 text-xs md:text-sm font-semibold rounded-xl cursor-pointer transition-all ${getButtonStyles(key)}`}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.94 }}
              id={`key-sci-${key.label}`}
            >
              <span className={key.type === 'function' ? 'italic' : ''}>{key.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Main Standard Keyboard Grid (4 Columns) */}
      <div className="grid grid-cols-4 gap-2.5">
        {standardKeys.map((key, idx) => {
          const isLargeFont = key.value === 'AC';
          const isBackspace = key.value === 'BACKSPACE';
          const isOperator = key.type === 'operator';

          return (
            <motion.button
              key={`std-${idx}-${key.label}`}
              onClick={() => onKeyPress(key.value, key.type)}
              className={`py-3 px-2 text-base md:text-lg font-semibold rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                isLargeFont ? 'font-bold' : ''
              } ${getButtonStyles(key)} ${
                key.label === '0' ? 'col-span-1' : '' // Keep it symmetric & neat
              }`}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.94 }}
              id={`key-std-${key.label}`}
            >
              {isBackspace ? (
                <Delete className="w-5 h-5" />
              ) : (
                <span className={isOperator ? 'scale-110 font-bold' : ''}>{key.label}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
