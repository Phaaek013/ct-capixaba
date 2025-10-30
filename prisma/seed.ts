import { PrismaClient } from "@prisma/client";
import { hashSenha } from "../src/utils/crypto";

const prisma = new PrismaClient();

async function main() {
  // Opcional: descomente para criar um Coach demo durante a seed inicial.
  // const senhaHash = await hashSenha("senha-segura");
  // await prisma.usuario.upsert({
  //   where: { email: "coach@exemplo.com" },
  //   update: {},
  //   create: {
  //     nome: "Coach Demo",
  //     email: "coach@exemplo.com",
  //     senhaHash,
  //     tipo: Coach,
  //     senhaPrecisaTroca: false
  //   }
  // });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
