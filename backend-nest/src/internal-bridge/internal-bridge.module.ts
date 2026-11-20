import { Global, Module } from '@nestjs/common';
import { InternalBridgeService } from './internal-bridge.service';

// Global, comme PrismaModule/AuthModule — tout futur module migré en aura
// besoin (Socket.IO, deletion-log) tant qu'Express les possède encore.
@Global()
@Module({
  providers: [InternalBridgeService],
  exports: [InternalBridgeService],
})
export class InternalBridgeModule {}
