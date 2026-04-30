import { OperatorGrammar } from "./lang/operator_grammar.ts";
import { MermaidBBConverter } from "../src/view/bb_mermaid.ts";
import { useSyntax, } from './grammar_gen.ts';
import { SSAConverter } from '../src/dataflow/ssa_conversion.ts';
try {

  const app = useSyntax().addGrammar(OperatorGrammar)
  
  const program = app.execute(`
      fn add(a: i32, b: i32): i32 {
        const x = a;
        const y = x;
        while (true) {
          const c = b;
          if (c) {
            const c = a;
          } else if (d) {
            return x;
          }
        }
      }
    `);
  const bb = program.toBasicBlocks();
  new SSAConverter(bb).toSSA()
  console.log(new MermaidBBConverter().toString(bb))
} catch (e) {
  console.log(e)
}
