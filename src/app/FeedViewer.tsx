"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { ParsedFeed, FeedProduct } from "@/lib/parse-feed";

export default function FeedViewer({ feed }: { feed: ParsedFeed }) {
  const { summary, products } = feed;
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<"all" | "in stock" | "out of stock">("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 50;

  const filtered = useMemo(() => {
    let list = products;
    if (availability !== "all") {
      list = list.filter((p) => p.availability === availability);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.mpn ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, search, availability]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleAvail = (v: typeof availability) => {
    setAvailability(v);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-gray-900">SparkIQ</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="text-gray-500 text-sm">Feed Viewer</span>
            </div>
          </div>
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Load another
          </a>
          <a
            href={summary.shopLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            {summary.shop}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Products"
            value={summary.totalProductGroups.toLocaleString()}
            icon="🛍️"
            color="bg-brand-50 text-brand-700"
          />
          <SummaryCard
            label="Total Variants"
            value={summary.totalVariants.toLocaleString()}
            icon="📦"
            color="bg-purple-50 text-purple-700"
          />
          <SummaryCard
            label="In Stock"
            value={summary.inStock.toLocaleString()}
            icon="✅"
            color="bg-green-50 text-green-700"
          />
          <SummaryCard
            label="Out of Stock"
            value={summary.outOfStock.toLocaleString()}
            icon="⚠️"
            color="bg-amber-50 text-amber-700"
          />
        </div>

        {/* Price + Brand row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Price Range</p>
            <p className="text-xl font-bold text-gray-900">
              {summary.priceRange.currency} {summary.priceRange.min} – {summary.priceRange.max}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
              Brands ({summary.brands.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {summary.brands.slice(0, 10).map((b) => (
                <span key={b} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                  {b}
                </span>
              ))}
              {summary.brands.length > 10 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                  +{summary.brands.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, brand, SKU or ID…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "in stock", "out of stock"] as const).map((v) => (
              <button
                key={v}
                onClick={() => handleAvail(v)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  availability === v
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {v === "all" ? "All" : v === "in stock" ? "In Stock" : "Out of Stock"}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 self-center whitespace-nowrap">
            {filtered.length.toLocaleString()} results
          </p>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 w-16">Image</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Brand</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Variants</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden xl:table-cell">SKU</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden xl:table-cell">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      No products match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} · showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProductRow({ product }: { product: FeedProduct }) {
  const isInStock = product.availability === "in stock";
  const displayPrice = product.salePrice || product.price;
  const isOnSale = !!product.salePrice;

  const variantLabel = [product.color, product.size, product.material]
    .filter(Boolean)
    .join(" / ") || "Default";

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Image */}
      <td className="px-4 py-3">
        {product.imageLink ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={product.imageLink}
              alt={product.title}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">
            🖼️
          </div>
        )}
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-900 hover:text-brand-600 line-clamp-2 block max-w-xs"
          title={product.title}
        >
          {product.title}
        </a>
        {product.productType && (
          <span className="text-xs text-gray-400 mt-0.5 block">{product.productType}</span>
        )}
      </td>

      {/* Brand */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-gray-600">{product.brand || "—"}</span>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className={`font-semibold ${isOnSale ? "text-green-600" : "text-gray-900"}`}>
            {displayPrice}
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through">{product.price}</span>
          )}
        </div>
      </td>

      {/* Variant options */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {variantLabel}
        </span>
      </td>

      {/* Availability */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isInStock
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? "bg-green-500" : "bg-amber-500"}`} />
          {isInStock ? "In Stock" : "Out of Stock"}
        </span>
      </td>

      {/* SKU */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <span className="text-xs text-gray-400 font-mono">{product.mpn || "—"}</span>
      </td>

      {/* ID */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <span className="text-xs text-gray-400 font-mono">{product.id}</span>
      </td>
    </tr>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mb-2 ${color}`}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
