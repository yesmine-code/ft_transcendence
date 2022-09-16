import { Socket } from "socket.io";

import { WsException } from "@nestjs/websockets";
import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { InputException } from "../exception/input.exception";

@Catch(WsException, HttpException)
export class WsExceptionFilter {
  public catch(exception: HttpException | WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    if (exception instanceof InputException) {
      return client.emit("exception", exception.getResponse());
    }

    if (exception instanceof HttpException) {
      return client.emit("exception", {
        code: exception.getStatus(),
        message: exception.message,
      });
    }

    if (exception instanceof WsException) {
      return client.emit("exception", {
        code: 422,
        message: exception.getError(),
      });
    }
  }
}
