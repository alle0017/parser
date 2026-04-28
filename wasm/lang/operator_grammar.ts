import { Converter } from "../../src/ast/converter.ts";
import { BinOp, Ir, Symbol, Call, } from "../../src/ast/ir.ts";
import { SemanticAction } from "../../grammar/semantic_action.ts";
import { Tokens } from "../grammar_gen.ts";
import {
      keepChildrenOfTypes,
      getFirstChildOfType,
      asPToken
} from "../../src/parser/query.ts";
import { RToken, PToken } from "../../src/parser/index.d.ts";

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

export class OperatorGrammar extends SemanticAction {

      public override convert(traverser: Converter<Ir[]>): void {

            // -----------------------------
            // ENTRY: expression list
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.EXPRESSION_LIST, (self, token) => {
                  return self.convertAll(
                        keepChildrenOfTypes(token, Tokens.EXPRESSION_LIST, Tokens.EXPR)
                  ).flat();
            });

            // -----------------------------
            // EXPRESSIONS (top level)
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.EXPR, (self, token) => {
                  return self.convert(token.$[0]);
            });

            // -----------------------------
            // PRIMARY (numbers / identifiers)
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.PRIMARY, (self, token) => {
                  const first = token.$[0];

                  // NUMBER
                  if (first.type === Tokens.NUM) {
                        const r = Symbol.new();
                        const v = first.$ as string;

                        self.setContext("expr_reg", r);

                        return [
                              // treat as load-constant into register
                              new Assign(r, Symbol.from(v))
                        ];
                  }

                  // IDENTIFIER
                  if (first.type === Tokens.ID) {
                        const r = Symbol.from(first.$ as string);
                        self.setContext("expr_reg", r);
                        return [];
                  }

                  return self.convert(first);
            });

            // -----------------------------
            // BINARY OPERATION CORE
            // -----------------------------
            const handleBinary = (self: Converter<Ir[]>, token: RToken): Ir[] => {

                  const left = self.convert(token.$[0]);
                  const leftReg = self.getContext<Symbol>("expr_reg");

                  const right = self.convert(token.$[2]);
                  const rightReg = self.getContext<Symbol>("expr_reg");

                  const res = Symbol.new();

                  self.setContext("expr_reg", res);

                  return [
                        ...left,
                        ...right,
                        new BinOp(res, leftReg, rightReg)
                  ];
            };

            // -----------------------------
            // MUL / DIV / MOD
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.MUL_EXPR, (self: Converter<Ir[]>, token: RToken) => {
                  if (token.$.length === 1) {
                        return self.convert(token.$[0]);
                  }

                  return handleBinary(self, token);
            });

            // -----------------------------
            // ADD / SUB
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.ADD_EXPR, (self: Converter<Ir[]>, token: RToken) => {
                  if (token.$.length === 1) {
                        return self.convert(token.$[0]);
                  }

                  return handleBinary(self, token);
            });

            // -----------------------------
            // COMPARISONS
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.CMP_EXPR, (self: Converter<Ir[]>, token: RToken) => {
                  if (token.$.length === 1) {
                        return self.convert(token.$[0]);
                  }

                  return handleBinary(self, token);
            });

            // -----------------------------
            // EQUALITY
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.EQ_EXPR, (self: Converter<Ir[]>, token: RToken) => {
                  if (token.$.length === 1) {
                        return self.convert(token.$[0]);
                  }

                  return handleBinary(self, token);
            });

            // -----------------------------
            // FUNCTION CALL
            // -----------------------------
            traverser.addRecursiveConversion(Tokens.FUNCTION_CALL, (self: Converter<Ir[]>, token: RToken) => {

                  const name = asPToken(getFirstChildOfType(token, Tokens.ID).get()).$;
                  const args: Symbol[] = [];

                  const argNodes = token.$.filter(t => t.type === Tokens.EXPR);

                  const code: Ir[] = [];

                  for (const arg of argNodes) {
                        code.push(...self.convert(arg));
                        args.push(self.getContext<Symbol>("expr_reg"));
                  }

                  const res = Symbol.new();
                  self.setContext("expr_reg", res);

                  code.push(new Call(res, Symbol.from(name), args));

                  return code;
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
            traverser.addRecursiveConversion(Tokens.STRUCT_LITERAL, (self, token: RToken) => {
                  return [];
            });
      }
}