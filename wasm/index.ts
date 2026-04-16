import { GrammarApplication } from "../src/grammar.ts";
import { Tokens } from './lang/tokens.ts';
import { BaseGrammar } from './lang/base_grammar.ts';
import { FunctionGrammar } from "./lang/function_grammar.ts";
import { CodeblockGrammar } from "./lang/codeblock_grammar.ts";
import { OperatorGrammar } from "./lang/operator_grammar.ts";
import { BBMermaid } from "../src/view/bb_mermaid.ts";
import { Add, Branch, Div, FMul, Jump, Label, Symbol } from "../src/ast/ir.ts";

const app = new GrammarApplication(Tokens.ExpressionList)
.addGrammar(CodeblockGrammar)
.addGrammar(FunctionGrammar)
.addGrammar(OperatorGrammar)
.addGrammar(BaseGrammar);

const program = app.execute('fn main(arg1: i8, arg2: i16): i32 { x = arg1 + arg2; y = 6 + x }');


const label = new Label('label');
program.addInstruction(label)
program.addInstruction(new Add(Symbol.new(), Symbol.new(), Symbol.new()))
program.addInstruction(new FMul(Symbol.new(), Symbol.new(), Symbol.new()))
program.addInstruction(new Div(Symbol.new(), Symbol.new(), Symbol.new()))
program.addInstruction(new Add(Symbol.new(), Symbol.new(), Symbol.new()))
program.addInstruction(new Jump(label))
program.addInstruction(new FMul(Symbol.new(), Symbol.new(), Symbol.new()))
program.addInstruction(new Div(Symbol.new(), Symbol.new(), Symbol.new()))
program.addInstruction(new Branch(label, Symbol.from('bool')))

console.log(new BBMermaid().viewBasicBlocks(program.toBasicBlocks()))
console.log(new BBMermaid().viewIr(program.toIr()))