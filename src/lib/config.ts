import { prisma } from "./prisma";

export async function getConfig() {
  const config = await prisma.config.findFirst();
  if (config) return config;
  return prisma.config.create({
    data: {}
  });
}
