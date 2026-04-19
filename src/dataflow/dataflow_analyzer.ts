import { BasicBlock, } from '../ast/basic_block.ts';
import { Ir, } from '../ast/ir.ts';
import { FlowOperator } from './flow_operator.ts';

export class DataflowAnalyzer<T> {
      constructor(private readonly blocks: BasicBlock<Ir>[]) {}

      public forwardAnalysis(operator: FlowOperator<T>, entryValue: T) {
            const output: Map<BasicBlock<Ir>, T> = new Map();
            const input: Map<BasicBlock<Ir>, T> = new Map();
            let changed = true;

            output.set(this.blocks[0], entryValue);

            for (let i = 1; i < this.blocks.length; i++) {
                  output.set(this.blocks[i], operator.empty());
            }

            while (changed) {
                  changed = false;
                  for (let i = 0; i < this.blocks.length; i++) {
                        const bb = this.blocks[i];
                        let bbIn = operator.accumulator(bb);

                        for (const p of bb.predecessors) {
                              const ppOut = output.get(p)!;
                              bbIn = operator.accumulate(ppOut, bbIn);
                        }
                        const bbOut = operator.transport(bb, bbIn);
                        const previousIn = input.get(bb);
                        
                        input.set(bb, bbIn);
                        output.set(bb, bbOut);
                        
                        if (!previousIn || operator.changed(bbIn, previousIn) || operator.changed(output.get(bb)!, bbOut)) {
                              changed = true;
                        }
                  }
            }
            return {input, output};
      }

      public backwardAnalysis(operator: FlowOperator<T>, entryValue: T) {
            const output: Map<BasicBlock<Ir>, T> = new Map();
            const input: Map<BasicBlock<Ir>, T> = new Map();
            let changed = true;

            input.set(this.blocks.at(-1)!, entryValue);

            for (let i = 1; i < this.blocks.length; i++) {
                  input.set(this.blocks[i], operator.empty());
            }

            while (changed) {
                  changed = false;
                  for (let i = 0; i < this.blocks.length; i++) {
                        const bb = this.blocks[i];
                        let bbOut = operator.accumulator(bb);

                        for (const n of bb.next) {
                              const nnIn = input.get(n)!;

                              bbOut = operator.accumulate(nnIn, bbOut);
                        }
                        const bbIn = operator.transport(bb, bbOut);
                        const previousOut = output.get(bb);

                        output.set(bb, bbOut);
                        input.set(bb, bbIn);

                        if (!previousOut || operator.changed(bbOut, previousOut) || operator.changed(input.get(bb)!, bbIn)) {
                              changed = true;
                        }
                  }
            }
            return {input, output};
      }
}