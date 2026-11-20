import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

// Structure ; les règles métier plus fines (correct_index doit être un
// index valide de `options`, au moins 2 options) restent vérifiées dans
// EducationService, exactement comme côté Express (aucune de ces règles
// n'est exprimable proprement en décorateurs class-validator sans valider
// un champ par rapport à un autre du même objet).
export class QuizQuestionDto {
  @IsString()
  question: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Chaque question doit avoir un énoncé et au moins 2 options.' })
  @IsString({ each: true })
  options: string[];

  @IsInt()
  @Min(0)
  correct_index: number;
}

export class UpsertQuizDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins une question est requise.' })
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  passing_score?: number;
}
