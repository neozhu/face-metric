"use client";

export function LoadingDots() {
  return (
    <span className="inline-flex gap-1 align-middle">
      <span className="h-1.5 w-1.5 rounded-full bg-accent/80 animate-bounce [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent/80 animate-bounce [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent/80 animate-bounce" />
    </span>
  );
}

