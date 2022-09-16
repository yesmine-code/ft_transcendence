import express from "express";
import helmet from "helmet";

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        scriptSrc: ["'self'", `'nonce-${res.locals.nonce}'`],
        scriptSrcElem: ["'self'", `'nonce-${res.locals.nonce}'`],
        imgSrc: ["'self'", "data:", "blob:"],
        upgradeInsecureRequests: null,
      },
    },
  })(req, res, next);
};
