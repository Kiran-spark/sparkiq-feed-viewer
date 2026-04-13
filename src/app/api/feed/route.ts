import { NextRequest, NextResponse } from "next/server";
import { parseFeedXml } from "@/lib/parse-feed";

const FEED_BASE_URL = process.env.SPARKIQ_FEED_BASE_URL || "https://sparkiq-connect.vercel.app";
const SPARKIQ_API_SECRET = process.env.SPARKIQ_API_SECRET || "";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  if (!SPARKIQ_API_SECRET) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const feedUrl = `${FEED_BASE_URL}/feeds/${token}.xml`;

  let xml: string;
  try {
    const res = await fetch(feedUrl, {
      headers: {
        "X-SparkIQ-Secret": SPARKIQ_API_SECRET,
        Accept: "application/xml",
      },
      // Always fresh — no cache
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Feed returned ${res.status}` },
        { status: res.status },
      );
    }

    xml = await res.text();
  } catch (err) {
    console.error("[FeedViewer] Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 502 });
  }

  try {
    const data = parseFeedXml(xml);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[FeedViewer] Parse error:", err);
    return NextResponse.json({ error: "Failed to parse feed XML" }, { status: 500 });
  }
}
