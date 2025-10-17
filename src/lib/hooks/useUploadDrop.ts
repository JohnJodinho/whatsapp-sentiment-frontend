import { useState, useCallback, useRef } from "react";
import type React from "react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface UseUploadDropOptions {
  /** Callback fired when a valid file is dropped or selected. */
  onFileDrop: (file: File) => void;
  /** Callback fired when a file is rejected due to validation errors. */
  onFileReject?: (reason: string) => void;
  /** Maximum file size in bytes. Defaults to 5MB. */
  maxSize?: number;
  /** Accepted file types. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept */
  accept?: Record<string, string[]>;
}

/**
 * Custom hook to manage drag-and-drop file upload functionality.
 * Handles drag events, keyboard activation, and client-side file validation.
 * @param options - Configuration options for the hook.
 * @returns An object with props to spread on the root and input elements.
 */
export function useUploadDrop({
  onFileDrop,
  onFileReject,
  maxSize = MAX_FILE_SIZE_BYTES,
  accept = { "text/plain": [".txt"] },
}: UseUploadDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isValidFile = useCallback(
    (file: File): { valid: boolean; reason?: string } => {
      const acceptedMimeTypes = Object.keys(accept);
      const acceptedExtensions = Object.values(accept).flat();

      if (!acceptedMimeTypes.includes(file.type) && !acceptedExtensions.some(ext => file.name.endsWith(ext))) {
        return { valid: false, reason: "Invalid file type. Please upload a .txt file." };
      }
      if (file.size > maxSize) {
        return { valid: false, reason: `File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.` };
      }
      return { valid: true };
    },
    [accept, maxSize]
  );

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const validation = isValidFile(file);
      if (validation.valid) {
        onFileDrop(file);
      } else {
        onFileReject?.(validation.reason || "Invalid file");
      }
    }
  }, [isValidFile, onFileDrop, onFileReject]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);
  
  const openFileDialog = () => {
    inputRef.current?.click();
  };
  
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFileDialog();
    }
  }, []);

  const getRootProps = () => ({
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onKeyDown,
    onClick: openFileDialog,
    role: "button",
    tabIndex: 0,
    "aria-label": "File drop zone",
  });

  const getInputProps = () => ({
    ref: inputRef,
    type: "file",
    style: { display: "none" },
    accept: Object.values(accept).flat().join(","),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files),
  });

  return { isDragging, getRootProps, getInputProps };
}