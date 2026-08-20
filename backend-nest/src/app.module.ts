import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InternalBridgeModule } from './internal-bridge/internal-bridge.module';
import { WebinarModule } from './webinar/webinar.module';
import { CategoryModule } from './category/category.module';
import { EducationModule } from './education/education.module';
import { PriceIndexModule } from './price-index/price-index.module';
import { CertificationModule } from './certification/certification.module';
import { PartnerStockModule } from './partner-stock/partner-stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    InternalBridgeModule,
    WebinarModule,
    CategoryModule,
    EducationModule,
    PriceIndexModule,
    CertificationModule,
    PartnerStockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
