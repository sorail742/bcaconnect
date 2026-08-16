import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global : injectable dans n'importe quel module sans le réimporter partout,
// même pattern que sequelize était accessible partout côté backend/.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
