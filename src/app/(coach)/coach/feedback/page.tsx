import { getFeedbacks } from "./actions";

export default async function CoachFeedbackPage() {
  const feedbacks = await getFeedbacks();

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h1 className="text-2xl font-bold mb-2">Feedbacks dos Alunos</h1>
        <p className="text-sm muted">Visualize os feedbacks enviados pelos alunos sobre seus treinos.</p>
      </div>

      <div className="grid gap-4">
        {feedbacks.length === 0 ? (
          <div className="card p-4 text-center">
            <p>Nenhum feedback recebido ainda.</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="card p-4 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="font-semibold">{feedback.aluno.nome}</h2>
                  <p className="text-sm muted">{feedback.aluno.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm muted">
                    Treino: {feedback.treino.dataTreino ? 
                      new Date(feedback.treino.dataTreino).toLocaleDateString('pt-BR') : 
                      'Sem data'}
                  </div>
                  <div className="text-sm muted">
                    Enviado em: {new Date(feedback.enviadoEm).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Avaliação</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm muted">Nota do treino:</div>
                      <div className="font-mono text-lg">{feedback.nota}/10</div>
                    </div>
                    {feedback.rpe && (
                      <div>
                        <div className="text-sm muted">RPE (Percepção de Esforço):</div>
                        <div className="font-mono text-lg">{feedback.rpe}/10</div>
                      </div>
                    )}
                  </div>
                </div>

                {feedback.observacoes && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Observações</h3>
                    <p className="text-sm whitespace-pre-wrap">{feedback.observacoes}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border)]">
                <details className="text-sm">
                  <summary className="cursor-pointer hover:text-[var(--primary)]">
                    Ver treino relacionado
                  </summary>
                  <div className="mt-2 p-3 bg-[var(--bg)] rounded-md">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {feedback.treino.conteudo}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}