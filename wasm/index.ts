import { OperatorGrammar } from "./lang/operator_grammar.ts";
import { MermaidBBConverter } from "../src/view/bb_mermaid.ts";
import { useSyntax, } from './grammar_gen.ts';
import { SSAConverter } from '../src/dataflow/ssa_conversion.ts';

const app = useSyntax().addGrammar(OperatorGrammar)

const program = app.execute(`
    fn make_pair(x: i32, y: i32): Pair {
      struct Pair { first: x, second: y }
    }
  `, true);
const bb = program.toBasicBlocks();
new SSAConverter(bb).toSSA()
console.log(new MermaidBBConverter().toString(bb))

