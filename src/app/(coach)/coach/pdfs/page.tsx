import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { uploadPdf, removePdf } from "./actions";
import { ConfirmSubmitButton } from "./confirm-submit-button";

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function PdfsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  if (session.user.tipo !== "Coach") {
    redirect(session.user.tipo === "Aluno" ? "/aluno" : "/login");
  }

  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;
  const mensagemSucesso = typeof searchParams?.sucesso === "string" ? searchParams?.sucesso : null;

  const [alunos, documentos] = await Promise.all([
  prisma.usuario.findMany({ where: { tipo: 'Aluno' }, orderBy: { nome: "asc" } }),
    prisma.documentoPDF.findMany({ include: { alunos: true }, orderBy: { dataEnvio: "desc" } })
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Envio de PDFs</h1>
        {mensagemErro === "invalid" && (
          <p className="text-sm text-red-600">Informe título, arquivo e pelo menos um aluno.</p>
        )}
        {mensagemErro === "formato" && (
          <p className="text-sm text-red-600">Envie apenas arquivos PDF.</p>
        )}
        {mensagemSucesso && (
          <p className="text-sm text-green-600">
            {mensagemSucesso === "2" ? "Documento removido." : "Documento enviado."}
          </p>
        )}
      </div>

      <section className="bg-white shadow rounded p-4 space-y-4">
        <h2 className="text-xl font-semibold">Novo envio</h2>
        <form action={uploadPdf} className="space-y-3" encType="multipart/form-data">
          <div>
            <label htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" required />
          </div>
          <div>
            <label htmlFor="alunos">Alunos</label>
            <select id="alunos" name="alunosIds" multiple size={Math.min(6, alunos.length || 1)} required>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Use Ctrl/Cmd para selecionar vários alunos.</p>
          </div>
          <div>
            <label htmlFor="arquivo">Arquivo PDF</label>
            <input id="arquivo" name="arquivo" type="file" accept="application/pdf" required />
          </div>
          <button type="submit">Enviar PDF</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Histórico</h2>
        {documentos.length === 0 ? (
          <p>Nenhum documento enviado.</p>
        ) : (
          <ul className="space-y-4">
            {documentos.map((doc) => (
              <li key={doc.id} className="bg-white shadow rounded p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">{doc.titulo}</p>
                    <p className="text-xs text-slate-600">
                      Enviado em {new Date(doc.dataEnvio).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} · {doc.alunos.length} aluno(s)
                    </p>
                  </div>
                  <a href={doc.filePath} target="_blank" rel="noreferrer" className="text-blue-600">
                    Abrir
                  </a>
                </div>
                {doc.alunos.length > 0 && (
                  <p className="text-xs text-slate-600">
                    Destinatários: {doc.alunos.map((a) => a.nome).join(", ")}
                  </p>
                )}
                <form action={removePdf}>
                  <input type="hidden" name="id" value={doc.id} />
                  <ConfirmSubmitButton
                    type="submit"
                    message="Remover este PDF?"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remover
                  </ConfirmSubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
