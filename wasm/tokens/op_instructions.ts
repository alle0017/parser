import { throws } from "node:assert";
import { Instruction } from "../../src/ast/instruction.ts";

export class OpInst extends Instruction {
      private static REG_ID = 0;
      public readonly reg = `%${++OpInst.REG_ID}`;

      constructor(private readonly op: string, private readonly a: string, private readonly b: string) {
            super();
      }
      
      public override getUsedVariables(): string[] {
            return [this.a,this.b];
      }
      public override getAssignedVariables(): string[] {
            return [this.reg];
      }
      private toAsmOp(): string {
            switch (this.op) {
                  case '==': return 'BEQ';
                  case '>=': return 'BGE'
                  case '<=': return 'BLE'
                  case '!=': return 'BNE'
                  case '>': return 'BGT'
                  case '<': return 'BLT'
                  case '+': return 'ADD'
                  case '*': return 'MUL'
                  case '/': return 'DIV'
                  case '-': return 'SUB'
                  case '%': return 'MOD'
                  default: return 'JMP'
            }
      }
      public override toString(): string {
            return `${this.toAsmOp()} ${this.reg}, ${this.a}, ${this.b}`;
      }
}

export class AssignInst extends Instruction {

      constructor(private readonly a: string, private readonly b: string) {
            super();
      }
      
      public override getUsedVariables(): string[] {
            return [this.b];
      }
      public override getAssignedVariables(): string[] {
            return [this.a];
      }

      public override toString(): string {
            return `store ${this.a}, ${this.b}`;
      }
}