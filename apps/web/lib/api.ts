export type CompareResponse = {
  similarity: number;
  confidence: number;
  model: string;
  distance: number;
  faceDetected: { a: boolean; b: boolean };
  hint: string;
};

export type CompareError = {
  error: string;
  message: string;
  faceDetected?: { a: boolean; b: boolean };
};

export async function compareFaces(imageA: File, imageB: File): Promise<CompareResponse> {
  const form = new FormData();
  form.append("image_a", imageA);
  form.append("image_b", imageB);

  // Use same-origin proxy by default (single-port deploy).
  // If NEXT_PUBLIC_API_BASE is set, call the backend directly.
  const url = process.env.NEXT_PUBLIC_API_BASE
    ? `${process.env.NEXT_PUBLIC_API_BASE}/v1/compare`
    : "/api/compare";

  const res = await fetch(url, {
    method: "POST",
    body: form
  });

  if (!res.ok) {
    const detail = (await res.json()).detail as CompareError | undefined;
    throw Object.assign(new Error(detail?.message || "Compare failed"), { detail });
  }

  return res.json();
}
