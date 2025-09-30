/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/upload/useUploader.ts
"use client";

import { useUploadContext } from "@/providers/UploadProvider";
import { useCallback, useMemo, useRef, useState } from "react";

export type UploadResult = {
  url: string;
  path?: string;
  size?: number;
  mime?: string;
};

export type UploadOptions = {
  bucket?: "publicFiles" | "protectedFiles"; // extend with your edgestore buckets
  folder?: string; // e.g. "avatars", "attachments/abc"
  onProgress?: (p: number) => void;
  fileName?: string; // optional override
};

export type Constraints = {
  maxMB?: number; // e.g. 5
  accept?: string[]; // e.g. ["image/png","image/jpeg"]
  imageOnly?: boolean; // quick guard
  squareOnly?: boolean; // for avatars
  maxWidth?: number; // optional image width guard
  maxHeight?: number; // optional image height guard
};

export function useUploader() {
  const { edgestore, active, setActive } = useUploadContext();
  const [progress, setProgress] = useState(0);
  const [isUploading, setUploading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const validate = useCallback(async (file: File, rules?: Constraints) => {
    if (!rules) return;
    const { maxMB, accept, imageOnly, squareOnly, maxWidth, maxHeight } = rules;

    if (maxMB && file.size > maxMB * 1024 * 1024) {
      throw new Error(`Le fichier dépasse ${maxMB} Mo.`);
    }
    if (accept && accept.length && !accept.includes(file.type)) {
      throw new Error(`Type non autorisé (${file.type}).`);
    }
    if (imageOnly && !file.type.startsWith("image/")) {
      throw new Error("Le fichier doit être une image.");
    }
    if (squareOnly || maxWidth || maxHeight) {
      const dims = await getImageDimensions(file);
      if (squareOnly && dims.width !== dims.height) {
        throw new Error("L'image doit être carrée.");
      }
      if (maxWidth && dims.width > maxWidth) {
        throw new Error(`Largeur maximale ${maxWidth}px.`);
      }
      if (maxHeight && dims.height > maxHeight) {
        throw new Error(`Hauteur maximale ${maxHeight}px.`);
      }
    }
  }, []);

  const uploadFile = useCallback(
    async (
      file: File,
      opts?: UploadOptions,
      rules?: Constraints
    ): Promise<UploadResult> => {
      await validate(file, rules);

      setUploading(true);
      setActive((n) => n + 1);
      setProgress(0);

      try {
        controllerRef.current = new AbortController();
        const bucket = opts?.bucket ?? "publicFiles";
        const folder = opts?.folder
          ? `${opts.folder.replace(/^\/|\/$/g, "")}/`
          : "";
        const fileName = opts?.fileName ?? file.name;

        const res = await (edgestore as any)[bucket].upload({
          file,
          input: { path: `${folder}${fileName}` }, // edgestore supports "input" if you configured it
          signal: controllerRef.current.signal,
          onProgressChange: (p: number) => {
            setProgress(p);
            opts?.onProgress?.(p);
          },
        });

        return {
          url: res.url,
          path: (res as any).path,
          size: file.size,
          mime: file.type,
        };
      } finally {
        setUploading(false);
        setActive((n) => Math.max(0, n - 1));
        controllerRef.current = null;
      }
    },
    [edgestore, setActive, validate]
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const deleteFile = useCallback(
    (url: string, bucket: "publicFiles" | "protectedFiles" = "publicFiles") => {
      return edgestore[bucket].deleteFile({ url });
    },
    [edgestore]
  );

  return useMemo(
    () => ({
      isUploading,
      progress,
      activeUploads: active,
      uploadFile,
      cancel,
      deleteFile,
    }),
    [isUploading, progress, active, uploadFile, cancel, deleteFile]
  );
}

async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = document.createElement("img");
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}
