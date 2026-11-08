export interface WorkspaceFileNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: WorkspaceFileNode[];
  content?: string;
}

export class WorkspaceService {
  private static rootNode: WorkspaceFileNode | null = null;
  private static listeners: Set<(root: WorkspaceFileNode | null) => void> = new Set();

  public static getRoot(): WorkspaceFileNode | null {
    return this.rootNode;
  }

  public static setRoot(node: WorkspaceFileNode | null): void {
    this.rootNode = node;
    this.listeners.forEach((listener) => listener(this.rootNode));
  }

  public static subscribe(callback: (root: WorkspaceFileNode | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Prompts user to select a directory using File System Access API or webkitdirectory input
   */
  public static async openDirectory(): Promise<WorkspaceFileNode | null> {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
        const root = await this.readDirectoryHandle(dirHandle, '');
        this.setRoot(root);
        return root;
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Directory open error:', err);
        }
        return null;
      }
    } else {
      // Fallback: programmatic hidden directory input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.setAttribute('webkitdirectory', 'true');
        input.setAttribute('directory', 'true');
        input.multiple = true;

        input.onchange = async () => {
          if (!input.files || input.files.length === 0) {
            resolve(null);
            return;
          }
          const root = await this.buildTreeFromFiles(Array.from(input.files));
          this.setRoot(root);
          resolve(root);
        };

        input.click();
      });
    }
  }

  private static async readDirectoryHandle(
    dirHandle: FileSystemDirectoryHandle,
    currentPath: string
  ): Promise<WorkspaceFileNode> {
    const children: WorkspaceFileNode[] = [];
    const dirPath = currentPath ? `${currentPath}/${dirHandle.name}` : dirHandle.name;

    for await (const entry of (dirHandle as unknown as { values: () => AsyncIterable<FileSystemHandle> }).values()) {
      if (entry.kind === 'directory') {
        const subDir = await this.readDirectoryHandle(entry as FileSystemDirectoryHandle, dirPath);
        if (subDir.children && subDir.children.length > 0) {
          children.push(subDir);
        }
      } else if (entry.kind === 'file') {
        const ext = entry.name.toLowerCase();
        if (ext.endsWith('.md') || ext.endsWith('.markdown')) {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const content = await file.text();
          children.push({
            id: `${dirPath}/${entry.name}`,
            name: entry.name,
            path: `${dirPath}/${entry.name}`,
            isDirectory: false,
            content,
          });
        }
      }
    }

    // Sort: directories first, then alphabetical files
    children.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      id: dirPath,
      name: dirHandle.name,
      path: dirPath,
      isDirectory: true,
      children,
    };
  }

  private static async buildTreeFromFiles(files: File[]): Promise<WorkspaceFileNode> {
    const rootName = files[0].webkitRelativePath.split('/')[0] || 'Workspace';
    const root: WorkspaceFileNode = {
      id: rootName,
      name: rootName,
      path: rootName,
      isDirectory: true,
      children: [],
    };

    for (const file of files) {
      const ext = file.name.toLowerCase();
      if (!ext.endsWith('.md') && !ext.endsWith('.markdown')) continue;

      const pathSegments = file.webkitRelativePath.split('/');
      let currentDir = root;

      for (let i = 1; i < pathSegments.length - 1; i++) {
        const seg = pathSegments[i];
        let subDir = currentDir.children?.find((c) => c.name === seg && c.isDirectory);
        if (!subDir) {
          subDir = {
            id: `${currentDir.path}/${seg}`,
            name: seg,
            path: `${currentDir.path}/${seg}`,
            isDirectory: true,
            children: [],
          };
          currentDir.children?.push(subDir);
        }
        currentDir = subDir;
      }

      const content = await file.text();
      currentDir.children?.push({
        id: file.webkitRelativePath,
        name: file.name,
        path: file.webkitRelativePath,
        isDirectory: false,
        content,
      });
    }

    return root;
  }
}
