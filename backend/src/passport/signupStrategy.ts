import passport from 'passport'
import {hashPassword} from "../utils/hashPassword";
import {UserModel} from "../db/models/user.model";
import {Strategy as LocalStrategy} from "passport-local";
import dotenv from 'dotenv';

dotenv.config();

export function initializeSignUpStrategy (passport: passport.PassportStatic) {
  const signUp = async (email: string, password: string, done: Function) => {
    try {
      const hashedPassword = await hashPassword(password);
      const userObject = {
        email,
        password: hashedPassword.hash,
        salt: hashedPassword.salt,
      }

      const user = await UserModel.create(userObject);

      return done(null, user);
    } catch (error) {
      done(error);
    }
  }

  passport.use(
    'signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      signUp
    )
  );
}
