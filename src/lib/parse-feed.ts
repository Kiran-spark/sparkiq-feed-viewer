import { XMLParser } from "fast-xml-parser";

export interface FeedProduct {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImages: string[];
  availability: "in stock" | "out of stock" | string;
  condition: string;
  price: string;
  salePrice?: string;
  brand: string;
  itemGroupId: string;
  productType?: string;
  gtin?: string;
  mpn?: string;
  color?: string;
  size?: string;
  material?: string;
  shippingWeight?: string;
}

export interface FeedSummary {
  shop: string;
  shopLink: string;
  totalVariants: number;
  totalProductGroups: number;
  inStock: number;
  outOfStock: number;
  brands: string[];
  priceRange: { min: string; max: string; currency: string };
}

export interface ParsedFeed {
  summary: FeedSummary;
  products: FeedProduct[];
}

function text(val: unknown): string {
  if (val === undefined || val === null) return "";
  // fast-xml-parser stores CDATA as { __cdata: "value" }
  if (typeof val === "object" && val !== null && "__cdata" in val) {
    return String((val as Record<string, unknown>).__cdata ?? "").trim();
  }
  // Fallback: strip raw CDATA markers if present as plain string
  return String(val).replace(/^<!\[CDATA\[\s*([\s\S]*?)\s*]]>$/, "$1").trim();
}

function toArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

export function parseFeedXml(xml: string): ParsedFeed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "__cdata",
    isArray: (name) => name === "item" || name === "g:additional_image_link",
    parseTagValue: false,
    trimValues: true,
  });

  const parsed = parser.parse(xml);
  const channel = parsed?.rss?.channel ?? {};
  const rawItems: Record<string, unknown>[] = toArray(channel.item);

  const products: FeedProduct[] = rawItems.map((item) => {
    const additionalImages = toArray(item["g:additional_image_link"] as unknown[]).map(text);

    const priceRaw = text(item["g:price"]);
    const salePriceRaw = text(item["g:sale_price"]);

    return {
      id: text(item["g:id"]),
      title: text(item["g:title"]),
      description: text(item["g:description"]),
      link: text(item["g:link"]),
      imageLink: text(item["g:image_link"]),
      additionalImages,
      availability: text(item["g:availability"]),
      condition: text(item["g:condition"]),
      price: priceRaw,
      salePrice: salePriceRaw || undefined,
      brand: text(item["g:brand"]),
      itemGroupId: text(item["g:item_group_id"]),
      productType: text(item["g:product_type"]) || undefined,
      gtin: text(item["g:gtin"]) || undefined,
      mpn: text(item["g:mpn"]) || undefined,
      color: text(item["g:color"]) || undefined,
      size: text(item["g:size"]) || undefined,
      material: text(item["g:material"]) || undefined,
      shippingWeight: text(item["g:shipping_weight"]) || undefined,
    };
  });

  // Build summary
  const shop = text(channel.title) || text(channel.link);
  const shopLink = text(channel.link);
  const inStock = products.filter((p) => p.availability === "in stock").length;
  const outOfStock = products.length - inStock;
  const groupIds = new Set(products.map((p) => p.itemGroupId).filter(Boolean));
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  // Extract min/max numeric price
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let currency = "USD";

  for (const p of products) {
    const priceStr = p.salePrice || p.price;
    const parts = priceStr.split(" ");
    const num = parseFloat(parts[0]);
    if (!isNaN(num)) {
      if (num < minPrice) minPrice = num;
      if (num > maxPrice) maxPrice = num;
      if (parts[1]) currency = parts[1];
    }
  }

  const fmt = (n: number) =>
    n === Infinity || n === -Infinity ? "0" : n.toFixed(2);

  return {
    summary: {
      shop,
      shopLink,
      totalVariants: products.length,
      totalProductGroups: groupIds.size,
      inStock,
      outOfStock,
      brands,
      priceRange: { min: fmt(minPrice), max: fmt(maxPrice), currency },
    },
    products,
  };
}
