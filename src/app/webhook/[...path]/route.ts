const BASE = "https://impactmob.app.n8n.cloud/webhook/";

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }){
  const { path } = await ctx.params;
  const url = BASE + path.join("/");
  const headers = new Headers(req.headers);
  headers.delete("host");
  const init: RequestInit = { method: req.method, headers, cache: "no-store" };
  if(!["GET","HEAD"].includes(req.method)){
    init.body = await req.arrayBuffer();
  }
  const res = await fetch(url, init);
  const outHeaders = new Headers(res.headers);
  outHeaders.delete("content-encoding");
  outHeaders.delete("content-length");
  return new Response(res.body, { status: res.status, headers: outHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
