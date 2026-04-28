
import { Converter } from "../src/ast/converter.ts";
import { Ir, } from "../src/ast/ir.ts";
import { Grammar, GrammarApplication } from "../src/grammar.ts";
import type { PRule, RRule } from "../src/parser/index.d.ts";
export enum Tokens {
      FIELD = "FIELD",
FIELD_LIST = "FIELD_LIST",
STRUCT_DEF = "STRUCT_DEF",
FUNCTION_DEF = "FUNCTION_DEF",
CODE_BLOCK = "CODE_BLOCK",
EXPRESSION = "EXPRESSION",
EXPRESSION_LIST = "EXPRESSION_LIST",
NUM = "NUM",
STRING = "STRING",
FN = "FN",
STRUCT = "STRUCT",
CONST = "CONST",
RETURN = "RETURN",
IF = "IF",
ELSE = "ELSE",
WHILE = "WHILE",
AND = "AND",
OR = "OR",
NOT = "NOT",
GT = "GT",
LT = "LT",
GE = "GE",
LE = "LE",
EQ = "EQ",
PLUS = "PLUS",
MINUS = "MINUS",
MUL = "MUL",
DIV = "DIV",
MOD = "MOD",
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
            return [{"type":"","regex":"[ \\t\\n\\r]+"},{"type":"NUM","regex":"[0-9]+(\\.[0-9]+)?"},{"type":"STRING","regex":"\"[^\"]*\""},{"type":"FN","regex":"fn"},{"type":"STRUCT","regex":"struct"},{"type":"CONST","regex":"const"},{"type":"RETURN","regex":"return"},{"type":"IF","regex":"if"},{"type":"ELSE","regex":"else"},{"type":"WHILE","regex":"while"},{"type":"AND","regex":"&&"},{"type":"OR","regex":"||"},{"type":"NOT","regex":"!"},{"type":"GT","regex":">"},{"type":"LT","regex":"<"},{"type":"GE","regex":">="},{"type":"LE","regex":"<="},{"type":"EQ","regex":"=="},{"type":"PLUS","regex":"\\+"},{"type":"MINUS","regex":"-"},{"type":"MUL","regex":"\\*"},{"type":"DIV","regex":"\\/"},{"type":"MOD","regex":"%"},{"type":"ASSIGN","regex":"="},{"type":"ID","regex":"[a-zA-Z][a-zA-Z0-9_]*"},{"type":"LEFT_BRACKET","regex":"{"},{"type":"RIGHT_BRACKET","regex":"}"},{"type":"LEFT_PAR","regex":"\\("},{"type":"RIGHT_PAR","regex":"\\)"},{"type":"LEFT_SQUARE","regex":"\\["},{"type":"RIGHT_SQUARE","regex":"\\]"},{"type":"COLUMN","regex":":"},{"type":"SEMI_COLUMN","regex":";"},{"type":"COMMA","regex":","},{"type":"DOT","regex":"\\."}]
      }
      public override getReductionRules(): RRule[] {
            return [{"rule":["ID","COLUMN","ID"],"reduction":"FIELD"},{"rule":["FIELD"],"reduction":"FIELD_LIST"},{"rule":["FIELD_LIST","COMMA","FIELD"],"reduction":"FIELD_LIST"},{"rule":["STRUCT","ID","LEFT_BRACKET","FIELD_LIST","RIGHT_BRACKET"],"reduction":"STRUCT_DEF"},{"rule":["FN","ID","LEFT_PAR","FIELD_LIST","RIGHT_PAR","COLUMN","ID","CODE_BLOCK"],"reduction":"FUNCTION_DEF"},{"rule":["FN","ID","LEFT_PAR","RIGHT_PAR","COLUMN","ID","CODE_BLOCK"],"reduction":"FUNCTION_DEF"},{"rule":["LEFT_BRACKET","EXPRESSION_LIST","RIGHT_BRACKET"],"reduction":"CODE_BLOCK"},{"rule":["FUNCTION_DEF"],"reduction":"EXPRESSION"},{"rule":["STRUCT_DEF"],"reduction":"EXPRESSION"},{"rule":["EXPRESSION_LIST","EXPRESSION"],"reduction":"EXPRESSION_LIST"},{"rule":["EXPRESSION"],"reduction":"EXPRESSION_LIST"}]
      }
      public override convert(traverser: Converter<Ir[]>): void {}     
}
export function useSyntax() {
      const app = new GrammarApplication("EXPRESSION_LIST");
      app.addGrammar(Syntax)
      return app;
}
      