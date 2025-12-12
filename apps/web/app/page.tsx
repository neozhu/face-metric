"use client";

import { useEffect, useMemo, useState } from "react";
import { compareFaces, preprocessFaceImage, type CompareResponse } from "@/lib/api";
import { UploadCard } from "@/components/upload-card";
import { ResultRing } from "@/components/result-ring";
import { PrivacyBadge } from "@/components/privacy-badge";
import { ConfidenceRow } from "@/components/confidence-row";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/toast";
import { LoadingDots } from "@/components/loading-dots";
import { ScanFace, ArrowLeftRight, Github } from "lucide-react";

export default function Page() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [preppingA, setPreppingA] = useState(false);
  const [preppingB, setPreppingB] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [loadingStage, setLoadingStage] = useState<"uploading" | "embedding" | "scoring">("uploading");

  const previewA = useMemo(() => (fileA ? URL.createObjectURL(fileA) : null), [fileA]);
  const previewB = useMemo(() => (fileB ? URL.createObjectURL(fileB) : null), [fileB]);

  async function onCompare() {
    if (!fileA || !fileB) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStage("uploading");
    try {
      const res = await compareFaces(fileA, fileB);
      setResult(res);
    } catch (e: any) {
      const detail = e?.detail;
      setError(detail?.message || e.message || "Compare failed");
    } finally {
      setLoading(false);
    }
  }

  const score = result?.similarity ?? 0;
  const scorePct = Math.round(displayScore * 100);

  useEffect(() => {
    if (!result) {
      setDisplayScore(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = displayScore;
    const to = result.similarity;
    const dur = 650;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (!loading) return;
    const t1 = setTimeout(() => setLoadingStage("embedding"), 650);
    const t2 = setTimeout(() => setLoadingStage("scoring"), 1650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 min-h-screen flex flex-col">
      <Toast message={error} onDone={() => setError(null)} />

      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-card/60 border border-border/70 shadow-[0_0_0_1px_rgba(30,41,59,0.35)] flex items-center justify-center">
              <ScanFace className="h-5 w-5 text-accent" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">Face Metric</h1>
              <p className="text-sm text-slate-400">See the resemblance.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/neozhu/face-metric"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-3 py-2 text-sm text-slate-200 hover:bg-card/70 transition-colors"
            >
              <Github className="h-4 w-4 text-slate-200" />
              GitHub
            </a>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:gap-6">
          <UploadCard
            file={fileA}
            previewUrl={previewA}
            busy={preppingA}
            onPickFile={(f) => {
              setResult(null);
              setError(null);
              setPreppingA(true);
              setFileA(null);
              preprocessFaceImage(f)
                .then((cropped) => {
                  setFileA(cropped);
                })
                .catch((e: any) => {
                  setFileA(null);
                  const detail = e?.detail;
                  setError(detail?.message || e.message || "Preprocess failed");
                })
                .finally(() => {
                  setPreppingA(false);
                });
            }}
          />
          <UploadCard
            file={fileB}
            previewUrl={previewB}
            busy={preppingB}
            onPickFile={(f) => {
              setResult(null);
              setError(null);
              setPreppingB(true);
              setFileB(null);
              preprocessFaceImage(f)
                .then((cropped) => {
                  setFileB(cropped);
                })
                .catch((e: any) => {
                  setFileB(null);
                  const detail = e?.detail;
                  setError(detail?.message || e.message || "Preprocess failed");
                })
                .finally(() => {
                  setPreppingB(false);
                });
            }}
          />
        </section>

        <section className="flex items-center justify-center">
          <Button
            size="lg"
            disabled={!fileA || !fileB || preppingA || preppingB || loading}
            onClick={onCompare}
            className="min-w-40"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                Comparing <LoadingDots />
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Compare
              </span>
            )}
          </Button>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1 flex justify-center">
            <ResultRing value={displayScore} loading={loading} />
          </div>
          <div className="lg:col-span-2 space-y-3">
            <div className="text-4xl font-bold tracking-tight">
              {loading ? (
                <span className="text-slate-400">
                  Processing <LoadingDots />
                </span>
              ) : result ? (
                `${scorePct}%`
              ) : (
                "—"
              )}
            </div>
            {loading ? (
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="h-4 rounded shimmer" />
                <div className="h-4 rounded shimmer" />
                <div className="h-4 rounded shimmer" />
                <div className="h-4 rounded shimmer" />
              </div>
            ) : (
              <ConfidenceRow confidence={result?.confidence ?? 0} model={result?.model ?? "—"} />
            )}
            {loading || error ? (
              <div className="text-sm text-slate-300">
                {loading
                  ? loadingStage === "uploading"
                    ? "Uploading images…"
                    : loadingStage === "embedding"
                    ? "Extracting embeddings…"
                    : "Computing similarity…"
                  : error}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <footer className="mt-auto text-xs text-slate-500 pt-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <PrivacyBadge />
          <div className="max-w-2xl text-xs text-slate-500 leading-relaxed">
            Try it for fun: compare a younger photo vs. today, see which parent your child resembles more, or explore
            how similar siblings look across different ages and lighting.
          </div>
        </div>
      </footer>
    </main>
  );
}
