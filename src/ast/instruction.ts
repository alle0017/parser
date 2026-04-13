export abstract class Instruction {
      public readonly next: Set<Instruction> = new Set();
      public readonly predecessors: Set<Instruction> = new Set();
      public addSuccessor(instruction: Instruction): this {
            this.next.add(instruction);
            instruction.predecessors.add(this);
            return this;
      }
      public abstract getUsedVariables(): string[];
      public abstract getAssignedVariables(): string[];
      public toString() {
            return `@@${Object.getPrototypeOf(this).constructor.name}`
      }
}

export abstract class FlowInstruction extends Instruction {
      public override getAssignedVariables(): string[] {
            return [];
      }
      public override getUsedVariables(): string[] {
            return [];
      }
}