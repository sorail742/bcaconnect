import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductQuestionService } from './product-question.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';

type AuthedRequest = Request & { user: JwtPayload };

// Réplique backend/src/product-question/routes/productQuestion.route.js :
// getForProduct/markHelpful restent publics (optionalAuth d'origine
// n'exploitait jamais req.user pour ces deux actions) ; les autres exigent
// un token valide (protect -> JwtAuthGuard).
@Controller('product-questions')
export class ProductQuestionController {
  constructor(
    private readonly productQuestionService: ProductQuestionService,
  ) {}

  @Get('vendor/pending')
  @UseGuards(JwtAuthGuard)
  getPendingForVendor(@Req() req: AuthedRequest) {
    return this.productQuestionService.getPendingForVendor(req.user.id);
  }

  @Get('product/:productId')
  getForProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productQuestionService.getForProduct(productId);
  }

  @Post('product/:productId')
  @UseGuards(JwtAuthGuard)
  async ask(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AskQuestionDto,
    @Req() req: AuthedRequest,
  ) {
    const productQuestion = await this.productQuestionService.ask(
      productId,
      dto.question,
      req.user,
    );
    return { message: 'Question publiée.', productQuestion };
  }

  @Put(':id/answer')
  @UseGuards(JwtAuthGuard)
  async answer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnswerQuestionDto,
    @Req() req: AuthedRequest,
  ) {
    const productQuestion = await this.productQuestionService.answer(
      id,
      dto.reponse,
      req.user,
    );
    return { message: 'Réponse publiée.', productQuestion };
  }

  @Post(':id/helpful')
  markHelpful(@Param('id', ParseUUIDPipe) id: string) {
    return this.productQuestionService.markHelpful(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthedRequest,
  ) {
    await this.productQuestionService.remove(id, req.user);
    return { message: 'Question supprimée.' };
  }
}
