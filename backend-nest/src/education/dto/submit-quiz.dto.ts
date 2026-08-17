import { IsArray, IsInt } from 'class-validator';

export class SubmitQuizDto {
  // La longueur attendue dépend du quiz lui-même (nombre de questions) —
  // vérifiée dans EducationService, pas ici (même partage que côté Express).
  @IsArray()
  @IsInt({ each: true })
  reponses: number[];
}
