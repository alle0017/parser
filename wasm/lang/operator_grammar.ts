import { Converter } from "../../src/ast/converter.ts";
import { BinOp, Ir, Symbol, Call, Func, TypedSymbol, } from "../../src/ast/ir.ts";
import { SemanticAction } from "../../grammar/semantic_action.ts";
import { Tokens } from "../grammar_gen.ts";
import {
      keepChildrenOfTypes,
      getFirstChildOfType,
      asPToken,
      getLastChildOfType,
      matches
} from "../../src/parser/query.ts";
import { RToken, PToken } from "../../src/parser/index.d.ts";
import { match } from "node:assert";

export class Assign extends Ir {
      constructor(private readonly target: Symbol, private readonly value: Symbol) {
            super();
      }

      public override toString() {
            return `mov ${this.target.toString()}, ${this.value.toString()}`;
      }

      public override getUsedVariables(): Symbol[] {
            return [this.value];
      }

      public override getAssignedVariables(): Symbol[] {
            return [this.target];
      }
}
class Unreachable extends Ir {
      public override toString(): string {
            return 'unreachable';
      }
}
export class OperatorGrammar extends SemanticAction {

      public override convert(traverser: Converter<Ir[]>): void {

            // -----------------------------
            // ENTRY: expression list
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.EXPRESSION_LIST, (self, token) => {
                  return self.convertAll(
                        keepChildrenOfTypes(token, Tokens.EXPRESSION_LIST, Tokens.EXPRESSION)
                  ).flat();
            });

            // -----------------------------
            // ENTRY: expression list
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.FIELD_LIST, (self, token) => {
                  return self.convertAll(
                        keepChildrenOfTypes(token, Tokens.FIELD_LIST, Tokens.FIELD)
                  ).flat();
            });
            traverser.addRecursiveConversion(Tokens.FIELD, (self, token) => {
                  const name = getFirstChildOfType(token, Tokens.ID).get();
                  const type = getLastChildOfType(token, Tokens.ID).get();

                  return [new TypedSymbol(asPToken(name).$, asPToken(type).$)];
            });

            // -----------------------------
            // EXPRESSIONS (top level)
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.EXPRESSION, (self, token) => {
                  return self.convert(token.$[0]);
            });

            traverser.addRecursiveConversion(Tokens.CODE_BLOCK, (self, token) => {
                  return self.convertAll(
                        keepChildrenOfTypes(token, Tokens.EXPRESSION_LIST, Tokens.EXPRESSION)
                  ).flat();
            });

            traverser.addRecursiveConversion(Tokens.FUNCTION_DEF, (self, token) => {
                  const name = getFirstChildOfType(token, Tokens.ID).get();
                  const retType = getLastChildOfType(token, Tokens.ID).get();
                  const signature = new TypedSymbol(asPToken(name).$, asPToken(retType).$);
                  const args = getFirstChildOfType(token, Tokens.FIELD_LIST)
                              .map(token => self.convert(token) as TypedSymbol[])
                              .orElse([]);
                  return [
                        new Unreachable(),
                        new Func(signature, args),
                        ...self.convert(getFirstChildOfType(token, Tokens.CODE_BLOCK).get()),
                        new Unreachable(),
                  ]
            });
            // -----------------------------
            // ASSIGNMENT (const model compatible)
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.ASSIGN, (self, token) => {

                  const name = token.$[0].$ as string;

                  const exprCode = self.convert(token.$[2]);
                  const valueReg = self.getContext<Symbol>("expr_reg");

                  return [
                        ...exprCode,
                        new Assign(Symbol.from(name), valueReg)
                  ];
            });
            traverser.addRecursiveConversion(Tokens.STRUCT_DEF, (self, token: RToken) => {
                  return [];
            });
      }
}