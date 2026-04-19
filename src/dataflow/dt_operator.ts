import { BasicBlock } from '../ast/basic_block.ts';
import { Ir } from '../ast/ir.ts';
import { FlowOperator } from './flow_operator.ts';

/**
 * dominance tree operator for forward analysis
 */
export class DTOperator implements FlowOperator<Set<BasicBlock<Ir>>> {
      constructor(private readonly blocks: BasicBlock<Ir>[]) {}
      empty(): Set<BasicBlock<Ir>> {
            return new Set();
      }
      accumulator(bb: BasicBlock<Ir>): Set<BasicBlock<Ir>> {
            if (bb === this.blocks[0]) {
                  return new Set([bb]);
            }
            return new Set(this.blocks);
      }
      transport(bb: BasicBlock<Ir>, set: Set<BasicBlock<Ir>>): Set<BasicBlock<Ir>> {
            return new Set(set).add(bb);
      }
      accumulate(current: Set<BasicBlock<Ir>>, previous: Set<BasicBlock<Ir>>): Set<BasicBlock<Ir>> {
            return previous.intersection(current);
      }
      changed(current: Set<BasicBlock<Ir>>, previous: Set<BasicBlock<Ir>>): boolean {
            return current.size != previous.size;
      }
}