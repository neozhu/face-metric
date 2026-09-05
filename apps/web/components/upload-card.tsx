"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/camera-capture";
import { LoadingDots } from "@/components/loading-dots";
import { UploadCloud, Camera, ImagePlus, RefreshCw, X, Sparkles } from "lucide-react";

export function UploadCard({
  label,
  file,
  previewUrl,
  busy = false,
  onPickFile,
  onClear
}: {
  label?: string;
  file: File | null;
  previewUrl: string | null;
  busy?: boolean;
  onPickFile: (f: File) => void;
  onClear?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<"upload" | "camera">("upload");
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!busy) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (busy) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      onPickFile(droppedFile);
    }
  }

  return (
    <Card className="relative overflow-hidden group transition-all duration-200 border-border/70 hover:border-slate-700 w-full">
      <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4 flex flex-col items-center w-full">
        {/* Card Header Label */}
        {label ? (
          <div className="w-full flex items-center justify-between pb-1 border-b border-border/40">
            <span className="text-xs sm:text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              {label}
            </span>
            {file && !busy && onClear ? (
              <button
                type="button"
                onClick={onClear}
                className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors text-xs flex items-center gap-1"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Mode Tabs */}
        <div className="w-full">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as any)}
            options={[
              {
                value: "upload",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload</span>
                  </span>
                ),
                disabled: busy
              },
              {
                value: "camera",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" />
                    <span>Camera</span>
                  </span>
                ),
                disabled: busy
              }
            ]}
          />
        </div>

        {tab === "upload" ? (
          <div className="w-full flex flex-col items-center space-y-3">
            {/* Clickable & Drag-Drop Preview Circle */}
            <div
              onClick={() => {
                if (!busy) inputRef.current?.click();
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!busy) inputRef.current?.click();
                }
              }}
              className={[
                "mx-auto w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 aspect-square",
                "rounded-full overflow-hidden cursor-pointer",
                "bg-gradient-to-b from-slate-900/80 to-black/50",
                "shadow-[0_0_0_1px_rgba(30,41,59,0.55),0_12px_40px_rgba(0,0,0,0.35)]",
                "transition-all duration-200 relative flex items-center justify-center select-none",
                isDragging
                  ? "ring-2 ring-cyan-400 border-transparent scale-102 bg-cyan-950/20"
                  : previewUrl
                  ? "ring-2 ring-cyan-500/40 hover:ring-cyan-500/70"
                  : "border border-dashed border-border hover:border-cyan-500/50 hover:bg-slate-900/40"
              ].join(" ")}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-center flex flex-col items-center justify-center p-3 gap-1.5">
                  <div className="h-10 w-10 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-slate-300 font-medium leading-tight">
                    {isDragging ? "Drop photo here" : "Choose or drop photo"}
                  </span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP</span>
                </div>
              )}

              {/* Cropping overlay */}
              {busy ? (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-1">
                  <div className="text-xs text-cyan-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 animate-pulse text-cyan-400" />
                    Detecting Face <LoadingDots />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full text-xs sm:text-sm py-2 h-9 sm:h-10 flex items-center justify-center gap-1.5"
                disabled={busy}
              >
                {file ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                    <span>Change Photo</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5 text-slate-400" />
                    <span>Select Photo</span>
                  </>
                )}
              </Button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
                e.target.value = "";
              }}
            />
          </div>
        ) : (
          <CameraCapture
            onCapture={(f) => {
              onPickFile(f);
              setTab("upload");
            }}
            disabled={busy}
          />
        )}
      </CardContent>
    </Card>
  );
}
