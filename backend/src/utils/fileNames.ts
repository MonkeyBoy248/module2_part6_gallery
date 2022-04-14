import fs from "fs";
import {paths} from "../config";
import {ReadFileNamesError} from "../errors/readFileNames.error";

export async function getFileNames () {
  try {
    const fileNames = await fs.promises.readdir(paths.API_IMAGES_PATH);

    if (fileNames.length === 0) {
      return [];
    }

    return fileNames;
  } catch (err) {
    throw new ReadFileNamesError('Failed to get file names list')
  }
}