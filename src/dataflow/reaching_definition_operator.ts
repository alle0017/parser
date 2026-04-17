import { BasicBlock, getAssignedSymbolInBlock, getKilledSymbolInBlock } from "../ast/basic_block.ts";
import { Ir, Symbol } from "../ast/ir.ts";
import { FlowOperator } from "./flow_operator.ts";

/**
 * operator used in dataflow analysis to obtain reaching definition sets for each block.
 */
export class ReachingDefinitionOperator implements FlowOperator<Set<Symbol>> {
      private readonly assigned: Map<BasicBlock<Ir>, Set<Symbol>> = new Map();
      private readonly killed: Map<BasicBlock<Ir>, Set<Symbol>> = new Map();

      empty(): Set<Symbol> {
            return new Set();
      }
      accumulator(): Set<Symbol> {
            return new Set();
      }
      changed(current: Set<Symbol>, previous: Set<Symbol>): boolean {
            return current.size !== previous.size;
      }
      transport(bb: BasicBlock<Ir>, bbIn: Set<Symbol>): Set<Symbol> {
            const assigned = this.assigned.getOrInsertComputed(bb, () => getAssignedSymbolInBlock(bb));
            const killed = this.killed.getOrInsertComputed(bb, () => getKilledSymbolInBlock(bb));
            const gen: Set<Symbol> = new Set();
            
            for (const def of assigned) {
                  if (bbIn.has(def)) {
                        killed.add(def);
                  }
                  gen.add(def);
            }
            return gen.union(bbIn.difference(killed));
      }
      accumulate(current: Set<Symbol>, previous: Set<Symbol>): Set<Symbol> {
            for (const def of current) {
                  previous.add(def);
            }
            return previous;
      }
}