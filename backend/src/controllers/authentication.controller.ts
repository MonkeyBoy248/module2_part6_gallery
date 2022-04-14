import * as express from 'express';
import {Request, Response} from "express";
import { Controller } from "../interfaces/controller.interface";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface TokenObject {
  token: string;
  timestamp?: number;
}

export class AuthenticationController implements Controller {
  private authenticationRoute = '/authentication';
  private signupRoute = '/signUp';
  private readonly secretKey = process.env.SECRET_KEY || 'token';
  router = express.Router();

  constructor() {
    this.setRoute();
  }

  public setRoute () {
    return {
      authentication: this.router.post(this.authenticationRoute, passport.authenticate('login', {session: false}), this.sendAuthenticationResponse),
      signup: this.router.post(this.signupRoute, passport.authenticate('signup', {session: false}), this.redirectToTheAuthentication)
    }
  }

  private createToken = async (data: string) => {
    return jwt.sign({ email: data}, this.secretKey);
  }

  private sendAuthenticationResponse = async (req: Request, res: Response) => {
    const token = await this.createToken(req.body.email);
    const tokenObject: TokenObject = {token};

    res.status(200).json(tokenObject);
  }

  private redirectToTheAuthentication = (req: Request, res: Response) => {
    res.redirect(307, '/authentication');
  }
}