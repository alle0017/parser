/**
 * Base representation of a program instruction used to build a control-flow
 * graph. Instructions track successor/predecessor relationships and expose
 * methods used by analyses (used/assigned variable discovery).
 */
export abstract class Instruction {
      private static ID = 0;

      private readonly id = ++Instruction.ID;
      /** Successor instructions in the program. */
      public readonly next: Set<Instruction> = new Set();
      /** Predecessor instructions in the program. */
      public readonly predecessors: Set<Instruction> = new Set();

      /**
       * Link `instruction` as a successor of this instruction and update the
       * successor's predecessor set.
       *
       * @param instruction - instruction to add as a successor
       * @returns `this` for chaining
       */
      public addSuccessor(instruction: Instruction): this {
            this.next.add(instruction);
            instruction.predecessors.add(this);
            return this;
      }

      /**
       * Collect the variable names that are read/used by this instruction.
       * Concrete subclasses must implement this to support dataflow analyses.
       */
      public abstract getUsedVariables(): string[];
      /**
       * Collect the variable names that are assigned by this instruction.
       * Concrete subclasses must implement this to support dataflow analyses.
       */
      public abstract getAssignedVariables(): string[];
      /**
       * Default textual representation for an instruction. Subclasses may
       * override to provide richer information.
       */
      public toString() {
            return `@@${Object.getPrototypeOf(this).constructor.name}`
      }
      public toMermaidDiagram(traversed: Set<Instruction> = new Set()): string {
            let diagram = `\nINSTR_${this.id}["${this.toString()}"]`;

            for (const bb of this.next) {
                  if (!traversed.has(bb)) {
                        traversed.add(bb);
                        diagram += bb.toMermaidDiagram(traversed);
                  }
                  diagram += `\nINSTR_${this.id} -- from ${this.id} goto ${bb.id} --> INSTR_${bb.id}`
            }
            return diagram;
      }

      public getMermaidId() {
            return `INSTR_${this.id}`;
      }
}

/**
 * A `FlowInstruction` represents a control-flow instruction that by
 * default does not read or write variables. Subclasses may override the
 * behavior if they interact with variables.
 */
export abstract class FlowInstruction extends Instruction {
      public override getAssignedVariables(): string[] {
            return [];
      }
      public override getUsedVariables(): string[] {
            return [];
      }
}