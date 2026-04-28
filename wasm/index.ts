import { OperatorGrammar } from "./lang/operator_grammar.ts";
import { MermaidBBConverter } from "../src/view/bb_mermaid.ts";
import { useSyntax, } from './grammar_gen.ts';
import { SSAConverter } from '../src/dataflow/ssa_conversion.ts';

const app = useSyntax().addGrammar(OperatorGrammar)



const program = app.execute(`
struct Pair { first: T, second: T }

fn sum_pair(p: Pair): i32 {
  const a: i32 = p.first;
  const b: i32 = p.second;
  a + b
}

fn make_pair(x: i32, y: i32): Pair {
  Pair { first: x, second: y }
}

fn main(): i32 {
  const v: i32 = 10;
  const w: i32 = 20;

  const p: Pair = make_pair(v, w);

  const arr: i32 = [1, 2, 3][1];

  const result: i32 = sum_pair(p) + arr * 2;

  if (result > 10 && v < w) {
    result
  } else {
    0
  }
}`, true);
const bb = program.toBasicBlocks();
new SSAConverter(bb).toSSA()
console.log(new MermaidBBConverter().toString(bb))
