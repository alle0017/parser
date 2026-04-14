
export class Diagnostics {
      private readonly errors: string[] = [];
      private readonly warnings: string[] = [];
      private readonly logs: string[] = [];

      constructor(private readonly writer: Writer) {

      }
      public error(err: string): this {
            this.errors.push(err);
            return this;
      }
      public warning(warn: string): this {
            this.warnings.push(warn);
            return this;
      }
      public log(log: string): this {
            this.logs.push(log);
            return this;
      }

      public write() {
            for (const err of this.errors) {
                  this.writer.writeError(err);
            }
            for (const msg of this.warnings) {
                  this.writer.writeWarning(msg);
            }
            for (const msg of this.logs) {
                  this.writer.writeLog(msg);
            }
      }
}

export interface Writer {
      writeError(msg: string): void;
      writeWarning(msg: string): void;
      writeLog(msg: string): void;
}

export class ConsoleWriter implements Writer {
      writeError(msg: string): void {
            console.error(msg);
      }
      writeWarning(msg: string): void {
            console.warn(msg);
      }
      writeLog(msg: string): void {
            console.log(msg);
      }     
}
