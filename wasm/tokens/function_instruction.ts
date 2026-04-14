import { throws } from "node:assert";
import { FlowInstruction } from "../../src/ast/instruction.ts";
export type Arg = { name: string, type: string };

export class FunctionInstr extends FlowInstruction {
      constructor(private readonly name: string, private readonly args: Arg[], private readonly retType: string) {
            super();
      }
      public override toString(): string {
            return `func (export "${this.name}") ${this.args.map(arg => `(param ${arg.name}@${arg.type})`).join(' ')} (result ${this.retType})`;
      }
}

export class RetInstr extends FlowInstruction {
      public override toString(): string {
            return 'ret';
      }
}