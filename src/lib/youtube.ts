const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([\w-]{11})/i;

export function toEmbed(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  const match = url.match(YOUTUBE_REGEX);
  if (!match) {
    return null;
  }

  return `https://www.youtube.com/embed/${match[1]}`;
}
