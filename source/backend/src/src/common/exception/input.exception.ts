import { UnprocessableEntityException } from "@nestjs/common";

export class InputException extends UnprocessableEntityException {
  constructor(message: Record<string, any>) {
    super({
      code: 422,
      message,
    });
  }
}
