import type { View } from '../view/view.d.ts';
import { BasicBlock, } from './basic_block.ts';
export abstract class Ir implements View {
      private static ID = 0;
      public readonly index = ++Ir.ID;
      public readonly next: Set<Ir> = new Set();
      public readonly previous: Set<Ir> = new Set();
      protected readonly isJump: boolean = false;
      public addNext(ir: Ir) {
            this.next.add(ir);
            ir.addPredecessor(this);
      }
      private removeNext(ir: Ir) {
            this.next.delete(ir);
            ir.previous.delete(this);
      }
      public addBefore(ir: Ir) {
            for (const pp of this.previous) {
                  pp.removeNext(this);
                  pp.addNext(ir);
            }
            ir.addNext(this);
      }
      protected addPredecessor(ir: Ir) {
            this.previous.add(ir);
      }
      public isLeader() {
            if (this.previous.size > 1) {
                  return true;
            }
            for (const pp of this.previous) {
                  if (pp.isJump) {
                        return true;
                  }
            }
            return false;
      }
      public getUsedVariables(): Symbol[] {
            return [];
      }
      public replaceUse(symbol: Symbol, replace: Symbol) {
            // need to be override by class that need it
      }
      public replaceAssignment(symbol: Symbol, replace: Symbol) {
            // need to be override by class that need it
      }
      public getAssignedVariables(): Symbol[] {
            return [];
      }
      public toString() {
            return `ir`;
      }
}

export class Symbol extends Ir {
      private static UNIQUE = 0;
      private static readonly map: Map<string, Symbol> = new Map()
      public static new(prefix: string = 's') {
            let symbol = `${prefix}${++this.UNIQUE}`;
            while (this.map.has(symbol)) {
                  symbol = `${prefix}${++this.UNIQUE}`;
            }
            return this.from(symbol);
      }
      public static from(name: string) {
            return this.map.getOrInsertComputed(name, () => new Symbol(name));
      }
      private readonly users: Set<Ir> = new Set();
      private constructor(public readonly value: string) { super(); }

      public addUser(user: Ir) {
            this.users.add(user);
      }

      public getUsers(): Set<Ir> {
            return this.users;
      }

      public override toString() {
            return `%${this.value}`;
      }
}
export class TypedSymbol extends Ir {
      constructor(private readonly name: string, protected readonly type: string) {
            super();
      }
      public override toString() {
            return `%${this.name}: ${this.type}`
      }
}
export class Label extends Ir {
      constructor(private readonly value: string) { super(); }
      public override toString() {
            return `$${this.value}`;
      }
}
export class Call extends Ir {
      constructor(protected readonly result: Symbol, protected readonly func: Symbol, protected readonly args: Ir[]) {
            super();
      }
      public override toString() {
            return `${this.result} := call ${this.func.toString()} [${this.args.map(arg => arg.toString()).join(',')}]`
      }
}
export class BinOp extends Ir {
      constructor(protected result: Symbol, protected op1: Symbol, protected op2: Symbol) {
            super();
      }
      public override toString() {
            return `bin_op::Prototype ${this.result.toString()}, ${this.op1.toString()}, ${this.op2.toString()}`
      }
      public override replaceUse(symbol: Symbol, replace: Symbol): void {
            if (symbol == this.op1) {
                  this.op1 = replace;
            } else if (symbol == this.op2) {
                  this.op2 = replace;
            }
      }
      public override replaceAssignment(symbol: Symbol, replace: Symbol): void {
            if (this.result == symbol) {
                  this.result = replace;
            }
      }
      public override getUsedVariables(): Symbol[] {
            return [this.op1, this.op2];
      }
      public override getAssignedVariables(): Symbol[] {
            return [this.result];
      }
}
export class Func extends Ir {
      constructor(protected readonly name: TypedSymbol, protected readonly args: TypedSymbol[]) {
            super();
      }
      public override toString() {
            return `fn ${this.name.toString()} ${this.args.map(arg => arg.toString()).join(',')}:`
      }
}
export class Branch extends Ir {
      protected override isJump = true;
      constructor(protected readonly label: Label, protected condition: Symbol) {
            super();
            this.addNext(label);
      }
      public override toString() {
            return `br ${this.condition.toString()}? ${this.label.toString()}`
      }
      public override getUsedVariables(): Symbol[] {
            return [this.condition];
      }
      public override replaceUse(symbol: Symbol, replace: Symbol): void {
            if (this.condition == symbol) {
                  this.condition = replace;
            }
      }
}
export class Phi extends Ir {
      private readonly definitions: Map<BasicBlock<Ir>, Symbol> = new Map();
      constructor(public variable: Symbol) {
            super();
      }

      public addValue(definition: BasicBlock<Ir>, symbol: Symbol) {
            this.definitions.set(definition, symbol);
      }
      public override toString(): string {
            return `phi (${this.variable}) [${this.definitions.entries().map(([k,v]) => `${k.toBlockName()} ${v.toString()}`).toArray().join()}]`
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