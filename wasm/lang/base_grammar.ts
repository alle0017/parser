import { Traverse } from "../../src/ast/traverse.ts";
import { Grammar } from "../../src/grammar.ts";
import type { PRule, RRule } from "../../src/parser/index.d.ts";
import { Tokens } from "./tokens.ts";
export class BaseGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [
                  { regex: '[0-9]+(\\.[0-9]+)?', type: Tokens.Num },
                  { regex: 'i32|f32|string|i8|i16|u8|u16|u32|u64|f64|i64', type: Tokens.Type },
                  { regex: '[a-zA-Z][a-zA-Z0-9_]*', type: Tokens.Id },
                  { regex: '{', type: Tokens.LeftBracket },
                  { regex: '}', type: Tokens.RightBracket },
                  { regex: '\\(', type: Tokens.LeftParenthesis },
                  { regex: '\\)', type: Tokens.RightParenthesis },
                  { regex: '\\[', type: Tokens.LeftSquare },
                  { regex: '\\]', type: Tokens.RightSquare },
                  { regex: ':', type: Tokens.Column },
                  { regex: ';', type: Tokens.SemiColumn },
                  { regex: ',', type: Tokens.Comma },
                  { regex: '\\.', type: Tokens.Dot },
                  { regex: ' ' },
            ];
      }
      public override getReductionRules(): RRule[] {
            return [
                  { reduction: Tokens.ExpressionList, rule: [Tokens.ExpressionList, Tokens.Expression] },
                  { reduction: Tokens.ExpressionList, rule: [Tokens.Expression] }
            ];
      }
      public override convert(traverser: Traverse): void {
            traverser
            .addRecursiveConversion(Tokens.ExpressionList, (self, token) => {
                  self.convert(token.$[0]);

                  if (token.$.length == 2) {
                        self.convert(token.$[1]);
                  }
            })
            .addRecursiveConversion(Tokens.Expression, (self, token) => self.convertAll(token.$))
      }
}