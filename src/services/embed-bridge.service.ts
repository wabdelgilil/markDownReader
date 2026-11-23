import { ReadingTheme } from '../core/types';
import { documentStore } from './document.store';

interface EmbedLoadMessage {
  type: 'mdfull:load';
  filename?: unknown;
  path?: unknown;
  content?: unknown;
  theme?: unknown;
}

const VALID_THEMES: ReadonlySet<string> = new Set(['light', 'dark', 'sepia', 'editor']);

function isAllowedOrigin(origin: string): boolean {
  if (origin === 'null') return true;
  if (origin === 'https://wabdelgilil.github.io') return true;
  return /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin);
}

function isEmbedLoadMessage(data: unknown): data is EmbedLoadMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'mdfull:load' &&
    typeof (data as { content?: unknown }).content === 'string'
  );
}

/**
 * Enables external local governance portals to stream Markdown documents
 * directly into MDFull via postMessage without clipboard or URL limits.
 */
export class EmbedBridgeService {
  public static attach(onThemeChange: (theme: ReadingTheme) => void): () => void {
    const handleMessage = (event: MessageEvent): void => {
      if (!isAllowedOrigin(event.origin)) return;
      if (!isEmbedLoadMessage(event.data)) return;

      const content = event.data.content as string;
      const docPath =
        typeof event.data.path === 'string' && event.data.path.trim()
          ? event.data.path.trim()
          : 'embedded.md';
      const filename =
        typeof event.data.filename === 'string' && event.data.filename.trim()
          ? event.data.filename.trim()
          : docPath.split('/').pop() || 'document.md';

      const existing = documentStore.getTabs().find((t) => t.path === docPath);
      if (existing) {
        documentStore.updateTabContent(existing.id, content);
        documentStore.setActiveTab(existing.id);
      } else {
        documentStore.openTab(filename, docPath, content);
      }

      if (typeof event.data.theme === 'string' && VALID_THEMES.has(event.data.theme)) {
        onThemeChange(event.data.theme as ReadingTheme);
      }
    };

    window.addEventListener('message', handleMessage);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'mdfull:ready', version: '1.0' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }
}
