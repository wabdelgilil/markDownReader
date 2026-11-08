import { TextDirection } from '../types';

/**
 * Bi-Directional (BiDi) Text Arbitrator
 * Provides block-level direction detection, inline code isolation, and punctuation locking.
 */
export class BiDiArbitrator {
  // Regex matching Arabic and Hebrew Unicode code point ranges
  private static readonly ARABIC_HEBREW_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g;

  /**
   * Detects the dominant direction of a text segment based on script character density.
   */
  public static detectDirection(text: string): TextDirection {
    if (!text || text.trim().length === 0) return 'auto';

    // Strip code fences, inline code, and URLs from density calculation
    const sanitized = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`.*?`/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (sanitized.length === 0) return 'ltr';

    const arabicMatches = sanitized.match(this.ARABIC_HEBREW_REGEX);
    const arabicCount = arabicMatches ? arabicMatches.length : 0;
    const totalLetters = sanitized.replace(/[\s\d\p{P}]/gu, '').length;

    if (totalLetters === 0) {
      return arabicCount > 0 ? 'rtl' : 'ltr';
    }

    // If more than 30% of actual letters are Arabic, enforce RTL block flow
    return (arabicCount / totalLetters) >= 0.3 ? 'rtl' : 'ltr';
  }

  /**
   * Wraps inline code tokens in <bdi dir="ltr"> to prevent bracket and punctuation inversion.
   */
  public static isolateCodeSpans(html: string): string {
    return html.replace(/<code>(.*?)<\/code>/g, (_match, codeContent) => {
      return `<code class="font-mono text-sm px-1.5 py-0.5 rounded bg-theme-code text-theme-accent border border-theme-border/50" dir="ltr"><bdi dir="ltr">${codeContent}</bdi></code>`;
    });
  }

  /**
   * Ensures that trailing punctuation in mixed BiDi sentences remains anchored cleanly.
   */
  public static anchorPunctuation(text: string, direction: TextDirection): string {
    if (direction !== 'rtl') return text;
    // Append Left-to-Right or Right-to-Left Mark (RLM) where appropriate
    return text.replace(/([0-9a-zA-Z\-_/]+)([\.\?\!:،؛])$/g, '$1&rlm;$2');
  }
}
