import { Module, forwardRef } from '@nestjs/common';
import { SmartLockService } from './smartlock.service';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { SmartLockController } from './smartlock.controller';

@Module({
  imports: [forwardRef(() => MqttModule)],
  controllers: [SmartLockController],
  providers: [SmartLockService],
})
export class SmartLockModule {}
