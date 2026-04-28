
import { Converter } from "../src/ast/converter.ts";
import { Ir, } from "../src/ast/ir.ts";
import { Grammar, GrammarApplication } from "../src/grammar.ts";
import type { PRule, RRule } from "../src/parser/index.d.ts";
export enum Tokens {
      TYPE_REF = "TYPE_REF",
FIELD = "FIELD",
FIELD_LIST = "FIELD_LIST",
STRUCT_DEF = "STRUCT_DEF",
ARG = "ARG",
ARG_LIST = "ARG_LIST",
FUNCTION = "FUNCTION",
VECTOR_LITERAL = "VECTOR_LITERAL",
EXPR_LIST = "EXPR_LIST",
FIELD_VALUE = "FIELD_VALUE",
FIELD_VALUE_LIST = "FIELD_VALUE_LIST",
STRUCT_LITERAL = "STRUCT_LITERAL",
FUNCTION_CALL = "FUNCTION_CALL",
PRIMARY = "PRIMARY",
ACCESS = "ACCESS",
UNARY = "UNARY",
MUL_EXPR = "MUL_EXPR",
ADD_EXPR = "ADD_EXPR",
CMP_EXPR = "CMP_EXPR",
EQ_EXPR = "EQ_EXPR",
AND_EXPR = "AND_EXPR",
OR_EXPR = "OR_EXPR",
EXPR = "EXPR",
CONST_DECL = "CONST_DECL",
IF_EXPR = "IF_EXPR",
WHILE_EXPR = "WHILE_EXPR",
STATEMENT = "STATEMENT",
STATEMENT_LIST = "STATEMENT_LIST",
CODE_BLOCK = "CODE_BLOCK",
EXPRESSION = "EXPRESSION",
EXPRESSION_LIST = "EXPRESSION_LIST",
NUM = "NUM",
STRING = "STRING",
TYPE = "TYPE",
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
            return [{"type":"","regex":"[ \\t\\n\\r]+"},{"type":"NUM","regex":"[0-9]+(\\.[0-9]+)?"},{"type":"STRING","regex":"\"[^\"]*\""},{"type":"TYPE","regex":"i32|f32|string|i8|i16|u8|u16|u32|u64|f64|i64"},{"type":"FN","regex":"fn"},{"type":"STRUCT","regex":"struct"},{"type":"CONST","regex":"const"},{"type":"RETURN","regex":"return"},{"type":"IF","regex":"if"},{"type":"ELSE","regex":"else"},{"type":"WHILE","regex":"while"},{"type":"AND","regex":"&&"},{"type":"OR","regex":"||"},{"type":"NOT","regex":"!"},{"type":"GT","regex":">"},{"type":"LT","regex":"<"},{"type":"GE","regex":">="},{"type":"LE","regex":"<="},{"type":"EQ","regex":"=="},{"type":"PLUS","regex":"\\+"},{"type":"MINUS","regex":"-"},{"type":"MUL","regex":"\\*"},{"type":"DIV","regex":"\\/"},{"type":"MOD","regex":"%"},{"type":"ASSIGN","regex":"="},{"type":"ID","regex":"[a-zA-Z][a-zA-Z0-9_]*"},{"type":"LEFT_BRACKET","regex":"{"},{"type":"RIGHT_BRACKET","regex":"}"},{"type":"LEFT_PAR","regex":"\\("},{"type":"RIGHT_PAR","regex":"\\)"},{"type":"LEFT_SQUARE","regex":"\\["},{"type":"RIGHT_SQUARE","regex":"\\]"},{"type":"COLUMN","regex":":"},{"type":"SEMI_COLUMN","regex":";"},{"type":"COMMA","regex":","},{"type":"DOT","regex":"\\."}]
      }
      public override getReductionRules(): RRule[] {
            return [{"rule":["TYPE"],"reduction":"TYPE_REF"},{"rule":["ID"],"reduction":"TYPE_REF"},{"rule":["ID","COLUMN","TYPE_REF"],"reduction":"FIELD"},{"rule":["FIELD"],"reduction":"FIELD_LIST"},{"rule":["FIELD_LIST","COMMA","FIELD"],"reduction":"FIELD_LIST"},{"rule":["STRUCT","ID","LEFT_BRACKET","FIELD_LIST","RIGHT_BRACKET"],"reduction":"STRUCT_DEF"},{"rule":["ID","COLUMN","TYPE_REF"],"reduction":"ARG"},{"rule":["ARG"],"reduction":"ARG_LIST"},{"rule":["ARG_LIST","COMMA","ARG"],"reduction":"ARG_LIST"},{"rule":["FN","ID","LEFT_PAR","ARG_LIST","RIGHT_PAR","COLUMN","TYPE_REF","CODE_BLOCK"],"reduction":"FUNCTION"},{"rule":["FN","ID","LEFT_PAR","RIGHT_PAR","COLUMN","TYPE_REF","CODE_BLOCK"],"reduction":"FUNCTION"},{"rule":["LEFT_SQUARE","RIGHT_SQUARE"],"reduction":"VECTOR_LITERAL"},{"rule":["LEFT_SQUARE","EXPR_LIST","RIGHT_SQUARE"],"reduction":"VECTOR_LITERAL"},{"rule":["EXPR"],"reduction":"EXPR_LIST"},{"rule":["EXPR_LIST","COMMA","EXPR"],"reduction":"EXPR_LIST"},{"rule":["ID","COLUMN","EXPR"],"reduction":"FIELD_VALUE"},{"rule":["FIELD_VALUE"],"reduction":"FIELD_VALUE_LIST"},{"rule":["FIELD_VALUE_LIST","COMMA","FIELD_VALUE"],"reduction":"FIELD_VALUE_LIST"},{"rule":["ID","LEFT_BRACKET","FIELD_VALUE_LIST","RIGHT_BRACKET"],"reduction":"STRUCT_LITERAL"},{"rule":["ID","LEFT_PAR","RIGHT_PAR"],"reduction":"FUNCTION_CALL"},{"rule":["ID","LEFT_PAR","EXPR_LIST","RIGHT_PAR"],"reduction":"FUNCTION_CALL"},{"rule":["NUM"],"reduction":"PRIMARY"},{"rule":["STRING"],"reduction":"PRIMARY"},{"rule":["ID"],"reduction":"PRIMARY"},{"rule":["FUNCTION_CALL"],"reduction":"PRIMARY"},{"rule":["STRUCT_LITERAL"],"reduction":"PRIMARY"},{"rule":["VECTOR_LITERAL"],"reduction":"PRIMARY"},{"rule":["LEFT_PAR","EXPR","RIGHT_PAR"],"reduction":"PRIMARY"},{"rule":["PRIMARY"],"reduction":"ACCESS"},{"rule":["ACCESS","DOT","ID"],"reduction":"ACCESS"},{"rule":["ACCESS","LEFT_SQUARE","EXPR","RIGHT_SQUARE"],"reduction":"ACCESS"},{"rule":["ACCESS"],"reduction":"UNARY"},{"rule":["NOT","UNARY"],"reduction":"UNARY"},{"rule":["MINUS","UNARY"],"reduction":"UNARY"},{"rule":["UNARY"],"reduction":"MUL_EXPR"},{"rule":["MUL_EXPR","MUL","UNARY"],"reduction":"MUL_EXPR"},{"rule":["MUL_EXPR","DIV","UNARY"],"reduction":"MUL_EXPR"},{"rule":["MUL_EXPR","MOD","UNARY"],"reduction":"MUL_EXPR"},{"rule":["MUL_EXPR"],"reduction":"ADD_EXPR"},{"rule":["ADD_EXPR","PLUS","MUL_EXPR"],"reduction":"ADD_EXPR"},{"rule":["ADD_EXPR","MINUS","MUL_EXPR"],"reduction":"ADD_EXPR"},{"rule":["ADD_EXPR"],"reduction":"CMP_EXPR"},{"rule":["CMP_EXPR","GT","ADD_EXPR"],"reduction":"CMP_EXPR"},{"rule":["CMP_EXPR","LT","ADD_EXPR"],"reduction":"CMP_EXPR"},{"rule":["CMP_EXPR","GE","ADD_EXPR"],"reduction":"CMP_EXPR"},{"rule":["CMP_EXPR","LE","ADD_EXPR"],"reduction":"CMP_EXPR"},{"rule":["CMP_EXPR"],"reduction":"EQ_EXPR"},{"rule":["EQ_EXPR","EQ","CMP_EXPR"],"reduction":"EQ_EXPR"},{"rule":["EQ_EXPR"],"reduction":"AND_EXPR"},{"rule":["AND_EXPR","AND","EQ_EXPR"],"reduction":"AND_EXPR"},{"rule":["AND_EXPR"],"reduction":"OR_EXPR"},{"rule":["OR_EXPR","OR","AND_EXPR"],"reduction":"OR_EXPR"},{"rule":["OR_EXPR"],"reduction":"EXPR"},{"rule":["CONST","ID","COLUMN","TYPE_REF","ASSIGN","EXPR"],"reduction":"CONST_DECL"},{"rule":["IF","LEFT_PAR","EXPR","RIGHT_PAR","CODE_BLOCK"],"reduction":"IF_EXPR"},{"rule":["IF","LEFT_PAR","EXPR","RIGHT_PAR","CODE_BLOCK","ELSE","CODE_BLOCK"],"reduction":"IF_EXPR"},{"rule":["WHILE","LEFT_PAR","EXPR","RIGHT_PAR","CODE_BLOCK"],"reduction":"WHILE_EXPR"},{"rule":["CONST_DECL"],"reduction":"STATEMENT"},{"rule":["FUNCTION_CALL"],"reduction":"STATEMENT"},{"rule":["IF_EXPR"],"reduction":"STATEMENT"},{"rule":["WHILE_EXPR"],"reduction":"STATEMENT"},{"rule":["EXPR"],"reduction":"STATEMENT"},{"rule":["STATEMENT"],"reduction":"STATEMENT_LIST"},{"rule":["STATEMENT_LIST","SEMI_COLUMN","STATEMENT"],"reduction":"STATEMENT_LIST"},{"rule":["LEFT_BRACKET","STATEMENT_LIST","RIGHT_BRACKET"],"reduction":"CODE_BLOCK"},{"rule":["FUNCTION"],"reduction":"EXPRESSION"},{"rule":["STRUCT_DEF"],"reduction":"EXPRESSION"},{"rule":["STATEMENT_LIST"],"reduction":"EXPRESSION"},{"rule":["EXPRESSION"],"reduction":"EXPRESSION_LIST"},{"rule":["EXPRESSION_LIST","EXPRESSION"],"reduction":"EXPRESSION_LIST"}]
      }
      public override convert(traverser: Converter<Ir[]>): void {}     
}
export function useSyntax() {
      const app = new GrammarApplication("EXPRESSION_LIST");
      app.addGrammar(Syntax)
      return app;
}
      