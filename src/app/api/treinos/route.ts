import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDayUTC, nextDayUTC } from "@/utils/date";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const alunoId = url.searchParams.get("alunoId");
    const dateStr = url.searchParams.get("date");

    if (!alunoId) return NextResponse.json({ error: "alunoId obrigatório" }, { status: 400 });

    const baseDate = dateStr ? new Date(dateStr) : new Date();
    const gte = startOfDayUTC(baseDate);
    const lt = nextDayUTC(baseDate);

    const treino = await prisma.treino.findFirst({
      where: {
        alunoId: Number(alunoId),
        ehModelo: false,
        dataTreino: { gte, lt }
      }
    });

    return NextResponse.json({ treino });
  } catch (error) {
    console.error("GET /api/treinos error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alunoId, coachId, date, conteudo, videoUrl } = body;

    if (!alunoId || !coachId || !date || !conteudo) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const dataUTC = startOfDayUTC(date);

    // find existing treino for that aluno+date
    const existente = await prisma.treino.findFirst({
      where: { alunoId: Number(alunoId), dataTreino: dataUTC, ehModelo: false }
    });

    let treino;
    if (existente) {
      treino = await prisma.treino.update({
        where: { id: existente.id },
        data: { conteudo, videoUrl: videoUrl || null }
      });
    } else {
      treino = await prisma.treino.create({
        data: {
          alunoId: Number(alunoId),
          dataTreino: dataUTC,
          conteudo,
          videoUrl: videoUrl || null,
          ehModelo: false
        }
      });
    }

    return NextResponse.json({ treino }, { status: 200 });
  } catch (error) {
    console.error("POST /api/treinos error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
