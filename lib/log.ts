import { Console } from "console";
import { Writable } from "stream";

class Logger extends Writable {
  private log: (message: string) => void;

  constructor(log: (message: string) => void) {
    super();

    this.log = log;
  }

  _write(chunk: Buffer, encoding: string, callback: () => void) {
    this.log(chunk.toString());
    callback();
  }
}

export function createLogger(log: ((message: string) => void) | null | undefined) {
  // eslint-disable-next-line no-console
  return log ? new Console(new Logger(log)).log : log === null ? () => {} : console.log;
}
