const { PrismaClient } = require('@prisma/client');

(async function main(){
  const prisma = new PrismaClient();
  try {
    console.log('Procurando usuários com nome contendo "Raphael" e pelo email phaelteste02@hotmail.com...');
    const users = await prisma.usuario.findMany({
      where: {
        OR: [
          { nome: { contains: 'Raphael' } },
          { email: 'phaelteste02@hotmail.com' }
        ]
      }
    });

    if (users.length === 0) {
      console.log('Nenhum usuário encontrado.');
      return;
    }

    for (const u of users) {
      console.log('\n--- USUARIO ---');
      console.log({ id: u.id, nome: u.nome, email: u.email });
      const treinos = await prisma.treino.findMany({
        where: { alunoId: u.id },
        orderBy: { dataTreino: 'desc' },
        take: 50
      });
      console.log(`Encontrados ${treinos.length} treinos para usuario id=${u.id}`);
      for (const t of treinos) {
        console.log({ id: t.id, alunoId: t.alunoId, dataTreino: t.dataTreino, conteudoPreview: (t.conteudo||'').slice(0,200), videoUrl: t.videoUrl });
      }
    }
  } catch (e) {
    console.error('Erro ao consultar o banco:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
