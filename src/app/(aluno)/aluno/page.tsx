import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { startOfDayUTC, nextDayUTC } from '@/utils/date';
import { toEmbed } from '@/lib/youtube';
import dynamic from 'next/dynamic';
import { createFeedback, updateFeedback } from './actions';
import FeedbackSection from './feedback-section';
import AlunoTreinoCache from './AlunoTreinoCache';
import { prisma } from '@/lib/prisma';
import { TIMEZONE } from '@/lib/tz';

const YouTubeEmbed = dynamic(() => import('@/components/YouTubeEmbed'), { ssr: false });

export default async function AlunoPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect('/login');
    }

    if (session.user.tipo !== 'Aluno') {
      redirect('/coach');
    }

    const alunoId = Number(session.user.id);
    const nowInTz = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
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
        dataEnvio: 'desc'
      }
    });

    const videoEmbed = treino?.videoUrl ? toEmbed(treino.videoUrl) : null;

    const historico = await prisma.treino.findMany({
      where: {
        alunoId,
        ehModelo: false
      },
      include: { aluno: true },
      orderBy: { dataTreino: 'desc' },
      take: 10
    });

    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Meu Treino</h1>
          <p className="text-sm text-slate-500">{session.user.email}</p>
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
                  dataTreinoISO={treino.dataTreino?.toISOString()}
                  conteudo={treino.conteudo}
                  videoUrl={treino.videoUrl ?? undefined}
                />
                {videoEmbed && (
                  <YouTubeEmbed embedUrl={videoEmbed} videoUrl={treino.videoUrl ?? undefined} />
                )}
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
            <p className="mt-3 text-sm text-slate-500">
              Envie seu feedback quando um treino estiver disponível.
            </p>
          )}
        </section>

        <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Meus PDFs</h2>
          {pdfs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Nenhum documento disponível.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {pdfs.map((pdf) => (
                <li key={pdf.id} className="space-y-1">
                  <p className="text-sm font-medium">{pdf.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(pdf.dataEnvio).toLocaleString('pt-BR', {
                      timeZone: TIMEZONE
                    })}
                  </p>
                  <Link
                    href={pdf.filePath}
                    target="_blank"
                    className="text-blue-600 hover:underline text-sm"
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
                    <p className="text-sm font-medium">
                      {h.aluno?.nome ?? session.user.name ?? session.user.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      {h.dataTreino
                        ? new Date(h.dataTreino).toLocaleDateString('pt-BR', { timeZone: TIMEZONE })
                        : ''}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{h.conteudo}</p>
                    {h.videoUrl && (
                      <a
                        href={h.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Ver vídeo
                      </a>
                    )}
                  </article>
                ))
            ) : (
              <p className="text-sm text-slate-600">Nenhum treino anterior encontrado.</p>
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar página do aluno:', error);
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Erro</h1>
          <p className="text-sm text-slate-500">Ocorreu um erro ao carregar seus dados.</p>
        </header>
      </div>
    );
  }
}
