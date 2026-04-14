import { Traverse } from "../../src/ast/traverse.ts";
import { Grammar } from "../../src/grammar.ts";
import type { PRule, RRule, } from "../../src/parser/index.d.ts";
import { Tokens } from "./tokens.ts";
import { FunctionInstr, Arg, RetInstr } from "../tokens/function_instruction.ts";


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
      public override convert(traverser: Traverse): void {
            traverser
            .addRecursiveConversion(Tokens.Arg, (self, token) => self.getContext<Arg[]>('args').push({ type: token.$[2].$ as string, name: token.$[0].$ as string}))
            .addRecursiveConversion(Tokens.ArgList, (self, token) => {
                  self.convert(token.$[0]);
                  if (token.$.length == 3) {
                        self.convert(token.$[2]);
                  }
            })
            .addRecursiveConversion(Tokens.Function, (self, token) => {
                  const name = token.$[1].$ as string;
                  const args: Arg[] = [];
                  if (token.$.length == 8) {
                        const ctx = self.saveContext();
                        self.setContext('args', args);
                        self.convert(token.$[3]);
                        self.restoreContext(ctx);
                  }
                  const fn = new FunctionInstr(name, args, token.$.at(-2)!.$ as string);

                  self.program.addInstruction(fn);
                  self.convert(token.$.at(-1)!);
                  self.program.addInstruction(new RetInstr());
            })
      }
}