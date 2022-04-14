import fs from "fs";
import {paths} from "../config";
import path from "path";
import {CopyToStorageError} from "../errors/copyToStorage.error";

export async function createStorageFolder (fileName: string) {
  if (!fs.existsSync(paths.PICTURES_STORAGE_PATH)) {
    await fs.promises.mkdir(paths.PICTURES_STORAGE_PATH);
  }

  try {
    await fs.promises.copyFile(path.join(paths.API_IMAGES_PATH, fileName), path.join(paths.PICTURES_STORAGE_PATH, fileName));
  } catch (err) {
    throw new CopyToStorageError('Failed to copy files to the storage folder')
  }

}
