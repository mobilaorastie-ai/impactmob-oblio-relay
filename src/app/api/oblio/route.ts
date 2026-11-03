import { NextRequest, NextResponse } from "next/server";

const BASE = "https://www.oblio.eu";

async function getToken() {
  const clientId = process.env.OBLIO_CLIENT_ID || "";
  const clientSecret = process.env.OBLIO_CLIENT_SECRET || "";
  if (!clientId || !clientSecret) throw new Error("Missing Oblio credentials");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
  });

  const r = await fetch(BASE + "/api/authorize/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: body.toString(),
    redirect: "follow",
  });

  const raw = await r.text();
  let data:any;
  try { data = JSON.parse(raw); } catch { data = { raw }; }
  if (!r.ok || !data?.access_token) {
    throw new Error("Oblio auth failed: " + (data?.statusMessage || data?.error || r.status));
  }
  return data.access_token as string;
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const action = String(input?.action || "");
    let url = "";
    let method = "GET";
    let body: string | undefined;

    if (action === "series") {
      const cif = String(input?.cif || "");
      if (!cif) return NextResponse.json({ok:false,error:"Missing cif"},{status:400});
      url = BASE + "/api/nomenclature/series?cif=" + encodeURIComponent(cif);
    } else if (action === "create_proforma") {
      method = "POST";
      url = BASE + "/api/docs/proforma";
      body = JSON.stringify(input?.payload || {});
    } else if (action === "create_invoice") {
      method = "POST";
      url = BASE + "/api/docs/invoice";
      body = JSON.stringify(input?.payload || {});
    } else if (action === "cancel_invoice") {
      method = "PUT";
      url = BASE + "/api/docs/invoice/cancel";
      const q = input?.query || {};
      body = new URLSearchParams({ cif: String(q.cif || ""), seriesName: String(q.seriesName || ""), number: String(q.number || "") }).toString();
    } else if (action === "get_invoice") {
      const q = input?.query || {};
      const params = new URLSearchParams();
      for (const [k,v] of Object.entries(q)) if (v !== undefined && v !== null && String(v) !== "") params.set(k,String(v));
      url = BASE + "/api/docs/invoice?" + params.toString();
    } else if (action === "list_invoice") {
      const q = input?.query || {};
      const params = new URLSearchParams();
      for (const [k,v] of Object.entries(q)) if (v !== undefined && v !== null && String(v) !== "") params.set(k,String(v));
      url = BASE + "/api/docs/invoice/list?" + params.toString();
    } else if (action === "list_proforma") {
      const q = input?.query || {};
      const params = new URLSearchParams();
      for (const [k,v] of Object.entries(q)) if (v !== undefined && v !== null && String(v) !== "") params.set(k,String(v));
      url = BASE + "/api/docs/proforma/list?" + params.toString();
    } else {
      return NextResponse.json({ok:false,error:"Unsupported action"},{status:400});
    }

    const token = await getToken();
    const upstream = await fetch(url,{
      method,
      headers:{
        "Authorization":"Bearer " + token,
        "Accept":"application/json",
        ...(action==="cancel_invoice"?{"Content-Type":"application/x-www-form-urlencoded"}:(method==="POST"?{"Content-Type":"application/json"}:{}))
      },
      body,
      redirect:"follow"
    });

    const raw = await upstream.text();
    let data:any;
    try { data = JSON.parse(raw); } catch { data = { raw }; }

    return NextResponse.json(
      { ok:upstream.ok, status:upstream.status, data },
      { status:upstream.status }
    );
  } catch (error:any) {
    return NextResponse.json({ok:false,error:String(error?.message||error)}, {status:502});
  }
}
