import { BasicBlock, getAssignedSymbolInBlock } from "../ast/basic_block.ts";
import { Ir, Phi, Symbol } from "../ast/ir.ts";
import { Node } from "../utils/node.ts";
import { DominanceTree } from "./dt_operator.ts";

const SetConstructor = () => new Set<any>();
class SymbolVersionManager {
      private readonly versions: Map<Symbol, Symbol[]> = new Map();
      private readonly defined: Map<Symbol, Symbol> = new Map();

      public addVersion(symbol: Symbol) {
            const newDef = Symbol.new(symbol.value);
            this.versions.getOrInsert(symbol, []).push(newDef);
            this.defined.set(newDef, symbol);
            return newDef;
      }
      public getLatest(symbol: Symbol) {
            if (this.defined.has(symbol)) {
                  symbol = this.defined.get(symbol)!;
            }
            return this.versions.getOrInsert(symbol, []).at(-1) ?? symbol;
      }
      public discardLatest(symbol: Symbol) {
            if (this.versions.has(symbol)) {
                  this.versions.get(symbol)!.pop();
            }
      }
}
export class SSAConverter {
      private readonly tree: DominanceTree;
      private readonly definitions: Map<Symbol, Set<BasicBlock<Ir>>>;
      private readonly phi: Map<BasicBlock<Ir>, Set<Phi>> = new Map();
      private readonly versions = new SymbolVersionManager();

      constructor(blocks: BasicBlock<Ir>[]) {
            this.tree = new DominanceTree(blocks);
            this.definitions = this.getDefinitionMap();
      }

      private getDefinitionMap(): Map<Symbol, Set<BasicBlock<Ir>>> {
            const table: Map<Symbol, Set<BasicBlock<Ir>>> = new Map();
            for (let i = 0; i < this.tree.blocks.length; i++) {
                  const bb = this.tree.blocks[i];
                  const definitions = getAssignedSymbolInBlock(bb);

                  for (const def of definitions) {
                        table.getOrInsertComputed(def, SetConstructor).add(bb);
                  }
            }
            return table;
      }
      private addPhiToSymbol(variable: Symbol) {
            //
            const defs = this.definitions.get(variable);
            if (!defs) {
                  return;
            }     
            const phiPlaced: Map<Symbol, Set<BasicBlock<Ir>>> = new Map();
            const stack: BasicBlock<Ir>[] = [];

            for (const bb of defs) {
                  stack.push(bb);
            }

            while (stack.length > 0) {
                  const bb = stack.pop()!;
                  const frontier = this.tree.getDominanceFrontierOf(bb);
                  for (const ff of frontier) {
                        if (phiPlaced.has(variable) && phiPlaced.get(variable)?.has(ff)) {
                              continue;
                        }
                        const phi = new Phi(variable);
                        ff.instructions[0].addBefore(phi)
                        ff.instructions.unshift(phi);
                        phiPlaced.getOrInsertComputed(variable, SetConstructor).add(ff);
                        this.phi.getOrInsertComputed(ff, SetConstructor).add(phi);
                        if (!defs.has(ff)) {
                              defs.add(ff);
                        }
                  }
            }
      }

      private rename(root: Node<BasicBlock<Ir>>) {
            const bb = root.value;
            const phi = this.phi.get(bb);
            const defined: Symbol[] = [];

            if (phi) {
                  for (const ir of phi) {
                        const def = this.versions.addVersion(ir.variable);  
                        ir.variable = def;
                        defined.push(def);
                  }
            }

            for (const ir of bb.instructions) {
                  const used = ir.getUsedVariables();
                  const assigned = ir.getAssignedVariables();

                  for (const u of used) {
                        ir.replaceUse(u, this.versions.getLatest(u));
                  }
                  for (const a of assigned) {
                        const def = this.versions.addVersion(a);  
                        ir.replaceAssignment(a, def);
                        defined.push(def);
                  }
            }

            for (const nn of bb.next) {
                  const phi = this.phi.get(nn);

                  if (!phi) {
                        continue;
                  }
                  for (const ir of phi) {
                        ir.addValue(bb, this.versions.getLatest(ir.variable));
                  }
            }

            for (const child of root.next) {
                  this.rename(child);
            }

            for (let i = defined.length - 1; i >= 0; i--) {
                  const symbol = defined[i];
                  this.versions.discardLatest(symbol);
            }
      }

      public toSSA() {
            for (const def of this.definitions.keys()) {
                  this.addPhiToSymbol(def);
            }
            this.rename(this.tree.get())
      }
}