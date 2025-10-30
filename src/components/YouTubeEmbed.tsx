"use client";

import React, { useEffect, useRef, useState } from "react";

function extractVideoId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, "https://example.org");
    const hostname = parsed.hostname.toLowerCase();
    if (hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\//, "").split(/[?#]/)[0];
      return id || null;
    }
    if (hostname.includes("youtube.com")) {
      if (parsed.searchParams.has("v")) return parsed.searchParams.get("v");
      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts.length > embedIdx + 1) return parts[embedIdx + 1];
    }
  } catch (e) {
    // fallback to regex
    const match = url.match(/([\w-]{11})/);
    if (match) return match[1];
  }
  const m = url.match(/([\w-]{11})/);
  return m ? m[1] : null;
}

export default function YouTubeEmbed({ embedUrl, videoUrl }: { embedUrl: string; videoUrl?: string | null }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = extractVideoId(videoUrl ?? embedUrl);
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    let mounted = true;

    function loadYouTubeAPI(): Promise<any> {
      if ((window as any).YT && (window as any).YT.Player) return Promise.resolve((window as any).YT);
      return new Promise((resolve) => {
        const existing = document.getElementById("youtube-iframe-api");
        if (existing) {
          (window as any).onYouTubeIframeAPIReady = () => resolve((window as any).YT);
          return;
        }
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
        (window as any).onYouTubeIframeAPIReady = () => resolve((window as any).YT);
      });
    }

    loadYouTubeAPI()
      .then((YT) => {
        if (!mounted) return;
        if (!containerRef.current) return;
        // destroy existing player if any
        if (playerRef.current && playerRef.current.destroy) {
          try {
            playerRef.current.destroy();
          } catch (e) {}
        }

        playerRef.current = new YT.Player(containerRef.current, {
          videoId: id,
          playerVars: {
            origin: window.location.origin,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3
          },
          events: {
            onReady: () => {
              if (!mounted) return;
              setLoading(false);
            },
            onError: (e: any) => {
              if (!mounted) return;
              // set error, which will render fallback link
              setError(true);
              setLoading(false);
            }
          }
        });
      })
      .catch(() => {
        if (!mounted) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      mounted = false;
      try {
        if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
      } catch (e) {}
    };
  }, [embedUrl, videoUrl]);

  if (error) {
    return (
      <div className="treino-video-fallback p-3">
        <p className="text-sm">Este vídeo não permite reprodução embutida.</p>
        {videoUrl ? (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
            Assistir o vídeo no YouTube
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="treino-video">
      <div ref={containerRef} className="w-full aspect-video rounded overflow-hidden" />
      {loading && <div className="text-sm mt-2">Carregando vídeo...</div>}
    </div>
  );
}
