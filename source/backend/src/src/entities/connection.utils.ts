import { ForbiddenException } from "@nestjs/common";

export enum ConnectionType {
  PENDING,
  FRIEND,
  DECLINED,
  BLOCKED,
}

export const isFriendshipType = (type: ConnectionType) => {
  return type < 3;
};

export const translateType = (type: ConnectionType) => {
  switch (type) {
    case 0:
      return "PENDING";
    case 1:
      return "FRIEND";
    case 2:
      return "DECLINED";
    case 3:
      return "BLOCKED";
    default:
      throw new ForbiddenException();
  }
};
