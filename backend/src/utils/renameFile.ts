import fs from "fs";
import path from "path";
import {paths} from "../config";
import {RenameFileError} from "../errors/renameFile.error";

export async function renameFile(fileData: Express.Multer.File, picturesAmount: number) {
  try {
    const pictureName = `user_image_${picturesAmount + 1}${fileData.originalname.slice(fileData.originalname.indexOf('.'))}`;

    await fs.promises.rename(
      fileData.path,
      path.join(paths.API_IMAGES_PATH, pictureName)
    );

    return pictureName;
  } catch (err) {
    throw new RenameFileError('Failed to rename file');
  }
}