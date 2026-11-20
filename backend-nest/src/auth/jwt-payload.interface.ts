// Forme exacte du payload décodé côté Express (tokenService.getTokens) :
// req.user = { id, email, role, nom_complet, iat, exp, iss, aud, sub }.
// Le token est émis exclusivement par backend/ (auth/user pas encore
// migrés) — Nest ne fait que vérifier, jamais signer.
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  nom_complet: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  sub: string;
}
