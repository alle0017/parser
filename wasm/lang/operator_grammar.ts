import { Converter } from "../../src/ast/converter.ts";
import { BinOp, Ir, Symbol, Call, Func, TypedSymbol, Label, Branch, } from "../../src/ast/ir.ts";
import { SemanticAction } from "../../grammar/semantic_action.ts";
import { Tokens } from "../grammar_gen.ts";
import {
      keepChildrenOfTypes,
      getFirstChildOfType,
      asPToken,
      getLastChildOfType,
      matches,
      getNthChildOfType
} from "../../src/parser/query.ts";
import { RToken, } from "../../src/parser/index.d.ts";
import { Jump } from "./tokens.ts";

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
class Ret extends Ir {
      constructor(public readonly value: Symbol) {
            super();
      }
      public override toString(): string {
            return `ret ${this.value.toString()}`;
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
            traverser.addRecursiveConversion(Tokens.STATEMENT_LIST, (self, token) => {
                  return self.convertAll(
                        keepChildrenOfTypes(token, Tokens.STATEMENT_LIST, Tokens.STATEMENT)
                  ).flat();
            });
            traverser.addRecursiveConversion(Tokens.STATEMENT, (self, token) => {
                  return self.convertAll(token.$).flat();
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
                        keepChildrenOfTypes(token, Tokens.STATEMENT_LIST, Tokens.STATEMENT)
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
            traverser.addRecursiveConversion(Tokens.COND_EXPR, (self, token) => {

                  const endLabel = new Label('end_if');
                  self.setContext('end_if', endLabel);
                  
                  return [
                        ...self.convert(getFirstChildOfType(token, Tokens.IF_EXPR).get()),
                        ...self.convert(getFirstChildOfType(token, Tokens.STATEMENT_LIST).get()),
                        endLabel
                  ];
            });
            traverser.addRecursiveConversion(Tokens.IF_EXPR, (self, token) => {

                  const condReg = Symbol.from(token.$[2].$ as string);

                  const elseLabel = new Label("else");

                  let endLabel = self.getContext<Label>("end_if");
                  const res: Ir[] = [];
                  
                  if (!endLabel) {
                        endLabel = new Label('end_if');
                        self.setContext('end_if', endLabel);
                        res.push(endLabel);
                  }

                  return getFirstChildOfType(token, Tokens.IF_EXPR)
                  .map(expr => self
                              .convert(expr)
                              .concat(
                                    self
                                    .convert(
                                          getLastChildOfType(token, Tokens.IF_EXPR)
                                          .get()
                                    )))
                  .orElseGet(() => [
                              new Branch(elseLabel, condReg),
                              ...self.convert(getFirstChildOfType(token, Tokens.STATEMENT_LIST).get()),
                              new Jump(endLabel),
                              elseLabel,
                        ]
                  ).concat(res);
            });
            traverser.addRecursiveConversion(Tokens.WHILE_EXPR, (self, token) => {

                  const start = new Label("loop");
                  const end = new Label("end_loop");

                  const code: Ir[] = [
                        start
                  ];

                  const condReg = Symbol.from(token.$[2].$ as string);

                  code.push(
                        new Branch(end, condReg), 
                        ...self.convert(getFirstChildOfType(token, Tokens.STATEMENT_LIST).get()), 
                        new Jump(start),
                        end
                  );

                  return code;
            });
            traverser.addRecursiveConversion(Tokens.RET_EXPR, (self, token) => {
                  const reg = Symbol.from(token.$[1].$ as string);

                  return [
                        new Ret(reg)
                  ];
            });
                        // -----------------------------
            // ASSIGNMENT (const model compatible)
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.CONST_DECL, (self, token) => {

                  const name = token.$[1].$ as string;
                  const reg = Symbol.from(token.$[3].$ as string);
                  self.setContext("expr_reg", reg);

                  return [
                        new Assign(Symbol.from(name), reg)
                  ];
            });
            traverser.addRecursiveConversion(Tokens.STRUCT_DEF, (self, token: RToken) => {
                  return [];
            });
      }
}