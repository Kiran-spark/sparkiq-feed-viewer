import { parseFeedXml, type ParsedFeed } from "@/lib/parse-feed";
import FeedViewer from "./FeedViewer";
import UrlInput from "./UrlInput";

const FEED_BASE_URL =
  process.env.SPARKIQ_FEED_BASE_URL || "https://sparkiq-connect.vercel.app";
const SPARKIQ_API_SECRET = process.env.SPARKIQ_API_SECRET || "";

/** Extract token from a full feed URL like:
 *  https://sparkiq-connect.vercel.app/feeds/abc123.xml
 *  or just a bare token: abc123
 */
function extractToken(input: string): string | null {
  const trimmed = input.trim();
  // Try to parse as URL and extract token from /feeds/{token}.xml
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/feeds\/([^/]+)\.xml$/);
    if (match) return match[1];
  } catch {
    // Not a valid URL — treat as bare token if it looks reasonable
    if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed;
  }
  return null;
}

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
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;

  // No URL yet — show the input screen
  if (!url) {
    return <LandingPage />;
  }

  const token = extractToken(url);

  if (!token) {
    return <LandingPage error="That doesn't look like a valid SparkIQ feed URL. Please paste the full URL from the app." />;
  }

  const feed = await fetchFeed(token);

  if (!feed) {
    return (
      <LandingPage error="Couldn't load the feed. Make sure you've generated a feed in the SparkIQ Connect app first." />
    );
  }

  return <FeedViewer feed={feed} />;
}

function LandingPage({ error }: { error?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-gray-900">SparkIQ</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className="text-gray-500 text-sm">Feed Viewer</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {/* Icon */}
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            View your product feed
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Paste the feed URL from your SparkIQ Connect Shopify app
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* URL Input form */}
          <UrlInput />

          <p className="text-xs text-gray-400 text-center mt-4">
            The URL looks like:{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">
              https://sparkiq-connect.vercel.app/feeds/…xml
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
