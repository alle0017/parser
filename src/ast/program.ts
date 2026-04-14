import { BasicBlock } from './basic_block.ts';
import type { Instruction } from './instruction.ts';

/**
 * Represents a control-flow program composed of a sequence of
 * `Instruction` objects. The class maintains a flat list of instructions
 * (`cfg`) and provides helpers to build BasicBlock boundaries and
 * translate the linear instruction list into basic blocks.
 */
export class Program {
      private static readonly MD_PRELUDE = '---\nconfig:\n layout: elk\n theme: redux\n---\nflowchart TD\n';
      private readonly cfg: Instruction[] = [];
      
      /**
       * Append an `Instruction` to the program and link it as a successor
       * of the previously appended instruction (when present).
       *
       * @param instr - instruction to append to the program
       * @returns `this` for fluent chaining
       */
      public addInstruction(instr: Instruction) {
            if (this.cfg.length >= 1) {
                  this.cfg.at(-1)?.addSuccessor(instr);
            }
            this.cfg.push(instr);
            return this;
      }
      /**
       * Render the program as a textual representation by joining the
       * `toString()` output of each contained instruction.
       *
       * @returns A multi-line string representing the program
       */
      public toString() {
            return this.cfg.map(v => v.toString()).join('\n');
      }
      /**
       * Resolve the BasicBlock associated with `instr` from `map` and set it
       * as the next block of `block` (if present).
       *
       * @private
       */
      private setBBNext(instr: Instruction, block: BasicBlock, map:  Map<Instruction, BasicBlock>) {
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
      private setBBPrev(instr: Instruction, block: BasicBlock, map:  Map<Instruction, BasicBlock>) {
            const bb = map.get(instr);

            if (!bb || bb == block) {
                  return;
            }
            bb.setNext(block);
      }
      /**
       * Create a `BasicBlock` from a contiguous list of `Instruction`s and
       * populate the provided `map` so individual instructions point to the
       * newly created block. The method also links predecessor/successor
       * basic blocks based on the first/last instruction's relations.
       *
       * @private
       */
      private createBasicBlock(idx: number, curr: Instruction[], map: Map<Instruction, BasicBlock>) {
            const block = new BasicBlock(curr, idx);
            for (let i = 0; i < curr.length; i++) {
                  map.set(curr[i], block);
            }
            const first = curr[0];
            const last = curr.at(-1)!;

            first.predecessors.forEach(instr => this.setBBPrev(instr, block, map));
            first.next.forEach(instr => this.setBBNext(instr, block, map));
            last.next.forEach(instr => this.setBBNext(instr, block, map));
            last.predecessors.forEach(instr => this.setBBPrev(instr, block, map));
            return block;
      }
      /**
       * Split the program's instruction list into basic blocks. The algorithm
       * iterates over the instruction sequence and emits a new `BasicBlock`
       * each time a control-flow boundary is detected (e.g. multiple
       * successors, non-fall-through target, or multiple predecessors).
       *
       * @returns An array of `BasicBlock` objects representing the CFG
       */
      public toBasicBlocks() {
            const bb: BasicBlock[] = [];
            const map: Map<Instruction, BasicBlock> = new Map();
            let curr: Instruction[] = []
            let idx = 0;


            for (let i = 0; i < this.cfg.length - 1; i++) {
                  curr.push(this.cfg[i]);
                  const hasOtherPredecessor = this.cfg[i].predecessors.size > 1 || (i > 0 && !this.cfg[i].predecessors.has(this.cfg[i - 1]));
                  const hasOtherSuccessors = !this.cfg[i].next.has(this.cfg[i + 1]) || this.cfg[i].next.size > 1;
                  if (curr.length > 1 && (hasOtherPredecessor || hasOtherSuccessors)) {
                        const block = this.createBasicBlock(idx, curr, map);
                        idx++;
                        bb.push(block);
                        curr = [];
                  }
            }

            curr.push(this.cfg.at(-1)!);
            const block = this.createBasicBlock(idx, curr, map);
            bb.push(block);
            return bb;
      }   
      public toBBMermaidDiagram() {
            return `${Program.MD_PRELUDE}${this.toBasicBlocks()[0].toMermaidDiagram()}`;
      }
      public toSubgraphMermaidDiagram() {
            return `${Program.MD_PRELUDE}${this.toBasicBlocks()[0].toSubgraphMermaidDiagram()}`;
      }
      public toMermaidDiagram() {
            return `${Program.MD_PRELUDE}${this.cfg[0].toMermaidDiagram()}`;
      }
}