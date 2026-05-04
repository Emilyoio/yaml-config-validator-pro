'use client'

import { useState, useCallback } from 'react';

export function useDragAndDrop(
  onDropFile: (content: string) => void,
  onInvalidFile: () => void
) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.yml') || file.name.endsWith('.yaml') || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const content = loadEvent.target?.result;
          if (typeof content === 'string') {
            onDropFile(content);
          }
        };
        reader.readAsText(file);
      } else {
        onInvalidFile();
      }
    }
  }, [onDropFile, onInvalidFile]);
  
  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
