/**
 * Fullscreen & Zen Mode Service
 * Manages native HTML5 document fullscreen state and event listeners.
 */
export class FullscreenService {
  private static listeners: Set<(isFullscreen: boolean) => void> = new Set();

  public static isFullscreen(): boolean {
    if (typeof document === 'undefined') return false;
    return !!document.fullscreenElement;
  }

  public static async toggleFullscreen(): Promise<boolean> {
    if (typeof document === 'undefined') return false;

    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
      return true;
    } else {
      await document.exitFullscreen().catch(() => {});
      return false;
    }
  }

  public static subscribe(callback: (isFullscreen: boolean) => void): () => void {
    this.listeners.add(callback);

    const handler = () => {
      const active = this.isFullscreen();
      this.listeners.forEach((fn) => fn(active));
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', handler);
    }

    return () => {
      this.listeners.delete(callback);
      if (typeof document !== 'undefined') {
        document.removeEventListener('fullscreenchange', handler);
      }
    };
  }
}
