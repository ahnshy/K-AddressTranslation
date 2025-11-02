import { NextRequest } from "next/server";

const KEY_KO = process.env.JUSO_CONF_KEY_KO ?? process.env.JUSO_CONF_KEY ?? "";
const KEY_EN = process.env.JUSO_CONF_KEY_EN ?? process.env.JUSO_CONF_KEY ?? "";
const DEFAULT_SIZE = parseInt(process.env.JUSO_COUNT_PER_PAGE ?? "10", 10);

const URLS = {
  ko: { address: process.env.JUSO_BASE_URL ?? "https://www.juso.go.kr/addrlink/addrLinkApi.do" },
  en: { address: process.env.JUSO_BASE_URL_EN ?? "https://www.juso.go.kr/addrlink/addrEngApi.do" }
} as const;

function hasHangul(s: string) {
  return /[\u3131-\u318E\uAC00-\uD7A3]/.test(s);
}

function mapItem(x: any, lang: "ko" | "en") {
  const road = (lang === "en")
    ? (x.roadAddrPart1 || x.roadAddr || x.engAddr || x.roadAddrEng)
    : x.roadAddr;
  const jibun = (lang === "en")
    ? (x.jibunAddrEng || x.jibunAddr)
    : x.jibunAddr;
  const zip = x.zipNo || x.zipCode || x.postCode || x.postcode;
  return { lang, roadAddr: road, jibunAddr: jibun, zipNo: zip, sido: x.siNm, sigungu: x.sggNm, eupmyeon: x.emdNm, roadName: x.rn, buildingName: x.buildingName, raw: x };
}

async function query(base: string, q: string, page: number, size: number, key: string) {
  const url = new URL(base);
  url.searchParams.set("confmKey", key);
  url.searchParams.set("currentPage", String(page));
  url.searchParams.set("countPerPage", String(size));
  url.searchParams.set("keyword", q);
  url.searchParams.set("resultType", "json");
  const r = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  if (!r.ok) return { ok: false, status: r.status, data: null as any };
  const data = await r.json();
  return { ok: true, status: 200, data };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const size = Math.min(parseInt(searchParams.get("size") ?? String(DEFAULT_SIZE), 10) || DEFAULT_SIZE, 50);
  const lang = (searchParams.get("lang") ?? "ko").toLowerCase() === "en" ? "en" : "ko";

  if (!q) return Response.json({ items: [], totalCount: 0, page, size, lang });
  if (!KEY_KO && !KEY_EN) {
    return new Response(JSON.stringify({ error: "Missing JUSO_CONF_KEY_KO/JUSO_CONF_KEY_EN (or JUSO_CONF_KEY) in environment." }), { status: 500 });
  }

  if (lang === "ko") {
    const res = await query(URLS.ko.address, q, page, size, KEY_KO);
    if (!res.ok) return new Response(JSON.stringify({ error: "Upstream error", status: res.status }), { status: 502 });
    const list = res.data?.results?.juso ?? [];
    const totalCount = parseInt(res.data?.results?.common?.totalCount ?? "0", 10);
    const items = list.map((x: any) => mapItem(x, "ko"));
    return Response.json({ items, totalCount, page, size, lang }, { headers: { "Cache-Control": "no-store" } });
  }

  // lang === 'en'
  let enRes = await query(URLS.en.address, q, page, size, KEY_EN);
  let enList: any[] = enRes.ok ? (enRes.data?.results?.juso ?? []) : [];
  let enTotal = enRes.ok ? parseInt(enRes.data?.results?.common?.totalCount ?? "0", 10) : 0;

  if (enList.length === 0 || hasHangul(q)) {
    const koRes = await query(URLS.ko.address, q, 1, Math.min(size, 10), KEY_KO);
    const koList: any[] = koRes.ok ? (koRes.data?.results?.juso ?? []) : [];
    const bridged: any[] = [];
    for (const x of koList.slice(0, 5)) {
      const key = x.zipNo || x.roadAddr || x.bdNm || x.emdNm;
      if (!key) continue;
      const tryEn = await query(URLS.en.address, key, 1, 3, KEY_EN);
      if (tryEn.ok) {
        const arr = tryEn.data?.results?.juso ?? [];
        for (const e of arr) {
          bridged.push(e);
          if (bridged.length >= size) break;
        }
      }
      if (bridged.length >= size) break;
    }
    enList = bridged;
    enTotal = bridged.length;
  }

  const items = enList.map((x: any) => mapItem(x, "en"));
  return Response.json({ items, totalCount: enTotal, page, size, lang }, { headers: { "Cache-Control": "no-store" } });
}
