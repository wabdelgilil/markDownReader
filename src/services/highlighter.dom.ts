import { Annotation, HIGHLIGHT_PALETTE } from '../core/types/annotation';

export class DomHighlighter {
  /**
   * Applies annotations to the target container DOM.
   * Strips previous highlight marks and re-applies the active annotation set.
   */
  public static apply(root: HTMLElement, annotations: Annotation[]): void {
    if (!root) return;

    // 1. Un-wrap existing marks to prevent nested or stale highlights
    this.clearMarks(root);

    if (!annotations || annotations.length === 0) return;

    // 2. Sort annotations by text length descending so longer phrases match before sub-phrases
    const sorted = [...annotations].sort((a, b) => b.text.length - a.text.length);

    sorted.forEach((ann) => {
      this.highlightText(root, ann);
    });
  }

  /**
   * Removes all highlight marks from container, preserving original text nodes
   */
  public static clearMarks(root: HTMLElement): void {
    const marks = root.querySelectorAll('mark.mdfull-highlight');
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
      }
    });
  }

  /**
   * Smoothly scrolls to a specific highlight mark and provides a pulse flash
   */
  public static scrollToAnnotation(root: HTMLElement, id: string): boolean {
    if (!root) return false;
    const mark = root.querySelector(`mark[data-annotation-id="${id}"]`) as HTMLElement;
    if (!mark) return false;

    mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    mark.classList.add('ring-2', 'ring-theme-accent', 'scale-[1.02]');
    setTimeout(() => {
      mark.classList.remove('ring-2', 'ring-theme-accent', 'scale-[1.02]');
    }, 1500);

    return true;
  }

  /**
   * Searches text nodes to wrap the target phrase with an interactive mark element
   */
  private static highlightText(root: HTMLElement, ann: Annotation): void {
    const targetText = ann.text.trim();
    if (!targetText) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node: Node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          // Skip script, style, SVG, and interactive buttons
          if (['script', 'style', 'svg', 'path', 'button'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('.mermaid-target, .katex-html, mark.mdfull-highlight')) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const nodesToReplace: Array<{ node: Text; index: number }> = [];
    let currentNode: Node | null = walker.nextNode();

    while (currentNode) {
      const textNode = currentNode as Text;
      const content = textNode.nodeValue || '';
      const idx = content.indexOf(targetText);
      if (idx !== -1) {
        nodesToReplace.push({ node: textNode, index: idx });
        break; // Match one instance per annotation
      }
      currentNode = walker.nextNode();
    }

    nodesToReplace.forEach(({ node, index }) => {
      const text = node.nodeValue || '';
      const beforeText = text.slice(0, index);
      const matchedText = text.slice(index, index + targetText.length);
      const afterText = text.slice(index + targetText.length);

      const mark = document.createElement('mark');
      mark.setAttribute('data-annotation-id', ann.id);
      mark.setAttribute('data-color', ann.color);
      const palette = HIGHLIGHT_PALETTE[ann.color];
      mark.className = `mdfull-highlight ${palette.bgClass} border-b-2 ${palette.borderClass} rounded-sm px-0.5 transition-all cursor-pointer inline-block select-text`;
      mark.textContent = matchedText;

      if (ann.note) {
        mark.setAttribute('data-has-note', 'true');
        const noteDot = document.createElement('span');
        noteDot.className = 'inline-block w-1.5 h-1.5 rounded-full bg-theme-accent ml-1 -translate-y-1';
        noteDot.title = ann.note;
        mark.appendChild(noteDot);
      }

      const parent = node.parentNode;
      if (parent) {
        if (beforeText) {
          parent.insertBefore(document.createTextNode(beforeText), node);
        }
        parent.insertBefore(mark, node);
        if (afterText) {
          parent.insertBefore(document.createTextNode(afterText), node);
        }
        parent.removeChild(node);
      }
    });
  }
}
