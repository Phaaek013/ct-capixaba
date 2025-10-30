// Robust YouTube -> embed URL converter.
// Handles full URLs, share links, and query params like `v=`. Returns null for non-YouTube URLs.
export function toEmbed(url?: string | null): string | null {
  if (!url) return null;

  try {
    // Try to parse as URL first
    const parsed = new URL(url, "https://example.org");
    const hostname = parsed.hostname.toLowerCase();

    // youtu.be short links: hostname contains 'youtu.be'
    if (hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\//, "").split(/[?#]/)[0];
      if (id && id.length >= 8) return `https://www.youtube.com/embed/${id}`;
      return null;
    }

    // youtube.com links
    if (hostname.includes("youtube.com") || hostname.includes("www.youtube.com")) {
      // If URL is /watch?v=ID
      if (parsed.searchParams.has("v")) {
        const id = parsed.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }

      // If already an embed URL: /embed/ID
      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts.length > embedIdx + 1) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
      }
    }

    // Fallback: try to extract 11-char id with regex
    const idMatch = url.match(/([\w-]{11})/);
    if (idMatch) return `https://www.youtube.com/embed/${idMatch[1]}`;
  } catch (e) {
    // not a full URL; try regex fallback
    const idMatch = url.match(/(?:youtube\.com(?:.*v=)|youtu\.be\/)([\w-]{11})/i) || url.match(/([\w-]{11})/);
    if (idMatch) return `https://www.youtube.com/embed/${idMatch[1]}`;
  }

  return null;
}
