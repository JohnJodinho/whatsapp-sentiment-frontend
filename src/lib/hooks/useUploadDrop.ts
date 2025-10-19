import { useState, useCallback, useRef } from "react";
import type React from "react";

const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 5MB

interface UseUploadDropOptions {
  onFileDrop: (file: File) => void;
  onFileReject?: (reason: string) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean
}

export function useUploadDrop({
  onFileDrop,
  onFileReject,
  maxSize = MAX_FILE_SIZE_BYTES,
  accept = { "text/plain": [".txt"], "application/zip":  [".zip", ".x-zip-compressed"]},
  disabled = false
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
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [disabled]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [disabled, isDragging]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, [disabled]);

  const onDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [disabled, handleFileSelect]);
  
  const openFileDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };
  
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFileDialog();
    }
  }, [disabled]);

  const getRootProps = () => ({
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onKeyDown,
    onClick: openFileDialog,
    role: "button",
    tabIndex: disabled ? -1 : 0,
    "aria-label": "File drop zone",
    "aria-disabled": disabled,
  });

  const getInputProps = () => ({
    ref: inputRef,
    type: "file",
    style: { display: "none" },
    accept: Object.values(accept).flat().join(","),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files),
    disabled,
  });

  return { isDragging, getRootProps, getInputProps };
}