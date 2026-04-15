import { Grammar } from "../../src/grammar.ts";
import type { PRule, RRule, } from "../../src/parser/index.d.ts";
import { Tokens } from "./tokens.ts";
import { Converter } from "../../src/ast/converter.ts";
import { Func, Ir, Ret, Symbol, TypedSymbol } from "../../src/ast/ir.ts";

export class FunctionGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [
                  { regex: 'fn', type: Tokens.FunctionKeyword },
            ];
      }
      public override getReductionRules(): RRule[] {
            return [
                  { reduction: Tokens.Arg, rule: [Tokens.Id, Tokens.Column, Tokens.Type] },
                  { reduction: Tokens.ArgList, rule: [Tokens.Arg] },
                  { reduction: Tokens.ArgList, rule: [Tokens.ArgList, Tokens.Comma, Tokens.Arg] },
                  { reduction: Tokens.Function, rule: [Tokens.FunctionKeyword, Tokens.Id, Tokens.LeftParenthesis, Tokens.ArgList, Tokens.RightParenthesis, Tokens.Column, Tokens.Type, Tokens.CodeBlock] },
                  { reduction: Tokens.Function, rule: [Tokens.FunctionKeyword, Tokens.Id, Tokens.LeftParenthesis, Tokens.RightParenthesis, Tokens.Column, Tokens.Type, Tokens.CodeBlock] },
                  { reduction: Tokens.Expression, rule: [Tokens.Function] }
            ];
      }
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.Arg, (self, token) => [new TypedSymbol(token.$[0].$ as string, token.$[2].$ as string)])
            .addRecursiveConversion(Tokens.ArgList, (self, token) => {
                  const res = self.convert(token.$[0]);
                  if (token.$.length == 3) {
                        res.push(...self.convert(token.$[2]));
                  }
                  return res;
            })
            .addRecursiveConversion(Tokens.Function, (self, token) => {
                  const name = token.$[1].$ as string;
                  const type = token.$.at(-2)?.$ as string;
                  const args: TypedSymbol[] = [];

                  if (token.$.length == 8) {
                        args.push(...self.convert(token.$[3]) as TypedSymbol[]);
                  }
                  return [new Func(new TypedSymbol(name,type), args, self.convert(token.$.at(-1)!))];
            })
      }
}