import { GrammarApplication } from "../src/grammar.ts";
import { Tokens } from './lang/tokens.ts';
import { BaseGrammar } from './lang/base_grammar.ts';
import { FunctionGrammar } from "./lang/function_grammar.ts";
import { CodeblockGrammar } from "./lang/codeblock_grammar.ts";
import { OperatorGrammar } from "./lang/operator_grammar.ts";

const app = new GrammarApplication(Tokens.ExpressionList)
.addGrammar(new CodeblockGrammar())
.addGrammar(new FunctionGrammar())
.addGrammar(new OperatorGrammar())
.addGrammar(new BaseGrammar());

app.execute('fn main(arg1: i8, arg2: i16): i32 { x = arg1 + arg2; y = 6 + x }')
console.log(app.program.toString())