import { Tokenizer } from "../src/parser/tokenizer.ts";
import { Reducer } from "../src/parser/reducer.ts";
import { PRule, RRule } from "../src/parser/index.d.ts";
import { TokenNotRecognizedError } from "../src/exceptions/index.ts";
import { Traverse } from "../src/ast/traverse.ts";
import { Instruction } from "../src/ast/instruction.ts";

const GRAMMAR: PRule[] = [
      { regex: 'type', type: 'T_KEY' },
      { regex: '[a-zA-Z][a-zA-Z0-9_]*', type: 'ID' },
      { regex: '{', type: 'L_BRACKET' },
      { regex: '}', type: 'R_BRACKET' },
      { regex: ':', type: 'COLUMN' },
      { regex: ',', type: 'COMMA' },
      { regex: ' ' }
];

const REDUCTION: RRule[] =  [
      { reduction: 'ATTR', rule: ['ID', 'COLUMN', 'ID'] },
      { reduction: 'ATTR_L', rule: ['ATTR'] },
      { reduction: 'ATTR_L', rule: ['ATTR_L', 'COMMA', 'ATTR'] },
      { reduction: 'STRUCT', rule: ['T_KEY', 'ID', 'L_BRACKET', 'ATTR_L', 'R_BRACKET'] },
]

const tokens = new Tokenizer('type Struct { id: int, value: string }').execute('INIT', { INIT: GRAMMAR }).getTranslation();
const ast = new Reducer('STRUCT', REDUCTION, GRAMMAR).reduce(tokens);
const converter = new Traverse()
.addConversion('ATTR_L', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      self.convert(token.$[0]);
      if (token.$.length == 3) {
            self.convert(token.$[2]);
      }
})
.addConversion('ATTR', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      const name = token.$[0].$ as string;
      const type = token.$[2].$ as string;

      self.program.addInstruction(new AllocInstr(name, type))
})
.addConversion('STRUCT', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      self.convert(token.$[3]);
      self.program.addInstruction(new AllocInstr('%%canary', 'long'))
})

class AllocInstr extends Instruction {
      constructor(private readonly name: string, private readonly type: string) {
            super();
      }
      public override toString(): string {
        return `@@alloc ${this.type}(${this.name})`;
      }
      public override getUsedVariables(): string[] {
            return [this.name];
      }
      public override getAssignedVariables(): string[] {
            return [this.name];
      }
}

converter.convertAll(ast)

console.log(converter.program.toString());