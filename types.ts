export enum AppMode {
  ENCRYPT = 'ENCRYPT',
  DECRYPT = 'DECRYPT'
}

export interface FileData {
  name: string;
  size: number;
  type: string;
  content: ArrayBuffer;
}

export interface ProcessResult {
  success: boolean;
  fileName?: string;
  blob?: Blob;
  error?: string;
}