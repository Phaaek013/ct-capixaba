import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfDayUTC, nextDayUTC } from "@/utils/date";
import { toEmbed } from "@/lib/youtube";
import dynamic from "next/dynamic";

const YouTubeEmbed = dynamic(() => import("@/components/YouTubeEmbed"), { ssr: false });
import { createFeedback, updateFeedback } from "./actions";
import FeedbackSection from "./feedback-section";
import AlunoTreinoCache from "./AlunoTreinoCache";

const TIMEZONE = "America/Sao_Paulo";

export default async function AlunoPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.tipo !== "Aluno") {
    redirect("/coach");
  }

  const alunoId = Number(session.user.id);
  // Determine "today" from the student's timezone (so users see "hoje" according
  // to their local day even if the server clock is in a different date).
  // We build a date representing the current wall-clock time in TIMEZONE, then
  // normalize to UTC day boundaries for consistent DB queries.
  const nowInTz = new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
  const gte = startOfDayUTC(nowInTz);
  const lt = nextDayUTC(nowInTz);

  const treino = await prisma.treino.findFirst({
    where: {
      alunoId,
      ehModelo: false,
      dataTreino: {
        gte,
        lt
      }
    }
  });

  const feedback = treino
    ? await prisma.feedback.findUnique({
        where: {
          alunoId_treinoId: {
            alunoId,
            treinoId: treino.id
          }
        }
      })
    : null;

  const pdfs = await prisma.documentoPDF.findMany({
    where: {
      alunos: {
        some: {
          id: alunoId
        }
      }
    },
    orderBy: {
      dataEnvio: "desc"
    }
  });

  const videoEmbed = treino?.videoUrl ? toEmbed(treino.videoUrl) : null;

  // Histórico: últimos treinos do aluno (inclui ontem/anteriores). Fetch e render abaixo.
  const historico = await prisma.treino.findMany({
    where: {
      alunoId,
      ehModelo: false
    },
    include: { aluno: true },
    orderBy: { dataTreino: "desc" },
    take: 10
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Meu Treino</h1>
        <p className="text-sm text-slate-600">{session.user.email}</p>
      </header>

      <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Treino de hoje</h2>
        <div className="mt-3 space-y-4">
          {treino ? (
            <>
              <textarea
                className="h-48 w-full resize-none rounded border border-slate-300 p-2 text-sm"
                readOnly
                value={treino.conteudo}
              />
              <AlunoTreinoCache
                alunoId={alunoId}
                dataTreinoISO={treino.dataTreino ? treino.dataTreino.toISOString() : undefined}
                conteudo={treino.conteudo}
                videoUrl={treino.videoUrl ?? undefined}
              />
              {videoEmbed || treino.videoUrl ? (
                <YouTubeEmbed embedUrl={videoEmbed ?? ""} videoUrl={treino.videoUrl ?? undefined} />
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">Sem treino para hoje.</p>
              <AlunoTreinoCache alunoId={alunoId} />
            </>
          )}
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Feedback</h2>
        {treino ? (
          <FeedbackSection
            treinoId={treino.id}
            feedback={feedback}
            createAction={createFeedback}
            updateAction={updateFeedback}
          />
        ) : (
          <p className="mt-3 text-sm text-slate-600">Envie seu feedback quando um treino estiver disponível.</p>
        )}
      </section>

      <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Meus PDFs</h2>
        {pdfs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Nenhum documento disponível.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {pdfs.map((pdf) => (
              <li key={pdf.id} className="space-y-1">
                <p className="text-sm font-medium">{pdf.titulo}</p>
                <p className="text-xs text-slate-500">
                  {new Date(pdf.dataEnvio).toLocaleString("pt-BR", {
                    timeZone: TIMEZONE
                  })}
                </p>
                <Link
                  href={pdf.filePath}
                  target="_blank"
                  className="inline-block text-sm text-blue-600 underline"
                >
                  Abrir documento
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Últimos treinos</h2>
        <div className="mt-3 space-y-3">
          {historico && historico.length > 0 ? (
            historico
              .filter((h) => !treino || h.id !== treino.id)
              .map((h) => (
                <article key={h.id} className="rounded border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium">{h.aluno?.nome ?? session.user.name ?? session.user.email}</p>
                  <p className="text-xs text-slate-500">
                    {h.dataTreino
                      ? new Date(h.dataTreino).toLocaleDateString("pt-BR", { timeZone: TIMEZONE })
                      : ""}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{h.conteudo}</p>
                  {h.videoUrl ? (
                    <a href={h.videoUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm text-blue-600 underline">
                      Ver vídeo
                    </a>
                  ) : null}
                </article>
              ))
          ) : (
            <p className="text-sm text-slate-600">Nenhum treino anterior encontrado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
