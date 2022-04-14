import mongoose from "mongoose";
import {Picture} from "../../interfaces/picture.interface";

const { Schema } = mongoose;

const pictureSchema = new Schema<Picture>(
  {
    path: {
      type: String,
    },
    metadata: {
      type: Object
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
)

export const PictureModel = mongoose.model('Picture', pictureSchema);