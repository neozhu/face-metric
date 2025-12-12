export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const upstream = new FormData();

  for (const [key, value] of form.entries()) {
    upstream.append(key, value);
  }

  const res = await fetch("http://127.0.0.1:8000/v1/preprocess", {
    method: "POST",
    body: upstream,
    cache: "no-store"
  });

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const body = await res.arrayBuffer();

  return new Response(body, {
    status: res.status,
    headers: { "content-type": contentType }
  });
}

