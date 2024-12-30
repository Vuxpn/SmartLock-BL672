import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AddCardDto,
  DeleteCardDto,
  SetFixedPasswordDto,
  SetTimeOnlineDto,
} from './dto/smartlock.dto';
import { MQTT_TOPIC } from 'src/mqtt/mqtt.constants';
import { SmartLockCommand } from './smartlock.constants';

@Injectable()
export class SmartLockService {
  constructor(@Inject('MQTT_CLIENT') private readonly client: ClientProxy) {}

  // Chuyển đổi sang hex
  static strTo16(value: string): string {
    return BigInt(value).toString(16).toLowerCase();
  }

  // Bổ sung số 0 ở đầu
  static addZeroForNum(str: string, length: number): string {
    return str.padStart(length, '0');
  }

  // Size-end conversion
  public static changeByte(s: string): string {
    const bytes = new TextEncoder().encode(s);
    const bytesCopy = new Uint8Array(bytes);
    const length = bytesCopy.length;

    for (let i = 0; i < length / 2; i += 2) {
      // Swap bytes
      const tempFirst = bytesCopy[i];
      bytesCopy[i] = bytesCopy[length - i - 2];
      bytesCopy[length - i - 2] = tempFirst;

      const tempSecond = bytesCopy[i + 1];
      bytesCopy[i + 1] = bytesCopy[length - i - 1];
      bytesCopy[length - i - 1] = tempSecond;
    }

    return new TextDecoder().decode(bytesCopy);
  }
  // Hàm chuyển đổi số thẻ sang định dạng yêu cầu
  static convertNumber(number: string): string {
    // Chuyển sang hex
    let hexNumber = this.strTo16(number);

    // Bổ sung số 0 để đủ 8 ký tự
    hexNumber = this.addZeroForNum(hexNumber, 8);

    // Đảo ngược thứ tự byte
    return this.changeByte(hexNumber);
  }

  // Hàm chuyển đổi số thẻ sang định dạng yêu cầu
  static convertDuration(number: string): string {
    // Chuyển sang hex
    let hexNumber = this.strTo16(number);

    // Bổ sung số 0 để đủ 8 ký tự
    hexNumber = this.addZeroForNum(hexNumber, 2);

    return hexNumber;
  }

  async remoteDoorOpening() {
    const topic = MQTT_TOPIC.TOPIC;
    const message = {
      commandid: SmartLockCommand.REMOTE_DOOR_OPENING,
      value: '00056105000000015568',
    };
    try {
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'Remote open door request sent successfully',
      };
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }

  async addCard(data: AddCardDto) {
    const topic = MQTT_TOPIC.TOPIC;
    const cardId = SmartLockService.convertNumber(data.value);
    console.log(cardId);
    const message = {
      commandid: data.value,
      value: '00085101' + cardId + '000000015568',
    };
    console.log(message);
    try {
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'Add card request sent successfully',
      };
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }

  async deleteCard(data: DeleteCardDto) {
    const topic = MQTT_TOPIC.TOPIC;
    const cardId = SmartLockService.convertNumber(data.value);
    console.log(cardId);
    const message = {
      commandid: SmartLockCommand.DELETE_CARD,
      value: '00085201' + cardId + '000000015568',
    };
    console.log(message);
    try {
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'Delete card request sent successfully',
      };
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }

  async emptyAllCard() {
    const topic = MQTT_TOPIC.TOPIC;
    const message = {
      commandid: SmartLockCommand.EMPTY_ALL_CARD,
      value: '00055305000000015568',
    };
    try {
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'Empty all card request sent successfully',
      };
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }

  async synchronizeDoorTime() {
    const topic = MQTT_TOPIC.TOPIC;

    // Get current date and time in UTC+7
    const now = new Date();
    const utc7Date = new Date(now.getTime());

    // Format the time string according to the specification: yymmddHHMMSSWW
    const timeString =
      utc7Date
        .toLocaleString('en-GB', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Bangkok', // UTC+7
        })
        .replace(/[^\d]/g, '') + // Remove non-digit characters
      String(utc7Date.getDay() === 0 ? 7 : utc7Date.getDay()).padStart(2, '0'); // Add week day (1-7)

    const message = {
      commandid: SmartLockCommand.SYNC_TIME_UTC7,
      value: '000c64' + timeString + '000000015568',
    };

    try {
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'Synchronize door time request sent successfully',
      };
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }

  async setFixedPassword(data: SetFixedPasswordDto) {
    const topic = MQTT_TOPIC.TOPIC;
    const value = SmartLockService.strTo16(data.password);
    const password = SmartLockService.addZeroForNum(value, 8);
    const message = {
      commandid: SmartLockCommand.SET_FIXED_PASSWORD,
      value: '000556' + password + '000000015568',
    };
    console.log(message);
    try {
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'Set fixed password request sent successfully',
      };
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }

  async setTimeOnline(data: SetTimeOnlineDto) {
    const topic = MQTT_TOPIC.TOPIC;
    const time = SmartLockService.convertDuration(data.duration);
    const message = {
      commandid: parseInt(data.duration),
      value: '000565' + time + '000000015568',
    };
    console.log(message);
    try {
      await this.client.emit(topic, message).toPromise();
      return {
        success: true,
        message: 'Set duration online request sent successfully',
      };
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }
}
