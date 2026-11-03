const APP_URL = "https://impactmob.app.n8n.cloud/webhook/impactmob-facturare-v1-7f3c9a";

export async function GET(){
  const res = await fetch(APP_URL, { cache: "no-store" });
  let html = await res.text();
  html = html.replace(
    "</head>",
    '<meta name="theme-color" content="#0f766e"><link rel="manifest" href="/manifest.webmanifest"></head>'
  );
  return new Response(html, {
    status: res.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
