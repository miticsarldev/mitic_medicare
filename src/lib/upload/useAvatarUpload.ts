"use client";

import { useState, useCallback } from "react";
import { useUploader } from "./useUploader";

type AvatarUploadConfig = {
  folder?: string; // default "avatars"
  maxMB?: number; // default 5
  squareOnly?: boolean; // default true
};

export function useAvatarUpload(cfg?: AvatarUploadConfig) {
  const { uploadFile, isUploading, progress, cancel, deleteFile } =
    useUploader();
  const [preview, setPreview] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const onPick = useCallback(
    async (file: File) => {
      // instant preview
      const fr = new FileReader();
      fr.onloadend = () => setPreview(fr.result as string);
      fr.readAsDataURL(file);

      const res = await uploadFile(
        file,
        { folder: cfg?.folder ?? "avatars", bucket: "publicFiles" },
        {
          imageOnly: true,
          squareOnly: cfg?.squareOnly ?? false,
          maxMB: cfg?.maxMB ?? 5,
          accept: ["image/png", "image/jpeg", "image/webp"],
        }
      );

      setUrl(res.url);
      return res.url;
    },
    [uploadFile, cfg?.folder, cfg?.maxMB, cfg?.squareOnly]
  );

  async function deleteByUrl(url: string) {
    if (!url) return;
    try {
      await deleteFile(url);
    } catch {
      // swallow cleanup errors
    }
  }

  return {
    isUploading,
    progress,
    cancel,
    preview, // data URL preview
    url, // remote URL (persist this to DB)
    onPick, // call with File
    setUrl, // allow manual override
    setPreview,
    deleteByUrl,
  };
}
