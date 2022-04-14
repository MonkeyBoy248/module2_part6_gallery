import {paths} from "../config";
import {getFileNames} from "./fileNames";
import {Stats} from "fs";
import fs from "fs";
import path from "path";

export async function getFilesMetadata () {
  const { API_IMAGES_PATH } = paths;
  const imageNames = await getFileNames();
  const metadataArray: Stats[] = [];

  if (imageNames) {
    for (let name of imageNames) {
      metadataArray.push(await fs.promises.stat(path.join(API_IMAGES_PATH, name)));
    }
  }

  return metadataArray;
}