// Même transformation que backend/src/services/jwtService.js : retire un
// unique guillemet englobant, puis convertit les séquences \n littérales
// (telles que stockées dans .env) en vrais sauts de ligne PEM.
export function parsePemFromEnv(raw: string | undefined): string {
  if (!raw) {
    throw new Error('JWT_PUBLIC_KEY est requis');
  }
  return raw.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}
