"use client";

import { useEffect, useMemo, useState } from "react";
import { compareFaces, preprocessFaceImage, type CompareResponse } from "@/lib/api";
import { UploadCard } from "@/components/upload-card";
import { ResultRing } from "@/components/result-ring";
import { PrivacyBadge } from "@/components/privacy-badge";
import { ResemblanceCard } from "@/components/resemblance-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toast } from "@/components/toast";
import { LoadingDots } from "@/components/loading-dots";
import {
  ScanFace,
  ArrowLeftRight,
  Github,
  CheckCircle2,
  Info,
  Sparkles,
  HelpCircle
} from "lucide-react";

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

  const matchVerdict = useMemo(() => {
    if (!result) return null;
    const s = result.similarity;
    const text =
      result.level ||
      (s >= 0.72
        ? "Strong Family Likeness"
        : s >= 0.55
        ? "Noticeable Resemblance"
        : s >= 0.38
        ? "Subtle Likeness · Unique Charm"
        : "Distinct Profiles · Unique Looks");
    if (s >= 0.72) return { text, color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30" };
    if (s >= 0.55) return { text, color: "text-cyan-400 bg-cyan-950/40 border-cyan-500/30" };
    if (s >= 0.38) return { text, color: "text-amber-400 bg-amber-950/40 border-amber-500/30" };
    return { text, color: "text-rose-400 bg-rose-950/40 border-rose-500/30" };
  }, [result]);

  return (
    <main className="mx-auto max-w-5xl px-3.5 sm:px-6 lg:px-8 py-5 sm:py-9 min-h-screen flex flex-col justify-between">
      <Toast message={error} onDone={() => setError(null)} />

      <div className="space-y-5 sm:space-y-8">
        {/* Header Bar */}
        <header className="flex items-center justify-between gap-3 border-b border-border/50 pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-card/80 border border-border/80 shadow-[0_0_0_1px_rgba(30,41,59,0.35)] flex items-center justify-center shrink-0">
              <ScanFace className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Face Metric</h1>
                <span className="hidden xs:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
                  Resemblance
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">AI Facial Resemblance · Discover family likeness & shared features</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/neozhu/face-metric"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-slate-900/60 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-xs"
            >
              <Github className="h-4 w-4 text-slate-300" />
              <span>GitHub</span>
            </a>
          </div>
        </header>

        {/* Upload Comparison Grid */}
        <section className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <UploadCard
              label="Photo 1"
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
              onClear={() => {
                setFileA(null);
                setResult(null);
              }}
            />

            {/* Mobile Divider */}
            <div className="flex sm:hidden items-center justify-center -my-1 relative z-10">
              <div className="h-px bg-slate-800 w-full absolute" />
              <span className="bg-slate-950 px-3 py-1 rounded-full border border-slate-700 font-bold text-xs text-cyan-400 relative z-10 shadow-md">
                VS
              </span>
            </div>

            <UploadCard
              label="Photo 2"
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
              onClear={() => {
                setFileB(null);
                setResult(null);
              }}
            />
          </div>

          {/* Desktop/Tablet Floating VS Badge */}
          <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-slate-950/90 border border-slate-700/80 shadow-[0_0_20px_rgba(0,0,0,0.8)] items-center justify-center font-bold text-xs text-cyan-400 select-none">
            VS
          </div>
        </section>

        {/* Action Button Section */}
        <section className="flex flex-col items-center justify-center gap-2 pt-1">
          <Button
            size="lg"
            disabled={!fileA || !fileB || preppingA || preppingB || loading}
            onClick={onCompare}
            className="w-full sm:w-auto min-w-[220px] h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                Analyzing Resemblance <LoadingDots />
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Compare Resemblance
              </span>
            )}
          </Button>
          {!fileA || !fileB ? (
            <p className="text-[11px] sm:text-xs text-slate-500 text-center">
              Select or capture two photos to explore resemblance
            </p>
          ) : null}
        </section>

        {/* Result & Progress Presentation */}
        {loading ? (
          <Card className="border-cyan-500/30 bg-slate-950/70 overflow-hidden">
            <CardContent className="space-y-4 py-6">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <ResultRing value={displayScore} loading={true} />
                <div className="space-y-1">
                  <div className="text-base sm:text-lg font-semibold text-slate-200 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
                    <span>Analyzing Facial Features</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {loadingStage === "uploading"
                      ? "Step 1/3: Preparing photo data & alignment..."
                      : loadingStage === "embedding"
                      ? "Step 2/3: Analyzing facial contours, eyes & bone architecture..."
                      : "Step 3/3: Evaluating continuous resemblance score & harmony..."}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2">
                <div className={`h-1.5 rounded-full ${loadingStage === "uploading" || loadingStage === "embedding" || loadingStage === "scoring" ? "bg-cyan-500" : "bg-slate-800"}`} />
                <div className={`h-1.5 rounded-full ${loadingStage === "embedding" || loadingStage === "scoring" ? "bg-cyan-500" : "bg-slate-800"}`} />
                <div className={`h-1.5 rounded-full ${loadingStage === "scoring" ? "bg-cyan-500" : "bg-slate-800"}`} />
              </div>
            </CardContent>
          </Card>
        ) : result ? (
          <Card className="border-border/90 bg-card/70 overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Score Ring Centerpiece */}
                <div className="flex flex-col items-center justify-center gap-2 md:border-r md:border-border/60 md:pr-6">
                  <ResultRing value={displayScore} />
                  {matchVerdict ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${matchVerdict.color}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {matchVerdict.text}
                    </span>
                  ) : null}
                </div>

                {/* Metrics & Assessment Breakdown */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Resemblance Analysis
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
                      {scorePct}%
                    </span>
                  </div>

                  <ResemblanceCard
                    similarity={result.similarity}
                    level={result.level}
                    tags={result.tags}
                    verdict={result.verdict || result.hint}
                    distance={result.distance}
                    model={result.model}
                    confidence={result.confidence}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Empty / Explanatory State */
          <Card className="border-border/60 bg-slate-950/40">
            <CardContent className="py-5 sm:py-6 text-center space-y-2">
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 mb-1">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-200">How Resemblance Works</h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                Our model analyzes facial bone architecture, eye-to-nose geometry, and expressive contours to evaluate continuous visual resemblance between different people — ideal for family, parent-child, and couples comparison.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer & Privacy Badge */}
      <footer className="mt-8 pt-4 border-t border-border/40 text-xs text-slate-500 space-y-3">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <PrivacyBadge />
          <p className="max-w-xl text-[11px] sm:text-xs text-slate-500 leading-relaxed">
            All images are processed strictly in-memory and never stored on disk. For optimal results, use well-lit frontal portraits without sunglasses or heavy obstructions.
          </p>
        </div>
      </footer>
    </main>
  );
}
