import { Instruction, FlowInstruction } from "../src/ast/instruction.ts";
import { Traverse } from "../src/ast/traverse.ts";
import { Grammar, GrammarApplication } from "../src/grammar.ts";
import type { PRule, RRule } from "../src/parser/index.d.ts";
import { toMermaidDiagram } from '../src/ast/program.ts';

class AllocInstr extends Instruction {
      constructor(private readonly name: string, private readonly type: string) {
            super();
      }
      public override toString(): string {
        return `ADD STACK_PTR, STACK_PTR, sizeof(${this.type}) @${this.name}`;
      }
      public override getUsedVariables(): string[] {
            return [this.name];
      }
      public override getAssignedVariables(): string[] {
            return [this.name];
      }
}
class BranchInstr extends Instruction {
      public constructor(private readonly branch: Instruction, private readonly op: string, private readonly op1: string, private readonly op2: string) {
            super();
            this.addSuccessor(branch);
      }
      private getAsmOp(): string {
            switch (this.op) {
                  case '==': return 'BEQ';
                  case '>=': return 'BGE'
                  case '<=': return 'BLE'
                  case '!=': return 'BNE'
                  case '>': return 'BGT'
                  case '<': return 'BLT'
                  default: return 'JMP'
            }
      }
      public override toString() {
            
            return `${this.getAsmOp()} ${this.op1}, ${this.op2}, ${this.branch.toString()}`
      }
      public override getAssignedVariables(): string[] {
            return [];
      }
      public override getUsedVariables(): string[] {
            return [this.op1, this.op2];
      }
}
class AssignInstr extends Instruction {

      public constructor(private readonly recipient: string, private readonly giver: string) {
            super();
      }
      public override toString() {
            return `STORE ${this.recipient}, ${this.giver}`
      }
      public override getAssignedVariables(): string[] {
            return [this.recipient];
      }
      public override getUsedVariables(): string[] {
            return [this.giver];
      }
}
class JumpInstr extends FlowInstruction {
      public constructor(private readonly addr: Instruction) {
            super();
            super.addSuccessor(addr);
      }
      public override addSuccessor(instruction: Instruction): this {
            return this;
      }
      public override toString() {
            return `JMP ${this.addr}`;
      }
}
class LabelInstr extends FlowInstruction {
      private static id = 0;

      private readonly label = `$LABEL${LabelInstr.id++}`
      public override toString() {
            return this.label;
      }
}
class StructGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return  [
                  { regex: 'type', type: 'T_KEY' },
            ];
      }
      public override getReductionRules(): RRule[] {
            return [
                  { reduction: 'ATTR', rule: ['ID', 'COLUMN', 'ID'] },
                  { reduction: 'ATTR_L', rule: ['ATTR'] },
                  { reduction: 'ATTR_L', rule: ['ATTR_L', 'COMMA', 'ATTR'] },
                  { reduction: 'STRUCT', rule: ['T_KEY', 'ID', 'L_BRACKET', 'ATTR_L', 'R_BRACKET'] },
            ];
      }
      public override getGrammarState(): string {
            return '-';
      }
      public override convert(traverser: Traverse): void {
            traverser
            .addRecursiveConversion('ATTR_L', (self, token) => {
                  self.convert(token.$[0]);
                  if (token.$.length == 3) {
                        self.convert(token.$[2]);
                  }
            })
            .addRecursiveConversion('ATTR', (self, token) => {
                  const name = token.$[0].$ as string;
                  const type = token.$[2].$ as string;
            
                  self.program.addInstruction(new AllocInstr(name, type))
            })
            .addRecursiveConversion('STRUCT', (self, token) => {
                  self.convert(token.$[3]);
                  self.program.addInstruction(new AllocInstr('%%canary', 'long'))
            });
      }
}

class ConditionGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [
                  { regex: 'if', type: 'IF_KEY' },
                  { regex: 'else', type: 'ELSE_KEY' },
            ];
      }
      public override getGrammarState(): string {
            return '-'
      }
      public override getReductionRules(): RRule[] {
            return [
                  { reduction: 'EXPR', rule: ['ID', 'ASSIGN', 'ID'] },
                  { reduction: 'EXPR', rule: ['ID', 'ASSIGN', 'NUM'] },
                  { reduction: 'EXPR_L', rule: ['EXPR'] },
                  { reduction: 'EXPR_L', rule: ['EXPR_L', 'COMMA', 'EXPR'] },
                  { reduction: 'BLOCK', rule: ['L_BRACKET', 'EXPR_L', 'R_BRACKET'] },
                  { reduction: 'CODE', rule: ['IF_KEY', 'CONDITION', 'BLOCK', 'ELSE_KEY', 'BLOCK'] },
                  { reduction: 'CODE', rule: ['IF_KEY', 'CONDITION', 'BLOCK'] },    
                  { reduction: 'CONDITION', rule: ['ID', 'EQ', 'ID'] },
            ]
      }
      public override convert(traverser: Traverse): void {
            traverser
            .addRecursiveConversion('CONDITION', (self, token) => {
                  const label = self.getContext<LabelInstr>('label');
                  const op = token.$[1].$ as string;
                  const var1 = token.$[0].$ as string;
                  const var2 = token.$[2].$ as string;
            
                  const br = new BranchInstr(label, op, var1, var2);
                  self.program.addInstruction(br);
            })
            .addRecursiveConversion('CODE', (self, token) => {
                  const label = new LabelInstr();
            
                  self.setContext('label', label);
                  self.convert(token.$[1])
                  self.convert(token.$[2])
                  
                  const jmpLabel = new LabelInstr();
                  
                  if (token.$.length == 5) {
                        const jmp = new JumpInstr(jmpLabel);
                        self.program.addInstruction(jmp);
                  }
                  
                  self.program.addInstruction(label);
            
                  if (token.$.length == 5) {
                        self.convert(token.$[4]);
                        self.program.addInstruction(jmpLabel);
                  }
            })
            .addRecursiveConversion('BLOCK', (self, token) => self.convert(token.$[1]))
            .addRecursiveConversion('EXPR_L', (self, token) => {
                  if (token.$.length == 1) {
                        return self.convert(token.$[0]);
                  }
                  self.convert(token.$[0]);
                  self.convert(token.$[2]);
            })
            .addRecursiveConversion('EXPR', (self, token) => {
                  const recipient = token.$[0].$ as string;
                  const giver = token.$[2].$ as string;
                  const live = self.getContext<Set<string>>('vars');
            
                  if (!live.has(giver) && token.$[2].type != 'NUM') {
                        throw new Error('unrecognized variable ' + giver);
                  }
            
                  live.add(recipient);
            
                  const assign = new AssignInstr(recipient, giver);
                  self.program.addInstruction(assign);
            })
            .setContext('vars', new Set<string>())
      }
}

class AggregatorGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [
                  { regex: '[0-9]+(\\.[0-9]+)?', type: 'NUM' },
                  { regex: '==', type: 'EQ' },
                  { regex: '=', type: 'ASSIGN' },
                  { regex: '[a-zA-Z][a-zA-Z0-9_]*', type: 'ID' },
                  { regex: '{', type: 'L_BRACKET' },
                  { regex: '}', type: 'R_BRACKET' },
                  { regex: ':', type: 'COLUMN' },
                  { regex: ',', type: 'COMMA' },
                  { regex: ' ' },
            ];
      }
      public override getGrammarState(): string {
            return '-';
      }
      public override getReductionRules(): RRule[] {
            return [
                  { reduction: 'GLOB', rule: ['GLOB', 'CODE'] },
                  { reduction: 'GLOB', rule: ['GLOB', 'STRUCT'] },
                  { reduction: 'GLOB', rule: ['STRUCT'] },
                  { reduction: 'GLOB', rule: ['CODE'] },
            ];
      }
      public override convert(traverser: Traverse): void {
            traverser
            .addRecursiveConversion('GLOB', (self, token) => {
                  self.convert(token.$[0]);

                  if (token.$.length == 2) {
                        self.convert(token.$[1]);
                  }
            })
      }
      
}

const grammar = new GrammarApplication('-', 'GLOB').addGrammar(new StructGrammar()).addGrammar(new ConditionGrammar()).addGrammar(new AggregatorGrammar());
grammar.execute('type Struct { id: int, value: string } if id == id1 { y1 = 9 } else { y1 = 51, x = y1 } type Canary_Only { id: int } if id == id1 { y1 = 9 } if id == id1 { y1 = 9 }')
console.log(toMermaidDiagram(grammar.program))