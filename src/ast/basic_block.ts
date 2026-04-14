import type { Instruction } from "./instruction.ts";

/**
 * BasicBlock groups a contiguous sequence of `Instruction` objects and
 * tracks control-flow relationships between blocks (`next` and
 * `predecessors`). Instances are typically produced when splitting a
 * linear instruction stream into basic blocks.
 */
export class BasicBlock {
      /** Successor basic blocks in the control-flow graph. */
      public readonly next: Set<BasicBlock> = new Set();
      /** Predecessor basic blocks in the control-flow graph. */
      public readonly predecessors: Set<BasicBlock> = new Set();
      /**
       * Create a `BasicBlock` wrapping the provided instructions.
       *
       * @param instructions - contiguous instructions comprising the block
       */
      constructor(private readonly instructions: Instruction[], private readonly index: number) {}

      /**
       * Link `bb` as a successor of this block and update the successor's
       * predecessor set.
       *
       * @param bb - successor basic block to add
       * @returns `this` for chaining
       */
      public setNext(bb: BasicBlock) {
            this.next.add(bb);
            bb.predecessors.add(this);
            return this;
      }    

      /**
       * Render the block by concatenating the textual representation of
       * its contained instructions.
       *
       * @returns Multi-line string for the block contents
       */
      public toString() {
            return `${this.instructions.map(instr => instr.toString()).join('\n')}`;
      }

      public getUsedVariables(): string[] {
            const set: Set<string> = new Set();
            for (let i = 0; i < this.instructions.length; i++) {
                  this.instructions[i].getUsedVariables().forEach(val => set.add(val));
            }
            return [...set];
      }
      public getAssignedVariables(): string[] {
            const set: Set<string> = new Set();
            for (let i = 0; i < this.instructions.length; i++) {
                  this.instructions[i].getAssignedVariables().forEach(val => set.add(val));
            }
            return [...set];
      }

      public dominates(bb: BasicBlock) {
            return this.index < bb.index;
      }
      public isDominatedBy(bb: BasicBlock) {
            return this.index > bb.index;
      }

      toMermaidDiagram(traversed: Set<BasicBlock> = new Set()): string {
            let diagram = `\nBLOCK_${this.index}["${this.toString()}"]`;

            for (const bb of this.next) {
                  if (!traversed.has(bb)) {
                        traversed.add(bb);
                        diagram += bb.toMermaidDiagram(traversed);
                  }
                  diagram += `\nBLOCK_${this.index} -- from ${this.index} goto ${bb.index} --> BLOCK_${bb.index}`
            }
            return diagram;
      }
}