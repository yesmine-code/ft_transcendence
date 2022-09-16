import * as cookieParser from "cookie-parser";

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";

import csp from "@/common/middlewares/csp.middleware";
import csrf from "@/common/middlewares/csrf.middleware";
import nonce from "@/common/middlewares/nonce.middleware";

import { AppModule } from "@/app/app.module";
import { InputException } from "./common/exception/input.exception";
import { ValidationError } from "class-validator";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.enableCors({
    origin: "http://127.0.0.1:4000",
    credentials: true,
    exposedHeaders: ["Location"],
  });

  app.useStaticAssets("/app/dist/static/public/", {
    prefix: "/",
  });

  app.disable("x-powered-by");
  app.use(cookieParser());

  app.use(nonce);
  app.use(csrf);
  app.use(csp);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsConverter = (props: ValidationError[]) => {
          return props.reduce((a, v) => {
            if (!v.constraints) return errorsConverter(v.children);

            return { ...a, [v.property]: Object.values(v.constraints)[0] };
          }, {});
        };

        return new InputException(errorsConverter(errors));
      },
    })
  );

  await app.listen(4000);
}

bootstrap();
