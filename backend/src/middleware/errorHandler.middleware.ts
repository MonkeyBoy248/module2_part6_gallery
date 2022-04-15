import {NextFunction, Request, Response} from "express";
import {writeLogs} from "../utils/writeLogs";

export async function customErrorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
  await writeLogs(err.name);

  res.status(500).send({error: err.message});
}