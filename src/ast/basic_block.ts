import type { Instruction } from "./instruction.ts";
export class BasicBlock {
      public readonly next: Set<BasicBlock> = new Set();
      public readonly predecessors: Set<BasicBlock> = new Set();
      constructor(private readonly instructions: Instruction[]) {}

      public setNext(bb: BasicBlock) {
            this.next.add(bb);
            bb.predecessors.add(this);
            return this;
      }    
      public toString() {
            return this.instructions.map(instr => instr.toString()).join('\n');
      }
}