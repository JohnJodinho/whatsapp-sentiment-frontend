import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';

// Define the props that our hook will accept
interface UseFileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
}

// Define what the hook will return
interface UseFileDropzoneReturn {
  getRootProps: <T extends Record<string, unknown>>(props?: T) => T;
  getInputProps: <T extends Record<string, unknown>>(props?: T) => T;
  isDragActive: boolean;
  isFocused: boolean;
}

export function useFileDropzone({
  onFileSelect,
  accept = { 'text/plain': ['.txt'] },
}: UseFileDropzoneProps): UseFileDropzoneReturn {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // For now, we only handle the first accepted file.
      // Error handling for rejected files can be added later.
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
      
      if (fileRejections.length > 0) {
        // You can add toast notifications or error state logic here in a later stage
        console.error("File rejected:", fileRejections[0].errors[0].message);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  });

  return { getRootProps, getInputProps, isDragActive, isFocused };
}