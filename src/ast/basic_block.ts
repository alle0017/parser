import { View } from "../view/view.d.ts";

/**
 * BasicBlock<T> groups a contiguous sequence of `T` objecinstructions and
 * tracks control-flow relationships between blocks (`next` and
 * `predecessors`). Instances are typically produced when splitting a
 * linear T stream into basic blocks.
 */
export class BasicBlock<T extends View> implements View {
      /** Successor basic blocks in the control-flow graph. */
      public readonly next: Set<BasicBlock<T>> = new Set();
      /** Predecessor basic blocks in the control-flow graph. */
      public readonly predecessors: Set<BasicBlock<T>> = new Set();
      /**
       * Create a `BasicBlock<T>` wrapping the provided instructions.
       *
       * @param instructions - contiguous instructions comprising the block
       */
      constructor(private readonly instructions: T[], public readonly index: number) {}

      /**
       * Link `bb` as a successor of this block and update the successor's
       * predecessor set.
       *
       * @param bb - successor basic block to add
       * @returns `this` for chaining
       */
      public setNext(bb: BasicBlock<T>) {
            this.next.add(bb);
            bb.predecessors.add(this);
            return this;
      }    

      /**
       * Render the block by concatenating the textual representation of
       * instructions contained instructions.
       *
       * @returns Multi-line string for the block
       */
      public toString() {
            return `@Block(${this.index})\n${this.instructions.map(instr => instr.toString()).join('\n')}`;
      }

      public dominates(bb: BasicBlock<T>) {
            return this.index < bb.index;
      }
      public isDominatedBy(bb: BasicBlock<T>) {
            return this.index > bb.index;
      }
}