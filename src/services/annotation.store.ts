import { Annotation, HighlightColor, AnnotationRangeInfo } from '../core/types/annotation';

const STORAGE_KEY = 'mdfull_annotations_v1';

type Listener = () => void;

class AnnotationStore {
  private annotationsByDoc: Map<string, Annotation[]> = new Map();
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.saveToStorage();
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Annotation listener error:', err);
      }
    });
  }

  public getAnnotations(docId: string): Annotation[] {
    return this.annotationsByDoc.get(docId) || [];
  }

  public getAllAnnotationsCount(docId: string): number {
    return this.getAnnotations(docId).length;
  }

  public addAnnotation(
    docId: string,
    text: string,
    color: HighlightColor,
    note?: string,
    rangeInfo?: AnnotationRangeInfo
  ): Annotation {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Cannot annotate empty text');
    }

    const now = Date.now();
    const newAnnotation: Annotation = {
      id: `ann_${now}_${Math.random().toString(36).slice(2, 7)}`,
      docId,
      text: trimmed,
      color,
      note: note?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      rangeInfo,
    };

    const current = this.getAnnotations(docId);
    this.annotationsByDoc.set(docId, [...current, newAnnotation]);
    this.notify();
    return newAnnotation;
  }

  public updateAnnotation(
    id: string,
    updates: Partial<Pick<Annotation, 'color' | 'note'>>
  ): boolean {
    for (const [docId, list] of this.annotationsByDoc.entries()) {
      const index = list.findIndex((a) => a.id === id);
      if (index !== -1) {
        const existing = list[index];
        const updated: Annotation = {
          ...existing,
          color: updates.color ?? existing.color,
          note: updates.note !== undefined ? updates.note.trim() || undefined : existing.note,
          updatedAt: Date.now(),
        };
        const newList = [...list];
        newList[index] = updated;
        this.annotationsByDoc.set(docId, newList);
        this.notify();
        return true;
      }
    }
    return false;
  }

  public deleteAnnotation(id: string): boolean {
    for (const [docId, list] of this.annotationsByDoc.entries()) {
      const filtered = list.filter((a) => a.id !== id);
      if (filtered.length !== list.length) {
        this.annotationsByDoc.set(docId, filtered);
        this.notify();
        return true;
      }
    }
    return false;
  }

  public clearDocumentAnnotations(docId: string): void {
    if (this.annotationsByDoc.has(docId)) {
      this.annotationsByDoc.delete(docId);
      this.notify();
    }
  }

  public exportToMarkdown(docId: string, docTitle?: string): string {
    const list = this.getAnnotations(docId);
    const title = docTitle || 'Document';
    const lines: string[] = [
      `# ${title} - Highlights & Annotations Summary`,
      `> Exported from MDFull on ${new Date().toLocaleString()}`,
      `> Total Highlights: ${list.length}`,
      '',
      '---',
      '',
    ];

    if (list.length === 0) {
      lines.push('*No highlights or annotations recorded in this document.*');
      return lines.join('\n');
    }

    list.forEach((item, idx) => {
      lines.push(`### ${idx + 1}. [${item.color.toUpperCase()}] Highlight`);
      lines.push(`> "${item.text}"`);
      lines.push('');
      if (item.note) {
        lines.push(`**Note:** ${item.note}`);
        lines.push('');
      }
      lines.push(`*Recorded on ${new Date(item.createdAt).toLocaleString()}*`);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  private saveToStorage(): void {
    try {
      const data: Record<string, Annotation[]> = {};
      this.annotationsByDoc.forEach((val, key) => {
        data[key] = val;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to persist annotations to localStorage:', err);
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.entries(parsed).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            this.annotationsByDoc.set(key, value);
          }
        });
      }
    } catch (err) {
      console.warn('Failed to parse stored annotations:', err);
    }
  }
}

export const annotationStore = new AnnotationStore();
