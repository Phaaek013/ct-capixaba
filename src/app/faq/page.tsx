export default function FaqPage() {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold">Perguntas Frequentes</h1>
        <p className="text-sm text-slate-400">
          Respostas rápidas para as dúvidas mais comuns sobre o CT Capixaba.
        </p>
      </header>
      <article className="space-y-2">
        <h2 className="text-xl font-semibold">Como acesso minha conta?</h2>
        <p>
          Coachs acessam o painel em /coach e alunos em /aluno utilizando as credenciais
          fornecidas. No primeiro acesso é necessário trocar a senha.
        </p>
      </article>
      <article className="space-y-2">
        <h2 className="text-xl font-semibold">Onde encontro meus treinos e PDFs?</h2>
        <p>
          Na área do aluno você visualiza o treino do dia, envia feedback e confere os PDFs
          enviados pelo seu coach.
        </p>
      </article>
      <article className="space-y-2">
        <h2 className="text-xl font-semibold">Precisa de ajuda adicional?</h2>
        <p>
          Entre em contato com o seu coach ou com a equipe CT Capixaba para suporte
          personalizado.
        </p>
      </article>
    </section>
  );
}
