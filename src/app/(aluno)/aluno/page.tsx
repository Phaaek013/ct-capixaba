import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTodayRangeInTZ } from "@/lib/tz";
import { toEmbed } from "@/lib/youtube";
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
  const { startUtc, endUtc } = getTodayRangeInTZ(TIMEZONE);

  const treino = await prisma.treino.findFirst({
    where: {
      alunoId,
      ehModelo: false,
      dataTreino: {
        gte: startUtc,
        lt: endUtc
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
                dataTreinoISO={treino.dataTreino.toISOString()}
                conteudo={treino.conteudo}
                videoUrl={treino.videoUrl ?? undefined}
              />
              {videoEmbed ? (
                <iframe
                  title="Vídeo do treino"
                  src={videoEmbed}
                  className="aspect-video w-full rounded border border-slate-200"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : treino.videoUrl ? (
                <a
                  href={treino.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  Abrir vídeo
                </a>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">Sem treino para hoje.</p>
              <AlunoTreinoCache />
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
    </div>
  );
}
