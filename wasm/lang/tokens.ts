import { BinOp, Branch, Symbol, Label, Ir } from "../../src/ast/ir.ts";
export class Add extends BinOp {
      public override toString(): string {
            return `add ${this.result}, ${this.op1}, ${this.op2}`;
      }
}
export class Assign extends Add {
      constructor(assign: Symbol, assignee: Symbol) {
            super(assign, assignee, Symbol.from('0'));
      }
      public override toString(): string {
            return `${this.result} = ${this.op1}`;
      }
}

export class Jump extends Branch {
      constructor(label: Label) {
            super(label, Symbol.from('true'));
            super.addNext(label);
      }
      public override addNext(ir: Ir): void {
            // no operation
      }
      public override toString() {
            return `j ${this.label.toString()}`
      }
}