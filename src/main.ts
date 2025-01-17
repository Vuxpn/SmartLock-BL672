import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('IOT ')
    .setDescription('The iot API description')
    .setVersion('1.0')
    .addTag('iot')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .build();
  const configService = app.get(ConfigService);
  const host = configService.get<string>('HOST');
  const port = process.env.PORT || 3000;

  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.MQTT,
      options: {
        url: 'mqtt://broker.emqx.io:1883',
        protocol: 'mqtt',
        rejectUnauthorized: false,
      },
    });

    // Bắt đầu tất cả các microservices
    await app.startAllMicroservices();
    console.log('All microservices are running.');
    // await app.listen(port, host, () => {
    //   console.log(`Server is running on ${host}:${port}`, 'Bootstrap');
    // });
  } catch (error) {
    console.error('Error starting microservice:', error);
  }
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port);
}
bootstrap();
