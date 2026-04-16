import { Ir, Prelude } from "./ir.ts";
import { BasicBlock } from "./basic_block.ts";
/**
 * Represents a control-flow program composed of a sequence of
 * `Ir` objects. The class maintains a flat list of Irs
 * (`cfg`) and provides helpers to build BasicBlock boundaries and
 * translate the linear Ir list into basic blocks.
 */
export class Program {
      private readonly head: Ir = new Prelude();
      private tail: Ir = this.head;
      private readonly linearGraph: Ir[] = [];
      
      /**
       * Append an `Ir` to the program and link it as a successor
       * of the previously appended Ir (when present).
       *
       * @param instr - Ir to append to the program
       * @returns `this` for fluent chaining
       */
      public addInstruction(instr: Ir) {
            this.tail.addNext(instr);
            this.tail = instr;
            this.linearGraph.push(instr)
            return this;
      }

      toString() {
            return this.linearGraph.map(ir => ir.toString()).join('\n')
      }
      /**
       * Resolve the BasicBlock associated with `instr` from `map` and set it
       * as the next block of `block` (if present).
       *
       * @private
       */
      private setBBNext(instr: Ir, block: BasicBlock<Ir>, map:  Map<Ir, BasicBlock<Ir>>) {
            const bb = map.get(instr);

            if (!bb || bb == block) {
                  return;
            }
            block.setNext(bb);
      }
      /**
       * Resolve the BasicBlock associated with `instr` from `map` and set
       * `block` as its successor (linking the predecessor relationship).
       *
       * @private
       */
      private setBBPrev(instr: Ir, block: BasicBlock<Ir>, map:  Map<Ir, BasicBlock<Ir>>) {
            const bb = map.get(instr);

            if (!bb || bb == block) {
                  return;
            }
            bb.setNext(block);
      }
      /**
       * Create a `BasicBlock` from a contiguous list of `Ir`s and
       * populate the provided `map` so individual Irs point to the
       * newly created block. The method also links predecessor/successor
       * basic blocks based on the first/last Ir's relations.
       *
       * @private
       */
      private createBasicBlock(idx: number, curr: Ir[], map: Map<Ir, BasicBlock<Ir>>) {
            const block = new BasicBlock(curr, idx);
            for (let i = 0; i < curr.length; i++) {
                  map.set(curr[i], block);
            }
            const first = curr[0];
            const last = curr.at(-1)!;

            first.next.forEach(instr => this.setBBNext(instr, block, map));
            first.previous.forEach(instr => this.setBBPrev(instr, block, map));
            last.next.forEach(instr => this.setBBNext(instr, block, map));
            last.previous.forEach(instr => this.setBBPrev(instr, block, map));
            return block;
      }
      /**
       * Split the program's Ir list into basic blocks. The algorithm
       * iterates over the Ir sequence and emits a new `BasicBlock`
       * each time a control-flow boundary is detected (e.g. multiple
       * successors, non-fall-through target, or multiple predecessors).
       *
       * @returns An array of `BasicBlock` objects representing the CFG
       */
      public toBasicBlocks() {
            const bb: BasicBlock<Ir>[] = [];
            const map: Map<Ir, BasicBlock<Ir>> = new Map();
            let curr: Ir[] = []
            let idx = 0;


            for (let i = 0; i < this.linearGraph.length - 1; i++) {
                  curr.push(this.linearGraph[i]);

                  const hasOtherPredecessor = this.linearGraph[i].previous.size > 1 || (i > 0 && !this.linearGraph[i].previous.has(this.linearGraph[i - 1]));
                  const hasOtherSuccessors = !this.linearGraph[i].next.has(this.linearGraph[i + 1]) || this.linearGraph[i].next.size > 1;

                  if (curr.length > 1 && (hasOtherPredecessor || hasOtherSuccessors)) {
                        const block = this.createBasicBlock(idx, curr, map);
                        idx++;
                        bb.push(block);
                        curr = [];
                  }
            }

            curr.push(this.linearGraph.at(-1)!);
            const block = this.createBasicBlock(idx, curr, map);
            bb.push(block);
            return bb;
      }   
      toIr() {
            return this.linearGraph;
      }
}