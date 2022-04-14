import * as express from 'express';
import {Request, Response} from 'express';
import {Controller} from "../interfaces/controller.interface";
import {renameFile} from "../utils/renameFile";
import passport from "passport";
import {ObjectId} from "mongodb";
import {User} from "../interfaces/user.interface";
import multer from "multer";
import {paths} from "../config";
import * as dbPictures from "../db/operations/pictureOperations";
import {Picture} from "../interfaces/picture.interface";
import {createStorageFolder} from "../utils/createStorage";
import {getFilesMetadata} from "../utils/fileMetadata";

export interface GalleryObject {
  objects: Picture[];
  page: number;
  total: number;
}

export class GalleryController implements Controller {
  private galleryRoute = '/gallery';
  private upload = multer({dest: paths.API_IMAGES_PATH});
  router = express.Router();

  constructor() {
    this.setRoute();
  }

  setRoute () {
    return this.router.route(this.galleryRoute)
      .get(passport.authenticate('jwt', {session: false}), this.sendGalleryResponse)
      .post(passport.authenticate('jwt', {session: false}), this.upload.single('file'), this.uploadUserPicture);
  }

  private async countTotalPagesAmount (limit: number, filter: string, id: ObjectId) {
    const picturesPerPage = limit || 4;
    const picturesTotal = await dbPictures.getPicturesAmount(id, filter) || 0;
    const totalPages: number = Math.ceil(picturesTotal / picturesPerPage);

    return totalPages;
  }

  private createGalleryResponseObject = async (id: ObjectId, total: number, page: string, limit: number, filter: string ): Promise<GalleryObject> => {
    const objects = await dbPictures.getPicturesFromDB(id, Number(page), Number(limit) || 4, filter) || [] as Picture[];
    const pageNumber = Number(page);

    return {
      objects: objects,
      total,
      page: pageNumber
    };
  }

  private sendGalleryResponse = async (req: Request, res: Response) => {
    const owner = req.user as User
    const ownerId = owner._id;
    const filter = req.query.filter ? String(req.query.filter) : 'false';
    const totalPagesAmount = await this.countTotalPagesAmount(Number(req.query.limit), filter, ownerId!);
    const pageNumber = req.query.page ? String(req.query.page) : '1';

    let responseObject = await this.createGalleryResponseObject(ownerId!, totalPagesAmount, pageNumber, Number(req.query.limit), filter);

    if (await dbPictures.isUserPicturesEmpty(ownerId!) && filter !== 'false') {
      res.status(200).json(responseObject);
      return;
    }

    if (Number(pageNumber) <= 0 || Number(pageNumber) > totalPagesAmount) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(responseObject);
  }

  private uploadUserPicture = async (req: Request, res: Response) => {
    const fileData = req.file;
    const picturesAmount = await dbPictures.getTotalImagesAmount()
    const pictureName = await renameFile(fileData!, picturesAmount);

    try {
      const metadata = await getFilesMetadata();
      const user = req.user as User;
      const pictureObject: Picture = {
        path: pictureName!,
        metadata: metadata[picturesAmount],
        owner: user._id!,
      }

      await dbPictures.addUserPicturesToDB(pictureObject);
      await createStorageFolder(pictureName!);

      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(500);
    }
  }
}