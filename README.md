

# CT Capixaba – Plataforma de Treinos e Gestão de Alunos

Aplicação web para gestão de treinos e alunos de um centro de treinamento/academia (estilo Cross/funcional), construída com **Next.js 14 (App Router)**, **React**, **TypeScript** e **Prisma**.

O objetivo do sistema é tirar o controle de treinos, alunos e planos do improviso (papel, planilhas, WhatsApp) e trazer tudo para uma plataforma única, organizada por perfis de acesso (coach, aluno, administrador).

Repositório: https://github.com/Phaaek013/ct-capixaba

---

## ✨ Visão geral

O CT Capixaba foi pensado para atender a rotina real de um centro de treinamento:

- organização de **alunos**, planos e turmas;
- criação e reaproveitamento de **treinos/modelos**;
- acesso diferenciado para **coach**, **aluno** e **admin**;
- base técnica moderna (Next 14 + TypeScript + Prisma + NextAuth) para evoluir o produto no futuro.

Este projeto está em desenvolvimento contínuo e serve tanto como solução real para o CT quanto como projeto forte de portfólio em **dev web + automação com IA**.

---

## 🎯 Problema que o sistema resolve

Antes do sistema, o cenário típico era:

- treinos enviados por WhatsApp, PDFs soltos, fotos de quadro;
- controle de alunos em planilhas ou caderno;
- dificuldade para acompanhar evolução e histórico;
- pouca clareza sobre quem é aluno ativo, vencido ou em período de teste.

Com o **CT Capixaba**, a ideia é:

- centralizar informações de **alunos**, **treinos** e **planos** em um único sistema;
- dar ao **coach** uma visão clara da turma e dos treinos do dia;
- dar ao **aluno** acesso simples aos seus treinos e informações;
- permitir ao **admin** cuidar da parte operacional (cadastros, permissões etc.).

---

## 👤 Perfis de usuário

O sistema trabalha com perfis (roles) definidos via autenticação:

- **Admin**
  - Acesso administrativo completo.
  - Gerencia usuários, papéis, cadastros e configurações.

- **Coach**
  - Gerencia treinos, alunos e turmas sob sua responsabilidade.
  - Acessa telas de controle do dia a dia do CT.

- **Aluno**
  - Acessa seus treinos, histórico e informações relacionadas ao próprio cadastro.

O controle de autenticação e autorização é feito com **NextAuth**, incluindo verificação de role para proteger rotas (ex.: `/coach`, `/aluno`, `/admin`).

---

## 🧩 Principais funcionalidades (MVP atual)

> Ajuste esta lista conforme o estado atual do código, se algo ainda não estiver implementado.

- **Autenticação e autorização**
  - Login com NextAuth.
  - Controle de acesso por role (admin, coach, aluno).
  - Proteção de rotas específicas por perfil.

- **Gestão de alunos**
  - Cadastro e listagem de alunos.
  - Informações básicas (nome, contato, status).
  - Associação a planos/turmas (quando aplicável).

- **Gestão de treinos**
  - Criação e manutenção de treinos.
  - Organização por dia/semana/modelos (templates).
  - Possibilidade de reutilizar treinos em diferentes turmas ou períodos.

- **Painéis por perfil**
  - Área do **coach**: visão dos treinos e alunos sob sua responsabilidade.
  - Área do **aluno**: acesso aos treinos e orientações liberadas para ele.
  - Área do **admin**: visão geral do sistema (usuários, roles, cadastros).

---

## 🛠️ Stack utilizada

**Frontend / UI**

- [Next.js 14](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- HTML5
- CSS
- [Tailwind CSS](https://tailwindcss.com/) para estilização

**Backend / Server**

- Next.js (rotas de API) rodando sobre Node.js
- Regras de negócio implementadas em rotas de API (alunos, treinos etc.)

**Banco de dados / ORM**

- [Prisma](https://www.prisma.io/) (ORM)
- Banco local em **SQLite** (`dev.db`) para ambiente de desenvolvimento

**Autenticação / Autorização**

- [NextAuth](https://next-auth.js.org/)
- Controle de roles (`admin`, `coach`, `aluno`) para proteger rotas e fluxos

**Qualidade de código**

- [ESLint](https://eslint.org/) para padronização e checagem de código
- Scripts de build/checagem (ex.: `npm run lint`, `npm run build`)

---

## 📂 Estrutura (resumo)

A estrutura pode variar conforme o avanço do projeto, mas em geral segue algo como:

- `src/app/` – rotas com App Router (login, áreas de coach, aluno, admin, etc.)
- `src/app/api/` – rotas de API (alunos, treinos, etc.)
- `prisma/`
  - `schema.prisma` – definição do modelo de dados
  - `dev.db` – banco SQLite de desenvolvimento
- `public/` – arquivos estáticos (logos, uploads etc.)
- `src/components/` – componentes reutilizáveis de UI
- `src/lib/` – helpers, configuração de autenticação, utilitários
- `tailwind.config.ts` e `postcss.config.js` – configuração do Tailwind CSS
- `.env.example` – exemplo de variáveis de ambiente

> Se algo estiver diferente no seu projeto, ajuste os nomes para refletir a estrutura real.

---

## 🚀 Como rodar o projeto localmente

### 1. Clonar o repositório

git clone https://github.com/Phaaek013/ct-capixaba.git
cd ct-capixaba

### 2. Configurar as variáveis de ambiente
O projeto possui um arquivo .env.example na raiz com um exemplo das variáveis necessárias.

Faça uma cópia do arquivo .env.example com o nome .env.local:

cp .env.example .env.local
(ou crie manualmente o arquivo .env.local e copie o conteúdo do .env.example).

Ajuste os valores conforme sua máquina/ambiente.
Exemplos comuns (podem variar de acordo com seu .env.example):

DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uma_string_grande_e_aleatoria_aqui"

### 3. Instalar dependências
Com o Node.js instalado na máquina (verifique a versão recomendada no arquivo .nvmrc, se existir), instale as dependências do projeto:

npm install
Se você preferir yarn ou pnpm, ajuste o comando conforme o gerenciador de pacotes que estiver usando.

### 4. Rodar migrações do Prisma
Depois de configurar o .env.local, execute as migrações do Prisma para criar/atualizar o banco de dados de desenvolvimento:

npx prisma migrate dev
Isso vai ler o schema.prisma e aplicar as migrations necessárias no dev.db.

### 5. Rodar o servidor de desenvolvimento
Por fim, suba o servidor de desenvolvimento:

npm run dev
O Next.js iniciará em modo dev (por padrão na porta 3000).

Acesse no navegador:

http://localhost:3000
Se tudo estiver configurado corretamente, o CT Capixaba estará rodando localmente.

### 🧭 Próximos passos e roadmap
Algumas melhorias e extensões planejadas para o CT Capixaba:

Painéis mais completos para acompanhar evolução de alunos (cargas, tempos, PRs).

Gestão de planos de assinatura (ativo, vencido, período de teste).

Integração com meios de pagamento e/ou plataformas de cobrança.

Área de comunicação simplificada entre coach e alunos (avisos, recados, agenda).

Relatórios (quantidade de alunos ativos, treinos aplicados, etc.).

Possível uso de IA para:

sugerir treinos com base em objetivos do aluno;

analisar evolução e sugerir ajustes.

### 🤝 Contribuições
Este projeto nasceu de uma necessidade real de um centro de treinamento e está em evolução constante.

Sugestões de melhoria, issues e pull requests são bem-vindos.

Para discutir ideias ou parcerias, você pode entrar em contato comigo pelo LinkedIn ou via Vortix.

### 👨‍💻 Autor
Raphael Otávio Barbosa Cassiano

Desenvolvedor Web & Automação com IA

Fundador da Vortix

Pós-graduação em Business Intelligence, Banco de Dados e Inteligência Artificial (em andamento)

🔗 LinkedIn: https://www.linkedin.com/in/raphael-ot%C3%A1vio-57734b222/
🔗 Repositório: https://github.com/Phaaek013/ct-capixaba
