import { Converter } from "../src/ast/converter.ts";
import { Ir, } from "../src/ast/ir.ts";
import { Grammar, registerAll } from "../src/grammar.ts";
import type { PRule, RRule } from "../src/parser/index.d.ts";
import { hasChildOfType, keepChildrenOfTypes } from "../src/parser/query.ts";

enum Tokens {
      Opt = 'Opt', 
      Repeat = 'Repeat',
      Id = 'ID',
      Expression = 'expression',
      ExpressionList = 'expression_list',
      LeftPar = 'LeftPar',
      RightPar = 'RightPar',
}

abstract class ReductionIr extends Ir {
      abstract convert(): string[][];
}
class TokenOp extends ReductionIr {
      constructor(public readonly value: string) { 
            super() 
      }
      override convert(): string[][] {
            return [[this.value]]
      }
}
class OptOp extends ReductionIr {

      constructor(public readonly region: ReductionIr[]) { 
            super(); 
      }
      override convert(): string[][] {
            return [[], ...this.region.flatMap(expr => expr.convert())];
      }
}

class RepeatOp extends ReductionIr {

      constructor(public readonly region: ReductionIr[]) { 
            super(); 
      }
      override convert(): string[][] {
            return this.region.flatMap(expr => expr.convert());
      }
}

class DefinitionGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [
                  { regex: '\\?', type: Tokens.Opt },
                  { regex: '\\(', type: Tokens.LeftPar },
                  { regex: '\\)', type: Tokens.RightPar },
                  { regex: '\\+', type: Tokens.Repeat },
                  { regex: '[A-Z][A-Z0-9_]*', type: Tokens.Id},
                  { regex: '.' }
            ]
      }
      public override getReductionRules(): RRule[] {
            return [
                  { rule: [Tokens.Id], reduction: Tokens.Expression },
                  { rule: [Tokens.LeftPar, Tokens.ExpressionList, Tokens.RightPar], reduction: Tokens.Expression },
                  { rule: [Tokens.ExpressionList, Tokens.Opt], reduction: Tokens.Expression },
                  { rule: [Tokens.ExpressionList, Tokens.Repeat], reduction: Tokens.Expression },
                  { rule: [Tokens.ExpressionList, Tokens.Expression], reduction: Tokens.ExpressionList },
                  { rule: [Tokens.Expression], reduction: Tokens.ExpressionList },
            ]
      }
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addTerminalConversion(Tokens.Id, (_, token) => [new TokenOp(token.$)])
            .addRecursiveConversion(Tokens.ExpressionList, (self, token) => self.convertAll(token.$).flat())
            .addRecursiveConversion(Tokens.Expression, (self, token) => {
                  const expr = self.convertAll(keepChildrenOfTypes(token, Tokens.ExpressionList)).flat() as ReductionIr[];
                  if (hasChildOfType(token, Tokens.Opt)) {
                        return [new OptOp(expr)];
                  } else if (hasChildOfType(token, Tokens.Repeat)) {
                        return [new RepeatOp(expr)];
                  }
                  return expr;
            });
      }
}



export function generateReduction(reduction: string) {
      const program = registerAll(Tokens.ExpressionList, [DefinitionGrammar]).execute(reduction)
      return (program.toIr() as ReductionIr[]).flatMap(token => token.convert())
}

console.log(generateReduction('FN ID LEFT_PAR FIELD_LIST? RIGHT_PAR COLUMN ID CODE_BLOCK'))