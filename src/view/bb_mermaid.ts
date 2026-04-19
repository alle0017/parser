import { BasicBlock } from '../ast/basic_block.ts';
import { Ir } from '../ast/ir.ts';
import { View } from './view.d.ts';
export class BBMermaid implements View {
      private static readonly MD_PRELUDE = '---\nconfig:\n layout: elk\n theme: redux\n---\nflowchart TD\n';
      private basicBlocksToMermaidDiagram(block: BasicBlock<View>, traversed: Set<BasicBlock<View>> = new Set()): string {
            let diagram = `\nBLOCK_${block.index}["${block.toString()}"]`;
            for (const bb of block.next) {
                  if (!traversed.has(bb)) {
                        traversed.add(bb);
                        diagram += this.basicBlocksToMermaidDiagram(bb, traversed);
                  }
                  diagram += `\nBLOCK_${block.index} -- from ${block.index} goto ${bb.index} --> BLOCK_${bb.index}`
            }
            return diagram;
      }
      private irToMermaidDiagram(ir: Ir, traversed: Set<Ir> = new Set()) {
            let diagram = `\nBLOCK_${ir.index}["${ir.toString()}"]`;
            for (const next of ir.next) {
                  if (!traversed.has(next)) {
                        traversed.add(next);
                        diagram += this.irToMermaidDiagram(next, traversed);
                  }
                  diagram += `\nBLOCK_${ir.index} -- from ${ir.index} goto ${next.index} --> BLOCK_${next.index}`
            }
            return diagram;
      }
      private programToMermaidDiagram(instructions: Ir[], traversed: Set<Ir> = new Set()) {
            let diagram = `${BBMermaid.MD_PRELUDE}\n`;
            for (let i = 0; i < instructions.length; i++) {
                  diagram += `${this.irToMermaidDiagram(instructions[i], traversed)}`;
            }

            return diagram;
      }
      public viewBasicBlocks(blocks: BasicBlock<View>[]) {
            const set: Set<BasicBlock<View>> = new Set();
            return `${BBMermaid.MD_PRELUDE}\n${this.basicBlocksToMermaidDiagram(blocks[0], set)}`;
      }
      public viewIr(instructions: Ir[]) {
            return this.programToMermaidDiagram(instructions, new Set());
      }
}