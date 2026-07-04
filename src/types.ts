export type KeyType = 'number' | 'operator' | 'function' | 'action';

export interface Theme {
  id: string;
  name: string;
  description: string;
  bg: string;               // Main app background class
  calcBg: string;           // Calculator shell background class
  displayBg: string;        // Screen container background class
  displayText: string;       // Primary text on screen
  displaySubtext: string;    // Secondary/expression text on screen
  
  // Button styles
  btnNumberBg: string;
  btnNumberText: string;
  btnNumberHover: string;
  
  btnOperatorBg: string;
  btnOperatorText: string;
  btnOperatorHover: string;
  
  btnFunctionBg: string;
  btnFunctionText: string;
  btnFunctionHover: string;
  
  btnActionBg: string;
  btnActionText: string;
  btnActionHover: string;
  
  // Specific highlight classes
  equalBg: string;
  equalText: string;
  equalHover: string;
  
  clearBg: string;
  clearText: string;
  clearHover: string;
  
  // Borders, shadows & badges
  cardBorder: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  shadowClass: string;
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export interface CalculatorState {
  displayValue: string;     // What is currently shown as the main number/result
  expression: string;       // The complete expression (e.g. 12 + 5 * 3)
  isFinished: boolean;      // True if a calculation just completed (inputting a new number should overwrite display)
}
