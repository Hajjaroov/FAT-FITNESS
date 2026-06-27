"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { UserAvatar } from "@/app/_components/UserAvatar";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { settingsCopy } from "@/content/settings";
import { ApiError, uploadAvatar } from "@/lib/api";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.9,
    );
  });
}

type AvatarUploadProps = {
  userId: string;
  hasAvatar: boolean;
  displayName: string;
  onUploaded: () => void;
};

type UploadStatus = "idle" | "cropping" | "saving" | "success" | "error";

export function AvatarUpload({
  userId,
  hasAvatar,
  displayName,
  onUploaded,
}: AvatarUploadProps) {
  const copy = useLocalizedContent(settingsCopy);
  const { accessToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      setError(copy.avatar.invalidFileError);
      setStatus("error");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(copy.avatar.fileTooLargeError);
      setStatus("error");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
        setStatus("cropping");
        setError(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }
    });
    reader.readAsDataURL(file);
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels || !accessToken) return;
    setStatus("saving");
    setError(null);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      await uploadAvatar(blob, accessToken);
      setStatus("success");
      setImageSrc(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : copy.avatar.errorFallback,
      );
      setStatus("error");
    }
  }

  function handleCancel() {
    setImageSrc(null);
    setStatus("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <UserAvatar
          displayName={displayName}
          userId={userId}
          hasAvatar={hasAvatar}
          size={64}
          className="ring-2 ring-(--color-border)"
        />
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
          >
            {copy.avatar.changeLabel}
          </button>
          <p className="text-xs text-(--color-subtle)">{copy.avatar.hint}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {status === "error" && error ? (
        <p role="alert" className="mt-3 text-sm text-red-800 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {status === "success" ? (
        <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
          {copy.avatar.successMessage}
        </p>
      ) : null}

      {(status === "cropping" || status === "saving") && imageSrc ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.avatar.title}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCancel}
            aria-hidden="true"
          />
          <div className="relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-xl bg-(--color-surface) shadow-2xl">
            <div className="relative h-72 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex flex-col gap-3 p-5">
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Zoom"
                className="w-full accent-(--color-accent)"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-xl border border-(--color-border) px-4 py-2.5 text-sm font-semibold text-(--color-muted) transition hover:text-foreground"
                >
                  {copy.avatar.cancelLabel}
                </button>
                <button
                  type="button"
                  disabled={status === "saving"}
                  onClick={() => void handleConfirm()}
                  className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                >
                  {copy.avatar.uploadLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
