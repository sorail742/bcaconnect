import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const STATUTS = ['a_venir', 'en_direct', 'termine'] as const;

// Champs alignés sur backend/src/webinar/service/webinar.service.js#create
// (mêmes champs acceptés, même absence de contrainte de format sur
// lien_rejoindre/video_url — Express ne les validait pas comme des URLs).
export class CreateWebinarDto {
  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date_heure: string;

  @IsString()
  @IsNotEmpty()
  intervenant: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  lien_rejoindre?: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  // Le formulaire frontend (AdminWebinars.jsx#emptyForm) inclut toujours ce
  // champ, y compris à la création — accepté pour la compatibilité avec le
  // contrat existant, mais jamais utilisé : un nouveau webinaire démarre
  // toujours 'a_venir' (même comportement qu'Express, qui l'ignorait déjà
  // silencieusement via son destructuring explicite dans webinar.service.js).
  @IsOptional()
  @IsIn(STATUTS)
  statut?: (typeof STATUTS)[number];
}
