import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

const STATUTS = ['a_venir', 'en_direct', 'termine'] as const;

// Contrairement à Express (webinarRepository.updateInstance fait un
// webinar.update(body) sans allowlist — accepte n'importe quel champ), on
// déclare ici explicitement tout ce qu'un admin peut légitimement modifier.
// Resserre un mass-assignment latent côté Express plutôt que le reproduire.
export class UpdateWebinarDto {
  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date_heure?: string;

  @IsOptional()
  @IsString()
  intervenant?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  lien_rejoindre?: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  @IsOptional()
  @IsIn(STATUTS)
  statut?: (typeof STATUTS)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  participants_count?: number;
}
