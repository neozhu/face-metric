import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/camera-capture";

export type FaceStatus = "not_checked" | "face_found" | "no_face" | "error";

export function UploadCard({
  title,
  file,
  previewUrl,
  status,
  onPickFile
}: {
  title: string;
  file: File | null;
  previewUrl: string | null;
  status: FaceStatus;
  onPickFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<"upload" | "camera">("upload");

  const badgeText =
    status === "not_checked"
      ? "Not checked"
      : status === "face_found"
      ? "Face found"
      : status === "no_face"
      ? "No face"
      : "Error";

  const badgeClass =
    status === "face_found"
      ? "border-accent/40 text-accent"
      : status === "no_face"
      ? "border-red-500/40 text-red-400"
      : status === "error"
      ? "border-yellow-500/40 text-yellow-400"
      : "text-slate-400";

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-100">{title}</div>
        <Badge className={badgeClass}>{badgeText}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          options={[
            { value: "upload", label: "Upload" },
            { value: "camera", label: "Camera" }
          ]}
        />

        {tab === "upload" ? (
          <>
            <div className="aspect-video w-full rounded-lg border border-dashed border-border bg-black/20 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={`${title} preview`} className="h-full w-full object-contain" />
              ) : (
                <div className="text-sm text-slate-400">Drop or upload an image</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1"
              >
                {file ? "Replace" : "Upload"}
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
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
          />
        )}
      </CardContent>
    </Card>
  );
}
