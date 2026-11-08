/**
 * Office Math Markup Language (OMML) Generator
 * Translates LaTeX mathematical equations into native Microsoft Word OpenXML Math structures.
 * Supports matrices, brackets, powers on delimiters, chemical notation, and clean rendering in Cambria Math.
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
      // Pre-process chemistry \ce{...}
      const preprocessed = this.preprocessSpecialEnvironments(cleanLatex);
      const parsedBody = this.parseExpression(preprocessed);

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
   * Handles pre-processing for chemistry \ce{...} and common shortcuts.
   */
  private static preprocessSpecialEnvironments(latex: string): string {
    // 1. Chemistry: \ce{...}
    let result = latex.replace(/\\ce\{([\s\S]*?)\}/g, (_m, chem) => {
      // Replace -> with \rightarrow
      let formula = chem.replace(/->/g, ' \\rightarrow ');
      // Auto-subscript numbers following chemical elements (e.g. CO2 -> CO_2, H2O -> H_2O)
      formula = formula.replace(/([A-Za-z\)])(\d+)/g, '$1_{$2}');
      return formula;
    });

    // 2. Normalize simple -> to \rightarrow
    result = result.replace(/->/g, ' \\rightarrow ');

    return result;
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

      // 1. LaTeX Command (\frac, \sqrt, \alpha, \sum, \begin, etc.)
      if (char === '\\') {
        const commandMatch = input.slice(i).match(/^\\([a-zA-Z]+|[,;:! ]|\\|\{|\})/);
        if (commandMatch) {
          const command = commandMatch[1];
          i += commandMatch[0].length;

          // Matrix Environments: \begin{pmatrix}...\end{pmatrix}
          if (command === 'begin') {
            const envArg = this.extractBracedGroup(input, i);
            i += envArg.consumedLength;
            const envName = envArg.content.trim();

            const endPattern = `\\end{${envName}}`;
            const endIdx = input.indexOf(endPattern, i);
            let matrixBody = '';
            if (endIdx !== -1) {
              matrixBody = input.slice(i, endIdx);
              i = endIdx + endPattern.length;
            } else {
              matrixBody = input.slice(i);
              i = input.length;
            }

            const matrixXml = this.renderMatrix(matrixBody);
            if (envName === 'pmatrix') {
              output += `<m:d><m:dPr><m:begChr m:val="("/><m:endChr m:val=")"/><m:grow/></m:dPr><m:e>${matrixXml}</m:e></m:d>`;
            } else if (envName === 'bmatrix') {
              output += `<m:d><m:dPr><m:begChr m:val="["/><m:endChr m:val="]"/><m:grow/></m:dPr><m:e>${matrixXml}</m:e></m:d>`;
            } else if (envName === 'vmatrix') {
              output += `<m:d><m:dPr><m:begChr m:val="|"/><m:endChr m:val="|"/><m:grow/></m:dPr><m:e>${matrixXml}</m:e></m:d>`;
            } else {
              output += matrixXml;
            }
            continue;
          }

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

            // Instead of an empty <m:e/> that shows a square box □, render operator as clean sub/sup or symbol
            if (sub && sup) {
              output += `<m:sSubSup><m:e><m:r><m:rPr><m:nor/></m:rPr><m:t>${opChar}</m:t></m:r></m:e><m:sub>${this.parseExpression(sub)}</m:sub><m:sup>${this.parseExpression(sup)}</m:sup></m:sSubSup>`;
            } else if (sub) {
              output += `<m:sSub><m:e><m:r><m:rPr><m:nor/></m:rPr><m:t>${opChar}</m:t></m:r></m:e><m:sub>${this.parseExpression(sub)}</m:sub></m:sSub>`;
            } else if (sup) {
              output += `<m:sSup><m:e><m:r><m:rPr><m:nor/></m:rPr><m:t>${opChar}</m:t></m:r></m:e><m:sup>${this.parseExpression(sup)}</m:sup></m:sSup>`;
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
            let delimChar = input[i] || '(';
            i++;
            if (delimChar === '\\' && input[i] === '{') {
              delimChar = '{';
              i++;
            }

            const rightIdx = input.indexOf('\\right', i);
            let content = '';
            let endDelim = ')';
            if (rightIdx !== -1) {
              content = input.slice(i, rightIdx);
              i = rightIdx + 6;
              while (i < input.length && input[i] === ' ') i++;
              endDelim = input[i] || ')';
              if (endDelim === '\\' && input[i + 1] === '}') {
                endDelim = '}';
                i += 2;
              } else {
                i++;
              }
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

        // Robust base extraction: extracts the last complete OMML element (delimiter, fraction, radical, run, etc.)
        const extracted = this.extractLastOmmlElement(output);
        output = extracted.remaining;
        const baseElement = extracted.element || `<m:r><m:t></m:t></m:r>`;

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
        const closeIdx = this.findMatchingClosingBracket(input, i, char, closeChar);
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

      // 5. Normal character / number / Arabic text
      output += this.createRun(char);
      i++;
    }

    return output;
  }

  /**
   * Renders matrix body (rows split by \\ and cells split by &) into OMML <m:m>.
   */
  private static renderMatrix(matrixBody: string): string {
    const rows = matrixBody.split('\\\\').map((r) => r.trim()).filter((r) => r.length > 0);
    if (rows.length === 0) return '';

    let matrixXml = `<m:m><m:mPr><m:mcs><m:mc><m:mcPr><m:count m:val="10"/></m:mcPr></m:mc></m:mcs></m:mPr>`;

    rows.forEach((row) => {
      matrixXml += `<m:mr>`;
      const cols = row.split('&').map((c) => c.trim());
      cols.forEach((col) => {
        matrixXml += `<m:e>${this.parseExpression(col)}</m:e>`;
      });
      matrixXml += `</m:mr>`;
    });

    matrixXml += `</m:m>`;
    return matrixXml;
  }

  /**
   * Extracts the last complete OMML element from an output string so superscripts/subscripts attach correctly.
   */
  private static extractLastOmmlElement(output: string): { element: string; remaining: string } {
    if (!output) return { element: '', remaining: '' };

    // Matches closing tags: </m:d>, </m:r>, </m:f>, </m:rad>, </m:sSup>, </m:sSub>, </m:sSubSup>
    const match = output.match(/<\/(m:[a-zA-Z]+)>$/);
    if (!match) {
      return { element: '', remaining: output };
    }

    const tagName = match[1];
    const openTag = `<${tagName}`;
    let depth = 0;
    let openIdx = -1;

    // Scan backwards
    for (let pos = output.length - 1; pos >= 0; pos--) {
      if (output.startsWith(`</${tagName}>`, pos)) {
        depth++;
      } else if (output.startsWith(openTag, pos)) {
        depth--;
        if (depth === 0) {
          openIdx = pos;
          break;
        }
      }
    }

    if (openIdx !== -1) {
      const element = output.slice(openIdx);
      const remaining = output.slice(0, openIdx);
      return { element, remaining };
    }

    return { element: '', remaining: output };
  }

  private static findMatchingClosingBracket(input: string, startIdx: number, openChar: string, closeChar: string): number {
    let depth = 1;
    for (let i = startIdx + 1; i < input.length; i++) {
      if (input[i] === openChar) depth++;
      else if (input[i] === closeChar) {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  private static createRun(text: string, isOperator: boolean = false): string {
    const escaped = this.escapeXml(text);
    // If text is Arabic, digits, or operator, preserve normal font
    if (isOperator || /^[0-9.,]+$/.test(text) || /[\u0600-\u06FF]/.test(text)) {
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
