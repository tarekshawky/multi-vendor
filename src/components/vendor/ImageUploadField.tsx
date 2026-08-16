"use client";

import { useState } from "react";
import { Dropzone } from "@/components/ui/Dropzone";

type ImageUploadFieldProps = {
  name: string;
  defaultValue?: string | null;
  label?: string;
  hint?: string;
  className?: string;
};

export function ImageUploadField({ name, defaultValue, label, hint, className }: ImageUploadFieldProps) {
  const [url, setUrl] = useState<string | null>(defaultValue ?? null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setUrl(data.url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <input type="hidden" name={name} value={url ?? ""} />
      <Dropzone
        onFilesSelected={handleFiles}
        previewUrl={url}
        label={uploading ? "Uploading…" : label}
        hint={hint}
      />
    </div>
  );
}
