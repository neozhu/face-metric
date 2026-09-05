"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, SwitchCamera, AlertCircle } from "lucide-react";

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
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      setReady(false);
      setError(null);

      // Stop any existing stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported by browser");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 720 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.name === "NotAllowedError" ? "Camera permission denied" : e?.message || "Camera unavailable");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  }

  function toggleCamera() {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }

  return (
    <div className="space-y-2.5 sm:space-y-3 flex flex-col items-center w-full">
      <div className="relative mx-auto w-28 h-28 xs:w-36 xs:h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 aspect-square rounded-full overflow-hidden border border-border bg-black/40 shadow-inner flex items-center justify-center">
        {error ? (
          <div className="h-full w-full p-2 flex flex-col items-center justify-center text-center text-xs text-rose-400 gap-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="line-clamp-2">{error}</span>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              autoPlay
              muted
            />
            {!ready ? (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-xs text-slate-400">
                Starting camera...
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="flex w-full gap-2 items-center">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || !ready || !!error}
          onClick={capture}
          className="flex-1 text-xs sm:text-sm py-2 h-9 sm:h-10 flex items-center justify-center gap-1.5"
        >
          <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Capture
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={toggleCamera}
          title="Switch camera"
          className="px-2.5 sm:px-3 h-9 sm:h-10 text-xs shrink-0"
        >
          <SwitchCamera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
