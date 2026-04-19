import { Converter } from "../../src/ast/converter.ts";
import { Assign, BinOp, Ir, Symbol } from "../../src/ast/ir.ts";
import { SemanticAction } from "../../grammar/semantic_action.ts";
import { Tokens } from "../grammar_gen.ts";

export class OperatorGrammar extends SemanticAction {
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.OPERATION_EXPR_LIST, (self, token) => {
                  const res = self.convert(token.$[0]);
                  if (token.$.length == 3) {
                        res.push(...self.convert(token.$[2]));
                  }
                  return res;
            })
            .addRecursiveConversion(Tokens.OPERATION_EXPR, (self, token) => {
                  const name = token.$[0].$ as string;
                  return [
                        ...self.convert(token.$[2]), 
                        new Assign(Symbol.from(name), self.getContext<Symbol>('op_reg'))
                  ];
            })
            .addRecursiveConversion(Tokens.OPERATION, (self, token) => {
                  if (token.$[0].type == Tokens.OPERATION) {
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