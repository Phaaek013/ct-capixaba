import bcrypt from "bcryptjs";

export async function hashSenha(senha: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
}

export async function compararSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}
