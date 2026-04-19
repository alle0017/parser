import { Converter } from "../../src/ast/converter.ts";
import { Assign, BinOp, Ir, Symbol } from "../../src/ast/ir.ts";
import { SemanticAction } from "../../grammar/semantic_action.ts";
import { Tokens } from "../grammar_gen.ts";
import { keepChildrenOfTypes, getFirstAsString, getFirstChildOfType } from "../../src/parser/query.ts";

export class OperatorGrammar extends SemanticAction {
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.OPERATION_EXPR_LIST, (self, token) => self.convertAll(keepChildrenOfTypes(token, Tokens.OPERATION_EXPR_LIST, Tokens.OPERATION_EXPR)).flat() )
            .addRecursiveConversion(Tokens.OPERATION_EXPR, (self, token) => {
                  const name = getFirstAsString(token, Tokens.ID).get()
                  return [
                        ...self.convert(getFirstChildOfType(token, Tokens.OPERATION).get()), 
                        new Assign(Symbol.from(name), self.getContext<Symbol>('op_reg'))
                  ];
            })
            .addRecursiveConversion(Tokens.OPERATION, (self, token) => {
                  if (token.$[0].type == Tokens.OPERATION) {
                        const prev = self.convert(getFirstChildOfType(token, Tokens.OPERATION).get());
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