import { Grammar } from "../../src/grammar.ts";
import type { PRule, RRule, } from "../../src/parser/index.d.ts";
import { Tokens } from "./tokens.ts";
import { Converter } from "../../src/ast/converter.ts";
import { Assign, BinOp, Ir, Symbol } from "../../src/ast/ir.ts";


export class OperatorGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [
                  { regex: '\\+|-|\\*|\\/|%', type: Tokens.Operator },
                  { regex: '=', type: Tokens.Assign},
            ];
      }
      public override getReductionRules(): RRule[] {
            return [
                  { reduction: Tokens.Operation, rule: [Tokens.Id, Tokens.Operator, Tokens.Id] },
                  { reduction: Tokens.Operation, rule: [Tokens.Num, Tokens.Operator, Tokens.Id] },
                  { reduction: Tokens.Operation, rule: [Tokens.Num, Tokens.Operator, Tokens.Num] },
                  { reduction: Tokens.Operation, rule: [Tokens.Id, Tokens.Operator, Tokens.Num] },
                  { reduction: Tokens.Operation, rule: [Tokens.Operation, Tokens.Operator, Tokens.Id] },
                  { reduction: Tokens.Operation, rule: [Tokens.Operation, Tokens.Operator, Tokens.Num] },
                  { reduction: Tokens.OperationExpr, rule: [Tokens.Id, Tokens.Assign, Tokens.Operation] },
                  { reduction: Tokens.OperationExprList, rule: [Tokens.OperationExpr] },
                  { reduction: Tokens.OperationExprList, rule: [Tokens.OperationExprList, Tokens.SemiColumn, Tokens.OperationExpr] },
                  { reduction: Tokens.Expression, rule: [Tokens.OperationExprList] },
            ];
      }
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.OperationExprList, (self, token) => {
                  const res = self.convert(token.$[0]);
                  if (token.$.length == 3) {
                        res.push(...self.convert(token.$[2]));
                  }
                  return res;
            })
            .addRecursiveConversion(Tokens.OperationExpr, (self, token) => {
                  const name = token.$[0].$ as string;
                  return [
                        ...self.convert(token.$[2]), 
                        new Assign(Symbol.from(name), self.getContext<Symbol>('op_reg'))
                  ];
            })
            .addRecursiveConversion(Tokens.Operation, (self, token) => {
                  if (token.$[0].type == Tokens.Operation) {
                        const prev = self.convert(token.$[0]);
                        const first = self.getContext<Symbol>('op_reg');
                        const res = Symbol.new();
                        const second = token.$[2].$ as string;
                        const op = new BinOp(res, first, Symbol.from(second));
                        self.setContext('op_reg', res);
                        return [...prev, op];
                  }
                  const first = token.$[0].$ as string;
                  const res = Symbol.new();
                  const second = token.$[2].$ as string;
                  const op = new BinOp(res, Symbol.from(first), Symbol.from(second));
                  self.setContext('op_reg', res);
                  return [op];
            })
      }
}