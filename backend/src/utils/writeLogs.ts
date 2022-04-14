import fs from "fs";
import path from "path";
import {paths} from "../config";
import {setDateFormat} from "./dateFormat";
import {WriteLogsError} from "../errors/writeLogs.error";

let fileName = setDateFormat();

setInterval(() => {
  fileName = setDateFormat();
}, 3600000)

function openNewFileStream (data: string) {
  const stream = fs.createWriteStream (path.join(paths.LOGS_PATH, fileName), {flags: 'a'});
  stream.write(`${setDateFormat()} ${data}\n`);
}

export async function writeLogs (log: string) {
  try {
    if (!fs.existsSync(paths.LOGS_PATH)) {
      await fs.promises.mkdir(paths.LOGS_PATH);
    }

    openNewFileStream(log);

  } catch (err) {
   throw new WriteLogsError('Failed to write logs')
  }
}