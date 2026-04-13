import { Tokenizer } from "./src/parser/tokenizer.ts";
import { Reducer } from "./src/parser/reducer.ts";
import { Traverse } from "./src/ast/traverse.ts";
import { PRule, RRule } from "./src/parser/index.d.ts";
import { TokenNotRecognizedError } from "./src/exceptions/index.ts";
import { Instruction, FlowInstruction, } from "./src/ast/instruction.ts";


const GRAMMAR: PRule[] = [
      { regex: 'if', type: 'IF_KEY' },
      { regex: 'else', type: 'ELSE_KEY' },
      { regex: '[a-zA-Z][a-zA-Z0-9_]*', type: 'ID' },
      { regex: '[0-9]+(\\.[0-9]+)?', type: 'NUM' },
      { regex: '{', type: 'L_BRACKET' },
      { regex: '}', type: 'R_BRACKET' },
      { regex: '==', type: 'EQ' },
      { regex: '=', type: 'ASSIGN' },
      { regex: ',', type: 'COMMA' },
      { regex: ' ' }
];

const REDUCTION: RRule[] =  [
      { reduction: 'EXPR', rule: ['ID', 'ASSIGN', 'ID'] },
      { reduction: 'EXPR', rule: ['ID', 'ASSIGN', 'NUM'] },
      { reduction: 'EXPR_L', rule: ['EXPR'] },
      { reduction: 'EXPR_L', rule: ['EXPR_L', 'COMMA', 'EXPR'] },
      { reduction: 'BLOCK', rule: ['L_BRACKET', 'EXPR_L', 'R_BRACKET'] },
      { reduction: 'CODE', rule: ['IF_KEY', 'CONDITION', 'BLOCK', 'ELSE_KEY', 'BLOCK'] },
      { reduction: 'CODE', rule: ['IF_KEY', 'CONDITION', 'BLOCK'] },    
      { reduction: 'CONDITION', rule: ['ID', 'EQ', 'ID'] },
]

const tokens = new Tokenizer('if id == id1 { y1 = 9 } else { y1 = 51, x = y1 }').execute('INIT', { INIT: GRAMMAR }).getTranslation();
const ast = new Reducer('CODE', REDUCTION, GRAMMAR).reduce(tokens);

const converter = new Traverse()
.addConversion('CONDITION', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      const label = self.getContext<LabelInstr>('label');
      const op = token.$[1].$ as string;
      const var1 = token.$[0].$ as string;
      const var2 = token.$[2].$ as string;

      const br = new BranchInstr(label, op, var1, var2);
      self.program.addInstruction(br);
})
.addConversion('CODE', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
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
.addConversion('BLOCK', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      return self.convert(token.$[1]);
})
.addConversion('EXPR_L', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      if (token.$.length == 1) {
            return self.convert(token.$[0]);
      }
      self.convert(token.$[0]);
      self.convert(token.$[2]);
})
.addConversion('EXPR', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
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


class BranchInstr extends Instruction {
      public constructor(private readonly branch: Instruction, private readonly op: string, private readonly op1: string, private readonly op2: string) {
            super();
            this.addSuccessor(branch);
      }
      public override toString() {
            return `BRANCH(${this.op}) ${this.op1}, ${this.op2}, ${this.branch.toString()}`
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

converter.convertAll(ast)
console.log(converter.program.toBasicBlocks().map(bb => bb.toString()).join('\n\n'));
