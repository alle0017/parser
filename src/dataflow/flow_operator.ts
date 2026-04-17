import { BasicBlock } from '../ast/basic_block.ts';
import { Ir, } from '../ast/ir.ts';
export interface FlowOperator<T> {
      /**
       * method used to initialize the basic block analysis. 
       * if it is used in `forwardAnalysis`, then it is used to 
       * initialize **output**, **input** otherwise
       */
      empty(): T;
      /**
       * returns the value used as first value for the {@link FlowOperator.accumulate} function
       * @param bb 
       */
      accumulator(bb: BasicBlock<Ir>): T;
      /**
       * transport function. it computes a new value for the dependent variable `input`/`output`, based on the 
       * analysis. the second parameter is the independent variable, computed as iteration of previous values.
       * 
       * | / | forwardAnalysis | backwardAnalysis |
       * | --- | --- | --- |
       * | **independent** | input | output | 
       * | **dependent** | output | input | 
       * @param bb 
       * @param set 
       */
      transport(bb: BasicBlock<Ir>, set: T): T;
      /**
       * accumulator function that aggregates the value of all 
       * predecessors/successors of the given basic block.
       * must return the resulting set. is equivalent to the callback
       * passed to the reduce function.
       */
      accumulate(current: T, previous: T): T;
      /**
       * function used to identify possible changes in 
       * resulting values. Must be pure.
       * @param current 
       * @param previous 
       */
      changed(current: T, previous: T): boolean;
}