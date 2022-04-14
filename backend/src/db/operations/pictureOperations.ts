import { PictureModel } from "../models/picture.model";
import {Picture} from "../../interfaces/picture.interface";
import {ObjectId} from "mongodb";
import {getFileNames} from "../../utils/fileNames";
import {getFilesMetadata} from "../../utils/fileMetadata";

export async function addPicturesToTheDB () {
  const pictureNames = await getFileNames() || [];
  const pictureMetadata = await getFilesMetadata();
  const newPicturesList: Picture[] = [];

  for (let i = 0; i < pictureNames.length; i++) {
    if (await PictureModel.exists({path: pictureNames[i]}) === null) {
      newPicturesList.push({
        path: pictureNames[i],
        metadata: pictureMetadata[i],
        owner: null,
      })
    }
  }

  for (let picture of newPicturesList) {
    await PictureModel.create(picture);
    console.log('pictures added');
  }
}

export async function addUserPicturesToDB (pictureObject: Picture) {
  await PictureModel.create(pictureObject);
}

export async function getTotalImagesAmount () {
  return await PictureModel.estimatedDocumentCount();
}

export async function getPicturesFromDB (this: any, id: ObjectId, page : number, limit: number, filter: string) {
  let pictures;

  if (filter !== 'false') {
    pictures = await PictureModel.find({owner: id}, null, {skip: limit * page - limit, limit: limit})

    return pictures;
  }

  pictures = await PictureModel.find({$or: [{owner: null}, {owner: id}]}, null, {skip: limit * page - limit, limit: limit});

  return pictures;
}

export async function getPicturesAmount (id: ObjectId, filter: string) {
  let userPicturesAmount;

  if (filter !== 'false') {
    userPicturesAmount = PictureModel.countDocuments({owner: id})

    return userPicturesAmount;
  }

  userPicturesAmount = PictureModel.countDocuments({$or: [{owner: null}, {owner: id}]});

  return userPicturesAmount;
}

export async function isUserPicturesEmpty (id: ObjectId) {
  return await PictureModel.countDocuments({owner: id}) === 0;
}