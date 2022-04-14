import passport from 'passport'
import {ExtractJwt, Strategy as JWTStrategy, VerifiedCallback} from "passport-jwt";
import {UserModel} from "../db/models/user.model";
import dotenv from 'dotenv';

dotenv.config();

export function initializeJWTStrategy(passport: passport.PassportStatic) {
  const verifyToken = async (jwtPayload: any, done: VerifiedCallback) => {
    const user = await UserModel.findOne({email: jwtPayload.email});

    if (user) {
      return done(null, user);
    }

    return done(null, false);
  }

  passport.use('jwt',
    new JWTStrategy(
      {
        secretOrKey: process.env.SECRET_KEY,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      verifyToken
    )
  );
}