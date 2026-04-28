import { writeFileSync } from "node:fs";

const LogConstructor = (name: string) => new Logger(name);
export class Logger {
      private static readonly loggers: Map<string,Logger> = new Map();
      static getLogger(name: string) {
            return this.loggers.getOrInsertComputed(name, LogConstructor);
      }

      static enable(name: string) {
            const logger = this.loggers.getOrInsertComputed(name, LogConstructor);
            logger.enableLog();

            for (const hs of logger.history) {
                  console.log(hs);
            }
      }
      private readonly history: string[] = [];
      private enabled: boolean = false;
      constructor(private readonly name: string) {}

      public enableLog() {
            this.enabled = true;
            return this;
      }
      public log(...values: unknown[]) {
            const now = performance.now();

            this.history.push(`[${this.name};${now}] ${values.join('')}`);

            if (this.enabled) {
                  console.log(this.history.at(-1)!);
            }
      }

      public print() {
            writeFileSync(`./${this.name}.log`, this.history.join('\n'));
      }
}