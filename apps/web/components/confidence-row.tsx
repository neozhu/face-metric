export function ConfidenceRow({
  confidence,
  model
}: {
  confidence: number;
  model: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-300">
      <div>Confidence</div>
      <div className="font-medium text-slate-100">{confidence.toFixed(2)}</div>
      <div className="text-slate-400">Model</div>
      <div className="font-medium text-slate-100">{model}</div>
    </div>
  );
}

