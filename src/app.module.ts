import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttModule } from './mqtt/mqtt.module';
import { SmartLockModule } from './devices/smartlock.module';

@Module({
  imports: [MqttModule, SmartLockModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
