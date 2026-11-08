/**
 * Office Math Markup Language (OMML) Generator
 * Translates LaTeX mathematical equations into native Microsoft Word OpenXML Math structures.
 * Allows exported Word documents to display genuine, editable equations in Cambria Math.
 */

// Greek symbols dictionary
const GREEK_SYMBOLS: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π',
  rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ',
  chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ',
  Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
};

// Math operator dictionary
const OPERATOR_SYMBOLS: Record<string, string> = {
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '·',
  ast: '*', star: '⋆', circ: '∘', bullet: '•',
  leq: '≤', geq: '≥', neq: '≠', approx: '≈', sim: '∼',
  equiv: '≡', in: '∈', notin: '∉', subset: '⊂', supset: '⊃',
  subseteq: '⊆', supseteq: '⊇', cup: '∪', cap: '∩',
  infty: '∞', partial: '∂', nabla: '∇', forall: '∀', exists: '∃',
  neg: '¬', to: '→', rightarrow: '→', leftarrow: '←',
  Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔',
  leftrightarrow: '↔', ldots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱',
};

const MATH_FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'sinh', 'cosh', 'tanh', 'coth',
  'arcsin', 'arccos', 'arctan',
  'ln', 'log', 'exp', 'lim', 'min', 'max', 'det', 'gcd', 'deg'
]);

export class OmmlConverter {
  /**
   * Converts a LaTeX string into an OMML XML string.
   */
  public static latexToOmml(latex: string, isBlock: boolean = false): string {
    const cleanLatex = latex.trim();
    if (!cleanLatex) {
      return '';
    }

    try {
      const parsedBody = this.parseExpression(cleanLatex);
      if (isBlock) {
        return `<m:oMathPara xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:oMath>${parsedBody}</m:oMath></m:oMathPara>`;
      }
      return `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">${parsedBody}</m:oMath>`;
    } catch {
      // Graceful fallback: render escaped text run
      const escaped = this.escapeXml(cleanLatex);
      return `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:r><m:rPr><m:nor/></m:rPr><m:t>${escaped}</m:t></m:r></m:oMath>`;
    }
  }

  /**
   * Recursive parser that walks tokens and generates OMML nodes.
   */
  private static parseExpression(input: string): string {
    let output = '';
    let i = 0;

    while (i < input.length) {
      const char = input[i];

      // Skip whitespace
      if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        i++;
        continue;
      }

      // 1. LaTeX Command (\frac, \sqrt, \alpha, \sum, etc.)
      if (char === '\\') {
        const commandMatch = input.slice(i).match(/^\\([a-zA-Z]+|[,;:! ]|\\|\{|\})/);
        if (commandMatch) {
          const command = commandMatch[1];
          i += commandMatch[0].length;

          // Fraction: \frac{num}{den}
          if (command === 'frac') {
            const numArg = this.extractBracedGroup(input, i);
            i += numArg.consumedLength;
            const denArg = this.extractBracedGroup(input, i);
            i += denArg.consumedLength;

            output += `<m:f><m:fPr><m:type m:val="bar"/></m:fPr><m:num>${this.parseExpression(numArg.content)}</m:num><m:den>${this.parseExpression(denArg.content)}</m:den></m:f>`;
            continue;
          }

          // Square Root: \sqrt[n]{x} or \sqrt{x}
          if (command === 'sqrt') {
            let degree = '';
            if (input[i] === '[') {
              const bracketEnd = input.indexOf(']', i);
              if (bracketEnd !== -1) {
                degree = input.slice(i + 1, bracketEnd);
                i = bracketEnd + 1;
              }
            }
            const radicandArg = this.extractBracedGroup(input, i);
            i += radicandArg.consumedLength;

            if (degree) {
              output += `<m:rad><m:radPr><m:degHide m:val="0"/></m:radPr><m:deg>${this.parseExpression(degree)}</m:deg><m:e>${this.parseExpression(radicandArg.content)}</m:e></m:rad>`;
            } else {
              output += `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${this.parseExpression(radicandArg.content)}</m:e></m:rad>`;
            }
            continue;
          }

          // N-Ary Operators: \sum, \int, \prod
          if (command === 'sum' || command === 'int' || command === 'prod') {
            const opChar = command === 'sum' ? '∑' : command === 'int' ? '∫' : '∏';
            let sub = '';
            let sup = '';

            // Check following sub/sup
            let peekIdx = i;
            while (peekIdx < input.length) {
              const peekChar = input[peekIdx];
              if (peekChar === ' ') {
                peekIdx++;
                continue;
              }
              if (peekChar === '_') {
                peekIdx++;
                const subArg = this.extractTokenOrGroup(input, peekIdx);
                sub = subArg.content;
                peekIdx += subArg.consumedLength;
              } else if (peekChar === '^') {
                peekIdx++;
                const supArg = this.extractTokenOrGroup(input, peekIdx);
                sup = supArg.content;
                peekIdx += supArg.consumedLength;
              } else {
                break;
              }
            }
            i = peekIdx;

            if (sub || sup) {
              output += `<m:nary><m:naryPr><m:chr m:val="${opChar}"/><m:limLoc m:val="undOvr"/></m:naryPr>`;
              output += `<m:sub>${sub ? this.parseExpression(sub) : ''}</m:sub>`;
              output += `<m:sup>${sup ? this.parseExpression(sup) : ''}</m:sup>`;
              output += `<m:e/>`;
              output += `</m:nary>`;
            } else {
              output += `<m:r><m:rPr><m:nor/></m:rPr><m:t>${opChar}</m:t></m:r>`;
            }
            continue;
          }

          // Plain text inside math: \text{...} or \mathrm{...}
          if (command === 'text' || command === 'mathrm' || command === 'mathbf') {
            const textArg = this.extractBracedGroup(input, i);
            i += textArg.consumedLength;
            output += `<m:r><m:rPr><m:nor/></m:rPr><m:t>${this.escapeXml(textArg.content)}</m:t></m:r>`;
            continue;
          }

          // Left/Right Delimiters: \left( ... \right)
          if (command === 'left') {
            const delimChar = input[i] || '(';
            i++;
            // Find corresponding \right
            const rightIdx = input.indexOf('\\right', i);
            let content = '';
            let endDelim = ')';
            if (rightIdx !== -1) {
              content = input.slice(i, rightIdx);
              i = rightIdx + 6;
              endDelim = input[i] || ')';
              i++;
            } else {
              content = input.slice(i);
              i = input.length;
            }
            output += `<m:d><m:dPr><m:begChr m:val="${this.escapeXml(delimChar)}"/><m:endChr m:val="${this.escapeXml(endDelim)}"/><m:grow/></m:dPr><m:e>${this.parseExpression(content)}</m:e></m:d>`;
            continue;
          }

          // Greek letters
          if (GREEK_SYMBOLS[command]) {
            output += this.createRun(GREEK_SYMBOLS[command]);
            continue;
          }

          // Operators
          if (OPERATOR_SYMBOLS[command]) {
            output += this.createRun(OPERATOR_SYMBOLS[command], true);
            continue;
          }

          // Math functions (sin, cos, ln, etc.)
          if (MATH_FUNCTIONS.has(command)) {
            output += `<m:r><m:rPr><m:nor/></m:rPr><m:t>${command}</m:t></m:r>`;
            continue;
          }

          // Spaces: \, \: \; \! \quad \qquad
          if ([';', ',', ':', 'quad', 'qquad', ' '].includes(command)) {
            output += `<m:r><m:t> </m:t></m:r>`;
            continue;
          }

          // Unknown command - output literally
          output += this.createRun(command);
          continue;
        }
      }

      // 2. Subscript (_) or Superscript (^)
      if (char === '_' || char === '^') {
        const isSup = char === '^';
        i++;
        const firstArg = this.extractTokenOrGroup(input, i);
        i += firstArg.consumedLength;

        // Check if immediately followed by the other index (e.g. x_1^2 or x^2_1)
        let secondArg: { content: string; consumedLength: number } | null = null;
        let secondIsSup = false;

        let peek = i;
        while (peek < input.length && input[peek] === ' ') peek++;
        if (peek < input.length && (input[peek] === '_' || input[peek] === '^')) {
          secondIsSup = input[peek] === '^';
          if (secondIsSup !== isSup) {
            i = peek + 1;
            secondArg = this.extractTokenOrGroup(input, i);
            i += secondArg.consumedLength;
          }
        }

        // Attach to previous output run or empty base
        const lastRunMatch = output.match(/<m:r>[\s\S]*?<\/m:r>$/);
        let baseElement = '';
        if (lastRunMatch) {
          baseElement = lastRunMatch[0];
          output = output.slice(0, -baseElement.length);
        } else {
          baseElement = `<m:r><m:t></m:t></m:r>`;
        }

        if (secondArg) {
          const subContent = isSup ? secondArg.content : firstArg.content;
          const supContent = isSup ? firstArg.content : secondArg.content;
          output += `<m:sSubSup><m:e>${baseElement}</m:e><m:sub>${this.parseExpression(subContent)}</m:sub><m:sup>${this.parseExpression(supContent)}</m:sup></m:sSubSup>`;
        } else if (isSup) {
          output += `<m:sSup><m:e>${baseElement}</m:e><m:sup>${this.parseExpression(firstArg.content)}</m:sup></m:sSup>`;
        } else {
          output += `<m:sSub><m:e>${baseElement}</m:e><m:sub>${this.parseExpression(firstArg.content)}</m:sub></m:sSub>`;
        }
        continue;
      }

      // 3. Delimiters & Brackets
      if (char === '{') {
        const group = this.extractBracedGroup(input, i - 1);
        i += group.consumedLength - 1;
        output += this.parseExpression(group.content);
        continue;
      }

      if (char === '(' || char === '[') {
        const closeChar = char === '(' ? ')' : ']';
        const closeIdx = input.indexOf(closeChar, i + 1);
        if (closeIdx !== -1) {
          const innerContent = input.slice(i + 1, closeIdx);
          output += `<m:d><m:dPr><m:begChr m:val="${char}"/><m:endChr m:val="${closeChar}"/><m:grow/></m:dPr><m:e>${this.parseExpression(innerContent)}</m:e></m:d>`;
          i = closeIdx + 1;
          continue;
        }
      }

      // 4. Standalone operators (=, +, -, *, /, <, >, etc.)
      if (['=', '+', '-', '*', '/', '<', '>', '|', '!'].includes(char)) {
        output += `<m:r><m:rPr><m:nor/></m:rPr><m:t>${this.escapeXml(char)}</m:t></m:r>`;
        i++;
        continue;
      }

      // 5. Normal character / number
      output += this.createRun(char);
      i++;
    }

    return output;
  }

  private static createRun(text: string, isOperator: boolean = false): string {
    const escaped = this.escapeXml(text);
    if (isOperator || /^[0-9.,]+$/.test(text)) {
      return `<m:r><m:rPr><m:nor/></m:rPr><m:t>${escaped}</m:t></m:r>`;
    }
    return `<m:r><m:t>${escaped}</m:t></m:r>`;
  }

  private static extractBracedGroup(input: string, startIdx: number): { content: string; consumedLength: number } {
    let i = startIdx;
    while (i < input.length && input[i] !== '{') {
      i++;
    }

    if (i >= input.length) {
      return { content: '', consumedLength: input.length - startIdx };
    }

    let depth = 1;
    const contentStart = i + 1;
    i++;

    while (i < input.length && depth > 0) {
      if (input[i] === '{' && input[i - 1] !== '\\') depth++;
      else if (input[i] === '}' && input[i - 1] !== '\\') depth--;
      i++;
    }

    const content = input.slice(contentStart, i - 1);
    return { content, consumedLength: i - startIdx };
  }

  private static extractTokenOrGroup(input: string, startIdx: number): { content: string; consumedLength: number } {
    let i = startIdx;
    while (i < input.length && input[i] === ' ') i++;

    if (i >= input.length) return { content: '', consumedLength: 0 };

    if (input[i] === '{') {
      return this.extractBracedGroup(input, i);
    }

    // Single character or single command token
    if (input[i] === '\\') {
      const match = input.slice(i).match(/^\\([a-zA-Z]+|.)/);
      if (match) {
        return { content: match[0], consumedLength: (i - startIdx) + match[0].length };
      }
    }

    return { content: input[i], consumedLength: (i - startIdx) + 1 };
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
