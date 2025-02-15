/* eslint-disable import/no-import-module-exports */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { plugin, errorHandler } from 'supertokens-node/framework/fastify';
import supertokens from 'supertokens-node';

import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const fastify = new FastifyAdapter({
    logger: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastify, {
    // logger: console,
    bufferLogs: true,
  });

  const SuperTokensWebDomains = process.env.SUPERTOKENS_WEBSITE_DOMAIN?.split(',');

  // SuperTokens CORS
  app.enableCors({
    origin: SuperTokensWebDomains,
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  });

  await app.register(plugin);

  // SuperTokens Filter
  fastify.setErrorHandler(errorHandler());
  // swagger
  const config = new DocumentBuilder()
    .setTitle('TinkerHub Platform API')
    .setDescription('The core APIs provided by TinkerHub platform')
    .setVersion('1.0')
    .addTag('tinkerhub')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // setup validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  await app.init();

  return {
    app,
    fastify: fastify.getInstance(),
  };
}

async function startServer() {
  const { app } = await bootstrap();
  await app.listen(process.env.PORT as string, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`Application is running on: ${await app.getUrl()}`);
  // webpack based hot reloading
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

startServer();

// let cachedNestApp;
//
// // lambda execution code
// export const handler = async (
//   event: APIGatewayProxyEvent,
//   context: Context
// ): Promise<PromiseHandler> => {
//   if (!cachedNestApp) {
//     const nestApp = await bootstrap();
//     cachedNestApp = awsLambdaFastify(nestApp.fastify, { decorateRequest: true });
//   }
//
//   return cachedNestApp(event, context);
// };
