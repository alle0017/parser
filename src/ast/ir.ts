import { BasicBlock } from "./basic_block.ts";

export abstract class Ir {
      public readonly next: Set<Ir> = new Set();
      public addNext(Ir: Ir) {
            this.next.add(Ir);
      }
      toString() {
            return `ir`;
      }
}

export class Symbol extends Ir {
      private static ID = 0;
      private static readonly map: Map<string, Symbol> = new Map()
      public static new() {
            let symbol = `s${++this.ID}`;
            while (this.map.has(symbol)) {
                  symbol = `s${++this.ID}`;
            }
            return this.from(symbol);
      }
      static from(name: string) {
            return this.map.getOrInsertComputed(name, () => new Symbol(name));
      }

      protected constructor(protected readonly value: string) { super() }
      public override toString() {
            return `%${this.value}`;
      }
}
export class TypedSymbol extends Symbol {
      constructor(name: string, protected readonly type: string) {
            super(name);
      }
      public override toString() {
            return `${super.toString()}: ${this.type}`
      }
}
export class Label extends Symbol {
      public override toString() {
            return `$${this.value}`;
      }
}
export class Ret extends Ir {
      constructor(protected readonly value: Symbol) {
            super();
      }
      public override toString() {
            return `ret ${this.value.toString()}`
      }
}

export class Call extends Ir {
      constructor(protected readonly func: Symbol) {
            super();
      }
      public override toString() {
            return `call ${this.func.toString()}`
      }
}

export class Param extends Ir {
      constructor(protected readonly value: Symbol) {
            super();
      }
      public override toString() {
            return `param ${this.value.toString()}`
      }
}

export class BinOp extends Ir {
      constructor(protected readonly result: Symbol, protected readonly op1: Symbol, protected readonly op2: Symbol) {
            super();
      }
      public override toString() {
            return `op ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class Add extends BinOp {
      public override toString() {
            return `add ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class Sub extends BinOp {
      public override toString() {
            return `sub ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class Mul extends BinOp {
      public override toString() {
            return `mul ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class Div extends BinOp {
      public override toString() {
            return `div ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class FAdd extends BinOp {
      public override toString() {
            return `fadd ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class FSub extends BinOp {
      public override toString() {
            return `fsub ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class FMul extends BinOp {
      public override toString() {
            return `fmul ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class FDiv extends BinOp {
      public override toString() {
            return `fdiv ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
}
export class Func extends Ir {
      constructor(protected readonly name: TypedSymbol, protected readonly args: TypedSymbol[], protected readonly body: Ir[]) {
            super();
            for (let i = 0; i < body.length - 1; i++) {
                  body[i].addNext(body[i + 1]);
            }
      }
       public override toString() {
            return `fn ${this.name.toString()} ${this.args.map(arg => arg.toString()).join(',')}{\n${this.body.map(ir => ir.toString()).join('\n')}}`
      }
}
export class Branch extends Ir {
      constructor(protected readonly label: Label, protected readonly condition: Symbol) {
            super();
            this.addNext(label);
      }
      public override toString() {
            return `br ${this.condition.toString()}? ${this.label.toString()}`
      }
}
export class Jump extends Ir {
      constructor(protected readonly label: Label) {
            super();
      }
      public override toString() {
            return `j ${this.label.toString()}`
      }
}
export class Assign extends Ir {
      constructor(protected readonly assigned: Symbol, protected readonly value: Symbol) {
            super();
      }
      public override toString() {
            return `${this.assigned.toString()} = ${this.value.toString()}`
      }
}

export class Block extends Ir {
      constructor(protected readonly body: Ir[]) {
            super();
      }
}

export class Prelude extends Ir {
      public override toString() {
            return `main:`
      }
}