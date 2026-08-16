import { IsOptional, IsString } from 'class-validator';

// Le frontend envoie ce champ sur DELETE (ConfirmDeleteModal — l'admin doit
// retaper le nom de l'élément) — capturé dans le journal de suppression
// (confirmation_saisie), jamais utilisé pour bloquer la suppression elle-même.
export class DeleteWebinarDto {
  @IsOptional()
  @IsString()
  confirmation_nom?: string;
}
