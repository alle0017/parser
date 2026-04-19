import { BaseGrammar } from './lang/base_grammar.ts';
import { FunctionGrammar } from "./lang/function_grammar.ts";
import { OperatorGrammar } from "./lang/operator_grammar.ts";
import { BBMermaid } from "../src/view/bb_mermaid.ts";
import { Ir, } from "../src/ast/ir.ts";
import { DataflowAnalyzer } from "../src/dataflow/dataflow_analyzer.ts";
import { DTOperator } from "../src/dataflow/dt_operator.ts";
import { BasicBlock } from "../src/ast/basic_block.ts";
import { useSyntax, } from './grammar_gen.ts';

const app = useSyntax().addGrammar(FunctionGrammar).addGrammar(OperatorGrammar).addGrammar(BaseGrammar);



const program = app.execute('fn main(arg1: i8, arg2: i16): i32 { x = arg1 + arg2; y = 6 + x }');

const bb = program.toBasicBlocks();
console.log(new BBMermaid().viewBasicBlocks(bb))

const {input, output} = new DataflowAnalyzer<Set<BasicBlock<Ir>>>(bb).forwardAnalysis(new DTOperator(bb), new Set([bb[0]]));

console.log('\n\n\nINPUT\n\n')

for (const [block, set] of input) {
      console.log(block.toBlockName(), [...set].map(s => s.toBlockName()).join());
}
console.log('\n\n\nOUTPUT\n\n')
for (const [block, set] of output) {
      console.log(block.toBlockName(), [...set].map(s => s.toBlockName()).join());
}