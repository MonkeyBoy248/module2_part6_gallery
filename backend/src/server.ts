import express from 'express';
import bodyParser from "body-parser";
import { AuthenticationController } from "./controllers/authentication.controller";
import { GalleryController } from "./controllers/gallery.controller";
import dotenv from 'dotenv';
import { nonexistentPageHandler } from "./middleware/nonexistentPage.middleware";
import { paths } from "./config";
import { Logger } from "./middleware/logger.middleware";
import {connectDB} from "./db/dbConnection";
import {addUsersToDB} from "./db/operations/userOperations";
import {addPicturesToTheDB} from "./db/operations/pictureOperations";
import passport from "passport";
import {initializeJWTStrategy} from "./passport/jwtStrategy";
import {initializeLogInStrategy} from "./passport/loginStrategy";
import {initializeSignUpStrategy} from "./passport/signupStrategy";

dotenv.config();

const app = express();
const authenticationController = new AuthenticationController();
const galleryController = new GalleryController();
const logger = new Logger();


const port = process.env.PORT || 8000;
const protocol = process.env.PROTOCOL || 'http';
const hostname = process.env.HOSTNAME || 'localhost';

console.log('port', process.env.PORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(logger.writeLogs);

app.use('/',
  express.static(paths.STATIC_VIEWS_PATH),
  express.static(paths.STATIC_PAGES_PATH),
  express.static(paths.STATIC_PUBLIC_PATH),
)

initializeSignUpStrategy(passport);
initializeLogInStrategy(passport);
initializeJWTStrategy(passport);
app.use(passport.initialize());

app.use(authenticationController.router);
app.use(galleryController.router);

app.use(nonexistentPageHandler)

connectDB()
  .then(() => addUsersToDB())
  .then(() => addPicturesToTheDB())
  .then(() => app.listen(port, () => console.log(`Server is running on port ${port}.
${protocol}://${hostname}:${port}`)));
