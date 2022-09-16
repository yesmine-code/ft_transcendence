import express from "express";
import * as csrf from "csurf";

export default csrf({
  cookie: {
    key: "cst",
    secure: true,
    sameSite: "lax",
    httpOnly: true,
  },
  value: (req: express.Request): string => {
    return <string>req.headers["x-csrf-token"];
  },
});
