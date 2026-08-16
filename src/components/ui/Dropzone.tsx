"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icons/Icon";

type DropzoneProps = {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  previewUrl?: string | null;
  className?: string;
};

export function Dropzone({
  onFilesSelected,
  accept = "image/*",
  multiple = false,
  label = "Drop an image here, or click to browse",
  hint,
  previewUrl,
  className,
}: DropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFilesSelected(files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFilesSelected(files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragEnter={(e) => handleDrag(e, true)}
      onDragOver={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDrop={handleDrop}
      className={cn(
        "relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-outline-variant p-8 text-center transition-colors duration-300 overflow-hidden",
        dragActive ? "border-primary bg-surface-container" : "hover:border-primary/60",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <Icon name="upload" size={32} className="text-on-surface-variant" />
          <p className="font-body-md text-sm text-on-surface-variant">{label}</p>
          {hint && <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant/70">{hint}</p>}
        </>
      )}
    </div>
  );
}
