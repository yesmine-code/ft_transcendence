import * as bcrypt from "bcrypt";

export function encode(password: string) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync());
}

export function verify(value: string, password: string) {
  return bcrypt.compareSync(password, value);
}
