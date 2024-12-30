import { Body, Controller, Post } from '@nestjs/common';
import {
  AddCardDto,
  DeleteCardDto,
  SetFixedPasswordDto,
  SetTimeOnlineDto,
} from './dto/smartlock.dto';
import { SmartLockService } from './smartlock.service';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';

@Controller('smartlock')
export class SmartLockController {
  constructor(private readonly smartLockService: SmartLockService) {}
  @Post('remotedooropen')
  remoteDoorOpening() {
    this.smartLockService.remoteDoorOpening();
  }

  @Post('addcard')
  addCard(@Body() addCardDto: AddCardDto) {
    this.smartLockService.addCard(addCardDto);
  }

  @Post('deletecard')
  deleteCard(@Body() deleteCardDto: DeleteCardDto) {
    this.smartLockService.deleteCard(deleteCardDto);
  }

  @Post('emptyallcard')
  emptyAllCard() {
    this.smartLockService.emptyAllCard();
  }

  @Post('synchronizetime')
  synchronizeTime() {
    this.smartLockService.synchronizeDoorTime();
  }

  @Post('setfixedpassword')
  setFixedPassword(@Body() setFixedPasswordDto: SetFixedPasswordDto) {
    return this.smartLockService.setFixedPassword(setFixedPasswordDto);
  }

  @Post('settimeonline')
  setTimeOnline(@Body() setTimeOnlineDto: SetTimeOnlineDto) {
    return this.smartLockService.setTimeOnline(setTimeOnlineDto);
  }

  @MessagePattern('data_publish_topic_1')
  getNotificationsWarning(
    @Payload() data: number[],
    @Ctx() context: MqttContext,
  ) {
    console.log('Received data:', data);
  }
}
