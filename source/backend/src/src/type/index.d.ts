import { UserEntity } from "@/entities/user.entity";

export {};

declare global {
  namespace Express {
    interface Request {
      /**
       * User's data
       */
      currentUser?: UserEntity;
      required_2fa: boolean;
    }
  }
}
