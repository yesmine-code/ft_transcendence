import { v4 as uuidv4 } from "uuid";
import { diskStorage } from "multer";

export const storage = {
  storage: diskStorage({
    destination: "./avatars",
    filename: (req, file, cb) => {
      if (file) {
        file.filename = uuidv4();

        cb(null, `${file.filename}.jpg`);
      }
    },
  }),
};
