import { Instruction } from "../src/ast/instruction.ts";
import { Traverse } from "../src/ast/traverse.ts";
import { Grammar, GrammarApplication } from "../src/grammar.ts";
import type { PRule, RRule } from "../src/parser/index.d.ts";

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

class StructGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return  [
                  { regex: 'type', type: 'T_KEY' },
                  { regex: '[a-zA-Z][a-zA-Z0-9_]*', type: 'ID' },
                  { regex: '{', type: 'L_BRACKET' },
                  { regex: '}', type: 'R_BRACKET' },
                  { regex: ':', type: 'COLUMN' },
                  { regex: ',', type: 'COMMA' },
                  { regex: ' ' },

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
            return 'INIT';
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

const grammar = new GrammarApplication('INIT', 'STRUCT').addGrammar(new StructGrammar());
grammar.execute('type Struct { id: int, value: string }')
console.log(grammar.program.toString())