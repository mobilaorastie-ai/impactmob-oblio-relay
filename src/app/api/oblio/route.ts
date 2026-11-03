import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

const BASE = "https://www.oblio.eu";

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") || "";
    if (!auth.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json({ ok:false, error:"Missing Authorization bearer token" }, { status:401 });
    }

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
    } else if (action === "list_proforma") {
      const q = input?.query || {};
      const params = new URLSearchParams();
      for (const [k,v] of Object.entries(q)) if (v !== undefined && v !== null && String(v) !== "") params.set(k,String(v));
      url = BASE + "/api/docs/proforma/list?" + params.toString();
    } else {
      return NextResponse.json({ok:false,error:"Unsupported action"},{status:400});
    }

    const upstream = await fetch(url,{
      method,
      headers:{
        "Authorization":auth,
        "Accept":"application/json",
        ...(method==="POST"?{"Content-Type":"application/json"}:{})
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
