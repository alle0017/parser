import { BasicBlock } from '../ast/basic_block.ts';
import { Ir } from '../ast/ir.ts';
import { DataflowAnalyzer } from './dataflow_analyzer.ts';
import { FlowOperator } from './flow_operator.ts';
import { Node } from "../utils/node.ts"

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

export class DominanceTree {
      private readonly dominators: Map<BasicBlock<Ir>, Set<BasicBlock<Ir>>>;
      constructor(private readonly blocks: BasicBlock<Ir>[]) {
            const {output} = new DataflowAnalyzer<Set<BasicBlock<Ir>>>(blocks).forwardAnalysis(new DTOperator(blocks), new Set([blocks[0]]));
            this.dominators = output;
      }

      private buildTree(current: BasicBlock<Ir>, dominators:  Map<BasicBlock<Ir>, Set<BasicBlock<Ir>>>, seen: Set<BasicBlock<Ir>>) {
            const node = new Node(current, []);
            
            for (const dom of current.next) {
                  if (!seen.has(dom)) {
                        seen.add(dom);
                        node.append(this.buildTree(dom, dominators, seen));
                  }
            }
            return node;
      }   
      public getDominanceFrontierOf(node: BasicBlock<Ir>) {
            const df: Set<BasicBlock<Ir>> = new Set();
            const seen: Set<BasicBlock<Ir>> = new Set();
            const stack = [node];

            while (stack.length > 0) {
                  const curr = stack.pop()!;

                  if (this.dominators.get(curr)?.has(node)) {
                        for (const nn of curr.next) {
                              if (!seen.has(nn)) {
                                    seen.add(nn);
                                    stack.push(nn);
                              }
                        }
                  } else {
                        df.add(curr);
                  }
            }
            return df;
      }
      public get() {
            return this.buildTree(this.blocks[0], this.dominators, new Set());
      }
}