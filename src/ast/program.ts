import { Ir, Prelude } from "./ir.ts";
import { BasicBlock } from "./basic_block.ts";

const hasAny = <T>(set: Set<T>, values: Iterable<T>) => {
      for (const val of values) {
            if (set.has(val)) {
                  return true;
            }
      }
      return false;
}
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

      public static fromBasicBlocks(blocks: BasicBlock<Ir>[]) {
            const program = new Program();

            for (const bb of blocks) {
                  for (const ir of bb.instructions) {
                        program.addInstruction(ir);
                  }
            }
            return program;
      }
      
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
       * Create a `BasicBlock` from a contiguous list of `Ir`s and
       * populate the provided `map` so individual Irs point to the
       * newly created block. The method also links predecessor/successor
       * basic blocks based on the first/last Ir's relations.
       *
       * @private
       */
      private findLeaders() {
            const leaders = new Set<Ir>();

            leaders.add(this.head);

            for (let i = 1; i < this.linearGraph.length; i++) {
                  if (this.linearGraph[i].isLeader()) {
                        leaders.add(this.linearGraph[i]);
                  }
            }
            return leaders;
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
            const blocks: BasicBlock<Ir>[] = [];
            const leaders = this.findLeaders();
            const map: Map<Ir, BasicBlock<Ir>> = new Map()
            let index = 0;

            for (const leader of leaders) {
                  const block = new BasicBlock<Ir>([leader], ++index)
                  let curr = leader.next;
                  map.set(leader, block);
                  while (curr.size > 0 && !hasAny(leaders, curr)) {
                        for (const cc of curr) {
                              map.set(cc, block);
                        }
                        block.instructions.push(...curr);
                        curr = [...curr].map(curr => curr.next).reduce((p,c) => p.union(c), new Set());
                  }
                  blocks.push(block);
            }

            for (let i = 0; i < blocks.length; i++) {
                  const instr = blocks[i].instructions;
                  const head = instr[0];
                  const tail = instr.at(-1)!;

                  for (const pir of head.previous) {
                        map.get(pir)!.setNext(blocks[i]);
                  }
                  for (const nir of tail.next) {
                        blocks[i].setNext(map.get(nir)!);
                  }
            }
            return blocks;
      }   
      toIr() {
            return this.linearGraph;
      }
}