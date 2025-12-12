import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/camera-capture";
import { LoadingDots } from "@/components/loading-dots";

export function UploadCard({
  file,
  previewUrl,
  busy = false,
  onPickFile
}: {
  file: File | null;
  previewUrl: string | null;
  busy?: boolean;
  onPickFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<"upload" | "camera">("upload");

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="space-y-2 sm:space-y-3">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          options={[
            { value: "upload", label: "Upload", disabled: busy },
            { value: "camera", label: "Camera", disabled: busy }
          ]}
        />

        {tab === "upload" ? (
          <>
            <div
              className={[
                "mx-auto h-32 w-32 sm:h-44 sm:w-44 md:h-56 md:w-56",
                "rounded-full overflow-hidden",
                "bg-gradient-to-b from-slate-950/60 to-black/30",
                "shadow-[0_0_0_1px_rgba(30,41,59,0.55),0_16px_50px_rgba(0,0,0,0.35)]",
                previewUrl ? "ring-1 ring-slate-700/50" : "border border-dashed border-border",
                "relative flex items-center justify-center"
              ].join(" ")}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-xs sm:text-sm text-slate-400 px-4 sm:px-6">
                  Drop, upload, or capture
                </div>
              )}

              {busy ? (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="text-xs sm:text-sm text-slate-200">
                    Cropping <LoadingDots />
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1"
                disabled={busy}
              >
                {file ? "Replace" : "Upload"}
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
              }}
            />
          </>
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
