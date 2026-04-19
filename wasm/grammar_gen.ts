
import { Converter } from "../src/ast/converter.ts";
import { Ir, } from "../src/ast/ir.ts";
import { Grammar, GrammarApplication } from "../src/grammar.ts";
import type { PRule, RRule } from "../src/parser/index.d.ts";
export enum Tokens {
      ARG = "ARG",
ARG_LIST = "ARG_LIST",
FUNCTION = "FUNCTION",
OPERATION = "OPERATION",
OPERATION_EXPR = "OPERATION_EXPR",
OPERATION_EXPR_LIST = "OPERATION_EXPR_LIST",
EXPRESSION = "EXPRESSION",
EXPRESSION_LIST = "EXPRESSION_LIST",
CODE_BLOCK = "CODE_BLOCK",
NUM = "NUM",
TYPE = "TYPE",
FN = "FN",
OPERATOR = "OPERATOR",
ASSIGN = "ASSIGN",
ID = "ID",
LEFT_BRACKET = "LEFT_BRACKET",
RIGHT_BRACKET = "RIGHT_BRACKET",
LEFT_PAR = "LEFT_PAR",
RIGHT_PAR = "RIGHT_PAR",
LEFT_SQUARE = "LEFT_SQUARE",
RIGHT_SQUARE = "RIGHT_SQUARE",
COLUMN = "COLUMN",
SEMI_COLUMN = "SEMI_COLUMN",
COMMA = "COMMA",
DOT = "DOT"
}
export class Syntax extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [{"type":"","regex":"[ \\t\\n\\r]+"},{"type":"NUM","regex":"[0-9]+(\\.[0-9]+)?"},{"type":"TYPE","regex":"i32|f32|string|i8|i16|u8|u16|u32|u64|f64|i64"},{"type":"FN","regex":"fn"},{"type":"OPERATOR","regex":"\\+|-|\\*|\\/|%"},{"type":"ASSIGN","regex":"="},{"type":"ID","regex":"[a-zA-Z][a-zA-Z0-9_]*"},{"type":"LEFT_BRACKET","regex":"{"},{"type":"RIGHT_BRACKET","regex":"}"},{"type":"LEFT_PAR","regex":"\\("},{"type":"RIGHT_PAR","regex":"\\)"},{"type":"LEFT_SQUARE","regex":"\\["},{"type":"RIGHT_SQUARE","regex":"\\]"},{"type":"COLUMN","regex":":"},{"type":"SEMI_COLUMN","regex":";"},{"type":"COMMA","regex":","},{"type":"DOT","regex":"\\."}]
      }
      public override getReductionRules(): RRule[] {
            return [{"rule":["ID","COLUMN","TYPE"],"reduction":"ARG"},{"rule":["ARG"],"reduction":"ARG_LIST"},{"rule":["ARG_LIST","COMMA","ARG"],"reduction":"ARG_LIST"},{"rule":["FN","ID","LEFT_PAR","ARG_LIST","RIGHT_PAR","COLUMN","TYPE","CODE_BLOCK"],"reduction":"FUNCTION"},{"rule":["FN","ID","LEFT_PAR","RIGHT_PAR","COLUMN","TYPE","CODE_BLOCK"],"reduction":"FUNCTION"},{"rule":["ID","OPERATOR","ID"],"reduction":"OPERATION"},{"rule":["NUM","OPERATOR","ID"],"reduction":"OPERATION"},{"rule":["NUM","OPERATOR","NUM"],"reduction":"OPERATION"},{"rule":["ID","OPERATOR","NUM"],"reduction":"OPERATION"},{"rule":["OPERATION","OPERATOR","ID"],"reduction":"OPERATION"},{"rule":["OPERATION","OPERATOR","NUM"],"reduction":"OPERATION"},{"rule":["ID","ASSIGN","OPERATION"],"reduction":"OPERATION_EXPR"},{"rule":["OPERATION_EXPR"],"reduction":"OPERATION_EXPR_LIST"},{"rule":["OPERATION_EXPR_LIST","SEMI_COLUMN","OPERATION_EXPR"],"reduction":"OPERATION_EXPR_LIST"},{"rule":["FUNCTION"],"reduction":"EXPRESSION"},{"rule":["OPERATION_EXPR_LIST"],"reduction":"EXPRESSION"},{"rule":["EXPRESSION"],"reduction":"EXPRESSION_LIST"},{"rule":["EXPRESSION_LIST","EXPRESSION"],"reduction":"EXPRESSION_LIST"},{"rule":["LEFT_BRACKET","EXPRESSION_LIST","RIGHT_BRACKET"],"reduction":"CODE_BLOCK"}]
      }
      public override convert(traverser: Converter<Ir[]>): void {}     
}
export function useSyntax() {
      const app = new GrammarApplication("EXPRESSION_LIST");
      app.addGrammar(Syntax)
      return app;
}
      