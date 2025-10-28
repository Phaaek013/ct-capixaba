"use client";

import { useEffect, useState } from "react";

type Props = {
  dataTreinoISO?: string;
  conteudo?: string;
  videoUrl?: string;
};

type CachedTreino = {
  dataTreinoISO: string;
  conteudo: string;
  videoUrl?: string | null;
};

const STORAGE_KEY = "treinoHoje";

export default function AlunoTreinoCache({ dataTreinoISO, conteudo, videoUrl }: Props) {
  const [cache, setCache] = useState<CachedTreino | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (dataTreinoISO && conteudo) {
      try {
        const payload: CachedTreino = {
          dataTreinoISO,
          conteudo,
          videoUrl: videoUrl ?? null
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setCache(null);
      } catch (_) {
        // ignora falhas de armazenamento offline
      }
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CachedTreino;
        if (parsed?.conteudo) {
          setCache(parsed);
        }
      }
    } catch (_) {
      // ignora falhas de leitura offline
    }
  }, [dataTreinoISO, conteudo, videoUrl]);

  if (dataTreinoISO && conteudo) {
    return null;
  }

  if (!cache) {
    return null;
  }

  const dataLabel = cache.dataTreinoISO
    ? new Date(cache.dataTreinoISO).toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo"
      })
    : null;

  return (
    <div className="space-y-2 rounded border border-dashed border-slate-300 p-3 text-sm">
      <p className="font-medium">Último treino salvo (offline)</p>
      {dataLabel ? <p className="text-xs text-slate-500">{dataLabel}</p> : null}
      <p className="whitespace-pre-wrap">{cache.conteudo}</p>
      {cache.videoUrl ? (
        <a
          href={cache.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs text-blue-600 underline"
        >
          Abrir vídeo salvo
        </a>
      ) : null}
    </div>
  );
}
