import express from "express";
import * as crypto from "crypto";

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.locals.nonce = crypto.randomBytes(16).toString("hex");
  next();
};
