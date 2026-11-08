import { DocumentTab } from '../core/types';
import { MarkdownPipeline } from '../core/parser/markdown';

export type StoreListener = () => void;

/**
 * Reactive Multi-Tab Document Store
 */
class DocumentStore {
  private tabs: DocumentTab[] = [];
  private activeTabId: string | null = null;
  private listeners: Set<StoreListener> = new Set();
  private diagramsMap: Map<string, Map<string, string>> = new Map();

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public getTabs(): DocumentTab[] {
    return [...this.tabs];
  }

  public getActiveTab(): DocumentTab | null {
    if (!this.activeTabId) return null;
    return this.tabs.find((t) => t.id === this.activeTabId) || null;
  }

  public getActiveDiagrams(): Map<string, string> {
    if (!this.activeTabId) return new Map();
    return this.diagramsMap.get(this.activeTabId) || new Map();
  }

  public openTab(name: string, path: string, content: string): string {
    // If already open, switch to it
    const existing = this.tabs.find((t) => t.path === path && path !== '');
    if (existing) {
      this.activeTabId = existing.id;
      this.notify();
      return existing.id;
    }

    const id = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const { document: parsed, diagrams } = MarkdownPipeline.parse(content);
    this.diagramsMap.set(id, diagrams);

    const newTab: DocumentTab = {
      id,
      name,
      path,
      content,
      parsed,
      scrollPosition: 0,
      isModified: false,
    };

    this.tabs.push(newTab);
    this.activeTabId = id;
    this.notify();
    return id;
  }

  public closeTab(tabId: string): void {
    const index = this.tabs.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    this.tabs.splice(index, 1);
    this.diagramsMap.delete(tabId);

    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        // Activate adjacent tab
        const nextIndex = Math.min(index, this.tabs.length - 1);
        this.activeTabId = this.tabs[nextIndex].id;
      } else {
        this.activeTabId = null;
      }
    }

    this.notify();
  }

  public setActiveTab(tabId: string): void {
    if (this.activeTabId === tabId) return;
    const exists = this.tabs.some((t) => t.id === tabId);
    if (exists) {
      this.activeTabId = tabId;
      this.notify();
    }
  }

  public updateTabContent(tabId: string, content: string): void {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const { document: parsed, diagrams } = MarkdownPipeline.parse(content);
    this.diagramsMap.set(tabId, diagrams);

    tab.content = content;
    tab.parsed = parsed;
    tab.isModified = true;
    this.notify();
  }
}

export const documentStore = new DocumentStore();
