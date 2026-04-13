import { BasicBlock } from './basic_block.ts';
import type { Instruction } from './instruction.ts';
export class Program {
      private readonly cfg: Instruction[] = [];
      
      public addInstruction(instr: Instruction) {
            if (this.cfg.length >= 1) {
                  this.cfg.at(-1)?.addSuccessor(instr);
            }
            this.cfg.push(instr);
            return this;
      }
      public toString() {
            return this.cfg.map(v => v.toString()).join('\n');
      }
      private setBBNext(instr: Instruction, block: BasicBlock, map:  Map<Instruction, BasicBlock>) {
            const bb = map.get(instr);

            if (!bb) {
                  return;
            }
            block.setNext(bb);
      }
      private setBBPrev(instr: Instruction, block: BasicBlock, map:  Map<Instruction, BasicBlock>) {
            const bb = map.get(instr);

            if (!bb) {
                  return;
            }
            bb.setNext(block);
      }

      private createBasicBlock(curr: Instruction[], map: Map<Instruction, BasicBlock>) {
            const block = new BasicBlock(curr);
            for (let i = 0; i < curr.length; i++) {
                  map.set(curr[i], block);
            }
            const first = curr[0];
            const last = curr.at(-1)!;

            first.predecessors.forEach(instr => this.setBBPrev(instr, block, map));
            last.next.forEach(instr => this.setBBNext(instr, block, map));
            return block;
      }
      public toBasicBlocks() {
            const bb: BasicBlock[] = [];
            const map: Map<Instruction, BasicBlock> = new Map();
            let curr: Instruction[] = []


            for (let i = 0; i < this.cfg.length - 1; i++) {
                  curr.push(this.cfg[i]);
                  if (curr.length > 0 && (this.cfg[i].next.size != 1 || !this.cfg[i].next.has(this.cfg[i + 1]) || this.cfg[i].predecessors.size != 1)) {
                        const block = this.createBasicBlock(curr, map);
                        bb.push(block);
                        curr = [];
                  }
            }

            curr.push(this.cfg.at(-1)!);
            const block = this.createBasicBlock(curr, map);
            bb.push(block);
            return bb;
      }      
}