import { Traverse } from "../../src/ast/traverse.ts";
import { Grammar } from "../../src/grammar.ts";
import type { PRule, RRule, } from "../../src/parser/index.d.ts";
import { Tokens } from "./tokens.ts";
import { OpInst, AssignInst  } from '../tokens/op_instructions.ts';


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
      public override convert(traverser: Traverse): void {
            traverser
            .addRecursiveConversion(Tokens.OperationExprList, (self, token) => {
                  self.convert(token.$[0]);
                  if (token.$.length == 3) {
                        self.convert(token.$[2]);
                  }
            })
            .addRecursiveConversion(Tokens.OperationExpr, (self, token) => {
                  self.convert(token.$[2]);
                  const assignee = self.getContext<string>("op_reg");
                  self.program.addInstruction(new AssignInst(token.$[0].$ as string, assignee));
            })
            .addRecursiveConversion(Tokens.Operation, (self, token) => {
                  if (token.$[0].type == Tokens.Operation) {
                        self.convert(token.$[0]);
                        const reg = self.getContext<string>('op_reg');
                        const op = new OpInst(token.$[1].$ as string, reg, token.$[2].$ as string);
                        self.program.addInstruction(op);
                        self.setContext('op_reg', op.reg);
                  } else {
                        const op = new OpInst(token.$[1].$ as string, token.$[0].$ as string, token.$[2].$ as string);
                        self.program.addInstruction(op);
                        self.setContext('op_reg', op.reg);
                  }
            })
      }
}