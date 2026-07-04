/**
 * Safe Mathematical Expression Evaluator using a Recursive Descent Parser.
 * Avoids eval() and handles operators, functions, parentheses, and constants.
 */

export function evaluateExpression(expression: string): { result: string; success: boolean } {
  // Normalize the expression for parsing
  let normalized = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/e/g, 'Math.E')
    .replace(/√\(/g, 'sqrt(')
    .replace(/sin\(/g, 'sin(')
    .replace(/cos\(/g, 'cos(')
    .replace(/tan\(/g, 'tan(')
    .replace(/log\(/g, 'log(')
    .replace(/ln\(/g, 'ln(');

  // Simple tokenization
  try {
    const tokens: string[] = [];
    let i = 0;
    
    while (i < normalized.length) {
      const char = normalized[i];
      
      // Skip whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }
      
      // Handle Multi-char names like Math.PI, Math.E, sqrt, sin, cos, tan, log, ln
      if (/[a-zA-Z_]/.test(char)) {
        let name = '';
        while (i < normalized.length && /[a-zA-Z0-9_\.]/.test(normalized[i])) {
          name += normalized[i];
          i++;
        }
        tokens.push(name);
        continue;
      }
      
      // Handle numbers
      if (/[0-9\.]/.test(char)) {
        let numStr = '';
        while (i < normalized.length && /[0-9\.]/.test(normalized[i])) {
          numStr += normalized[i];
          i++;
        }
        tokens.push(numStr);
        continue;
      }
      
      // Operators and parens
      if (['+', '-', '*', '/', '^', '(', ')', '%'].includes(char)) {
        tokens.push(char);
        i++;
        continue;
      }
      
      // Unknown character
      return { result: 'Error', success: false };
    }

    let tokenIndex = 0;
    
    function peek(): string | null {
      return tokenIndex < tokens.length ? tokens[tokenIndex] : null;
    }
    
    function consume(expected?: string): string {
      const token = peek();
      if (!token) {
        throw new Error('Fin de expresión inesperado');
      }
      if (expected && token !== expected) {
        throw new Error(`Se esperaba ${expected} pero se obtuvo ${token}`);
      }
      tokenIndex++;
      return token;
    }

    // AST Parser & Evaluator
    // Precedence: Expression -> Term -> Power -> Factor
    
    function parseExpression(): number {
      let value = parseTerm();
      while (true) {
        const next = peek();
        if (next === '+') {
          consume('+');
          value += parseTerm();
        } else if (next === '-') {
          consume('-');
          value -= parseTerm();
        } else {
          break;
        }
      }
      return value;
    }
    
    function parseTerm(): number {
      let value = parsePower();
      while (true) {
        const next = peek();
        if (next === '*') {
          consume('*');
          value *= parsePower();
        } else if (next === '/') {
          consume('/');
          const denom = parsePower();
          if (denom === 0) {
            throw new Error('División por cero');
          }
          value /= denom;
        } else {
          break;
        }
      }
      return value;
    }
    
    function parsePower(): number {
      let value = parseFactor();
      while (true) {
        const next = peek();
        if (next === '^') {
          consume('^');
          value = Math.pow(value, parsePower());
        } else {
          break;
        }
      }
      return value;
    }
    
    function parseFactor(): number {
      const next = peek();
      if (!next) {
        throw new Error('Factor esperado');
      }
      
      // Unary minus
      if (next === '-') {
        consume('-');
        return -parseFactor();
      }
      
      // Unary plus
      if (next === '+') {
        consume('+');
        return parseFactor();
      }
      
      // Parentheses
      if (next === '(') {
        consume('(');
        const value = parseExpression();
        // Handle potential trailing % inside or right after parens
        consume(')');
        if (peek() === '%') {
          consume('%');
          return value / 100;
        }
        return value;
      }
      
      // Constants
      if (next === 'Math.PI') {
        consume('Math.PI');
        let val = Math.PI;
        if (peek() === '%') { consume('%'); val /= 100; }
        return val;
      }
      if (next === 'Math.E') {
        consume('Math.E');
        let val = Math.E;
        if (peek() === '%') { consume('%'); val /= 100; }
        return val;
      }
      
      // Functions
      if (['sqrt', 'sin', 'cos', 'tan', 'log', 'ln'].includes(next)) {
        consume(next);
        consume('(');
        const arg = parseExpression();
        consume(')');
        
        let val = 0;
        switch (next) {
          case 'sqrt':
            if (arg < 0) throw new Error('Raíz de negativo');
            val = Math.sqrt(arg);
            break;
          case 'sin':
            // Convert to radians by default
            val = Math.sin(arg);
            break;
          case 'cos':
            val = Math.cos(arg);
            break;
          case 'tan':
            val = Math.tan(arg);
            break;
          case 'log':
            if (arg <= 0) throw new Error('Log de no positivo');
            val = Math.log10(arg);
            break;
          case 'ln':
            if (arg <= 0) throw new Error('Ln de no positivo');
            val = Math.log(arg);
            break;
        }
        
        if (peek() === '%') {
          consume('%');
          val /= 100;
        }
        return val;
      }
      
      // Number
      if (!isNaN(Number(next))) {
        consume(next);
        let val = Number(next);
        if (peek() === '%') {
          consume('%');
          val /= 100;
        }
        return val;
      }
      
      throw new Error(`Token inválido: ${next}`);
    }

    const finalValue = parseExpression();
    
    // If there are still tokens left, it's a syntax error
    if (tokenIndex < tokens.length) {
      throw new Error('Tokens adicionales no procesados');
    }
    
    if (isNaN(finalValue) || !isFinite(finalValue)) {
      return { result: 'Error', success: false };
    }
    
    // Format precision
    // If integer, return it. If decimal, limit to 10 decimal places and strip trailing zeros.
    let resultStr = '';
    if (Number.isInteger(finalValue)) {
      resultStr = finalValue.toString();
    } else {
      // Clean up rounding errors like 0.1 + 0.2 = 0.30000000000000004
      resultStr = parseFloat(finalValue.toFixed(12)).toString();
    }
    
    return { result: resultStr, success: true };
    
  } catch (err: any) {
    console.error('Eval error:', err);
    let errMsg = 'Error';
    if (err.message && err.message.includes('División por cero')) {
      errMsg = 'Div. por 0';
    } else if (err.message && err.message.includes('Raíz de negativo')) {
      errMsg = 'Raíz neg.';
    } else if (err.message && (err.message.includes('Log') || err.message.includes('Ln'))) {
      errMsg = 'Error Log';
    } else {
      errMsg = 'Error de Sintaxis';
    }
    return { result: errMsg, success: false };
  }
}
