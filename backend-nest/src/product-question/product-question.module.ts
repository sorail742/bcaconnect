import { Module } from '@nestjs/common';
import { ProductQuestionController } from './product-question.controller';
import { ProductQuestionService } from './product-question.service';

@Module({
  controllers: [ProductQuestionController],
  providers: [ProductQuestionService],
})
export class ProductQuestionModule {}
