import { Request , Response } from "express";
import {paths} from "../config";


export function nonexistentPageHandler (req: Request, res: Response) {
  if (req.accepts('html')) {
    res.status(404).sendFile(paths.ERROR_PAGE_PATH);
    return;
  }
}