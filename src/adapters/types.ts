/**
 * Host Adapter Abstractions for Cross-Platform File Operations
 */

export interface VirtualFile {
  name: string;
  path: string;
  content: string;
  lastModified: number;
  size: number;
}

export interface IFileSystemAdapter {
  openFile(): Promise<VirtualFile | null>;
  openDirectory?(): Promise<VirtualFile[]>;
  saveFile?(path: string, content: string): Promise<boolean>;
  watchFile?(path: string, onChange: (content: string) => void): () => void;
}
