// Curated, verified-live Unsplash editorial fashion photography matching the
// Vogue-chic monochrome aesthetic. Each entry checked to actually resolve.
export const stockImages = {
  heroHome: "https://images.unsplash.com/photo-1574015974293-817f0ebebb74",
  editorialBlazer: "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf",
} as const;

export function unsplash(url: string, { w, q = 80 }: { w: number; q?: number }) {
  return `${url}?w=${w}&q=${q}&auto=format&fit=crop`;
}
