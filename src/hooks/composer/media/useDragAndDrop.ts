import { useState } from "react";

interface UseDragAndDropProps {
  onFilesSelected: (files: FileList) => void;
}

export function useDragAndDrop({ onFilesSelected }: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget.contains(e.relatedTarget as Node)) return;

    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    if (e.dataTransfer.files.length === 0) return;

    onFilesSelected(e.dataTransfer.files);
  };

  return {
    isDragging,

    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
