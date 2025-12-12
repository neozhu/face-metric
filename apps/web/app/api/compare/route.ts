export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const upstream = new FormData();

  for (const [key, value] of form.entries()) {
    upstream.append(key, value);
  }

  const res = await fetch("http://127.0.0.1:8000/v1/compare", {
    method: "POST",
    body: upstream,
    cache: "no-store"
  });

  const contentType = res.headers.get("content-type") ?? "application/json";
  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: { "content-type": contentType }
  });
}

