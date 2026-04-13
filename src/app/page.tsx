import { parseFeedXml, type ParsedFeed } from "@/lib/parse-feed";
import FeedViewer from "./FeedViewer";

const FEED_BASE_URL =
  process.env.SPARKIQ_FEED_BASE_URL || "https://sparkiq-connect.vercel.app";
const SPARKIQ_API_SECRET = process.env.SPARKIQ_API_SECRET || "";

async function fetchFeed(token: string): Promise<ParsedFeed | null> {
  try {
    const res = await fetch(`${FEED_BASE_URL}/feeds/${token}.xml`, {
      headers: {
        "X-SparkIQ-Secret": SPARKIQ_API_SECRET,
        Accept: "application/xml",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const xml = await res.text();
    return parseFeedXml(xml);
  } catch {
    return null;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <NoToken />;
  }

  const feed = await fetchFeed(token);

  if (!feed) {
    return <FeedError token={token} />;
  }

  return <FeedViewer feed={feed} />;
}

function NoToken() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No feed token provided</h1>
        <p className="text-gray-500">Pass your feed token as a URL parameter: <code className="bg-gray-100 px-2 py-1 rounded text-sm">?token=your-token</code></p>
      </div>
    </div>
  );
}

function FeedError({ token }: { token: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feed not found</h1>
        <p className="text-gray-500 mb-4">
          Could not load feed for token <code className="bg-gray-100 px-2 py-1 rounded text-sm">{token}</code>.
          Make sure you have generated a feed in the SparkIQ Connect app first.
        </p>
      </div>
    </div>
  );
}
