import { BroadcastOperator } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export type SocketSender = BroadcastOperator<DefaultEventsMap, any>;
