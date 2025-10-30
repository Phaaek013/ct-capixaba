const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function startOfDayUTC(d) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate(), 0, 0, 0, 0));
}

function nextDayUTC(d) {
  const s = startOfDayUTC(d);
  return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate() + 1, 0, 0, 0, 0));
}

async function run() {
  try {
    const TIMEZONE = process.env.TIMEZONE || 'America/Sao_Paulo';
    const alunoId = Number(process.argv[2] || 3);
    const nowInTz = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
    const gte = startOfDayUTC(nowInTz);
    const lt = nextDayUTC(nowInTz);

    console.log('TIMEZONE:', TIMEZONE);
    console.log('nowInTz:', nowInTz.toISOString());
    console.log('gte:', gte.toISOString());
    console.log('lt:', lt.toISOString());

    const treinos = await prisma.treino.findMany({
      where: {
        alunoId,
        ehModelo: false,
        dataTreino: { gte, lt }
      }
    });

    console.log(`Found ${treinos.length} treinos for alunoId=${alunoId} in range`);
    for (const t of treinos) {
      console.log({ id: t.id, dataTreino: t.dataTreino.toISOString(), conteudo: t.conteudo.slice(0,80) });
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
