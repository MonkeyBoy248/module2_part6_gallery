import passport from 'passport'
import {UserModel} from "../db/models/user.model";
import bcrypt from "bcrypt";
import {Strategy as LocalStrategy} from "passport-local";
import dotenv from 'dotenv';

dotenv.config();

export function initializeLogInStrategy(passport: passport.PassportStatic) {
  const authenticateUser = async (email: string, password: string, done: Function) => {
    const user = await UserModel.findOne({email});
    if (user === null) {
      return done(null, false, {message: 'No user with that email'});
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false)
      }
    } catch (err) {
      console.log('err', err);
      return done(err);
    }
  }

  passport.use('login',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },
      authenticateUser));
}