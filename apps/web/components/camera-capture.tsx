 "use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function CameraCapture({
  onCapture,
  disabled
}: {
  onCapture: (file: File) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e: any) {
        setError(e?.message || "Camera unavailable");
      }
    }
    start();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture(file);
    }, "image/jpeg", 0.92);
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full rounded-lg border border-border bg-black/30 overflow-hidden">
        {error ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
            {error}
          </div>
        ) : (
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        )}
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || !ready || !!error}
        onClick={capture}
        className="w-full"
      >
        Capture
      </Button>
    </div>
  );
}
