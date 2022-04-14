import { Request, Response, NextFunction } from "express";
import { writeLogs } from "../utils/writeLogs";
import { setDateFormat } from "../utils/dateFormat";

export class Logger {
  private setRequestInfoFormat = (req: Request) => {
    const reqMethod = req.method;
    const reqProtocol = req.protocol;
    const reqProtocolVersion = req.httpVersion;
    const reqHost = `${req.hostname}-${process.env.PORT}`;
    const reqUrl = req.url;

    const logTemplate = `[${reqProtocol}:${reqProtocolVersion}-${reqHost}] ${reqMethod}:${reqUrl}`;

    return logTemplate;
  }

  private setLogsFormat = (req: Request) => {
    const dateInfo = setDateFormat();
    const requestInfo = this.setRequestInfoFormat(req);

    return `${dateInfo} ${requestInfo}`;
  }

  setLogsFormatAndWrite = async (req: Request, res: Response, next: NextFunction) => {
    const logsFormat = this.setLogsFormat(req);

    res.on('finish',  async function (this: Response) {
      const resStatus = this.statusCode;
      const resMessage = this.statusMessage;
      const resTemplate = resMessage ? `${resStatus}:${resMessage}`
        :
        `status:${resStatus}`

      await writeLogs(`${logsFormat} ${resTemplate}`);
    })

    next();
  }
}


