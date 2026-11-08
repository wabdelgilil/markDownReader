import { IFileSystemAdapter, VirtualFile } from './types';

export class WebFileSystemAdapter implements IFileSystemAdapter {
  public async openFile(): Promise<VirtualFile | null> {
    // 1. Try modern File System Access API
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as unknown as { showOpenFilePicker: (options: unknown) => Promise<FileSystemFileHandle[]> }).showOpenFilePicker({
          types: [
            {
              description: 'Markdown Files',
              accept: {
                'text/markdown': ['.md', '.markdown', '.mdown', '.mkd'],
                'text/plain': ['.txt'],
              },
            },
          ],
          multiple: false,
        });

        const file = await handle.getFile();
        const content = await file.text();
        return {
          name: file.name,
          path: file.name,
          content,
          lastModified: file.lastModified,
          size: file.size,
        };
      } catch (err: unknown) {
        // User cancelled or aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }
      }
    }

    // 2. Standard input file fallback
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt';

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const content = await file.text();
        resolve({
          name: file.name,
          path: file.name,
          content,
          lastModified: file.lastModified,
          size: file.size,
        });
      };

      input.click();
    });
  }
}

export const webAdapter = new WebFileSystemAdapter();
