import { ReductionNotFoundError } from '../exceptions/index.ts';
import type { RRule, PRule, Token, } from './index.d.ts';
import { LookaheadAnalyzer } from './lookahead_analyzer.ts';
/**
 * LR-style reducer that performs grammar reductions on a token stream.
 *
 * The reducer uses a lookahead table derived from the provided parsing
 * rules to decide when a reduction is valid. The implementation fork on indecision based on rules 
 * to solve possible conflicts. this can ultimately lead to over memory consumption.
 */
export class Reducer {
      /** Sentinel token type used to mark end-of-input. */
      public static readonly NULL = '\0';
      private readonly lookahead: Map<string, Set<string>>;
      private readonly table: Map<string, Set<RRule>>;
      /**
       * Construct a reducer.
       *
       * @param axiom - grammar start symbol
       * @param reductions - reduction rules (RRule)
       * @param parsing - production rules used to build lookahead sets
       */
      constructor(private readonly axiom: string, private readonly reductions: RRule[], parsing: PRule[]) {
            const net = new LookaheadAnalyzer(axiom, reductions, LookaheadAnalyzer.fromRulesToToken(parsing));
            this.table = net.ruleTable;
            this.lookahead = net.lookahead;
      }

      /**
       * Reduce the provided token stream by repeatedly applying grammar
       * reductions. The method returns the reduced token stack.
       *
       * @param tokens - token stream to reduce
       * @returns reduced token stack
       */
      public reduce(tokens: Token[]): Token[] {
            const result = new Computation(this.axiom, this.table, this.lookahead, [], tokens).execute();

            if (result.error) {
                  throw new ReductionNotFoundError();
            }
            return result.reduction;
      }     
}
class ComputationResult {
      static error() {
            return new ComputationResult(true, []);
      }
      static ok(res: Token[]) {
            return new ComputationResult(false, res);
      }
      private constructor(public readonly error: boolean, public readonly reduction: Token[]) {}
}
class Computation {
      private readonly decisions: Computation[] = [];
      private state: number = 0;
      /**
       * Construct a reducer.
       *
       * @param axiom - grammar start symbol
       * @param reductions - reduction rules (RRule)
       * @param parsing - production rules used to build lookahead sets
       */
      constructor(
            private readonly axiom: string, 
            private readonly table: Map<string, Set<RRule>>, 
            private readonly lookahead: Map<string, Set<string>>, 
            private readonly stack: Token[],
            private readonly missing: Token[],
      ) {}

      private fork(stack: Token[]) {
            return new Computation(
                  this.axiom, 
                  this.table, 
                  this.lookahead, 
                  stack, 
                  this.missing.slice(this.state + 1)
            );
      }
      /**
       * Pick the longest rule from a candidate set. Throws if the set is empty.
       *
       * @private
       */
      private longestRuleOfSet(set: Set<RRule>) {
            let max: RRule = set.values().toArray()[0];
            set.forEach(rule => {
                  if (!max || max.rule.length < rule.rule.length) {
                        max = rule;
                  }
            });
            
            if (!max) {
                  throw new ReductionNotFoundError();
            }

            for (const rule of set) {
                  if (rule !== max) {
                        this.decisions.push(this.fork(this.reduce(rule, [...this.stack])));
                  }
            }
            return max;
      }

      private reduce(max: RRule, stack: Token[]) {
            const children: Token[] = [];
            for (let i = 0; i < max.rule.length; i++) {
                  children.unshift(stack.pop()!);
            }
            stack.push({
                  $: children,
                  type: max.reduction
            });
            return stack;
      }
      /**
       * Apply the chosen reduction: pop the matched tokens, create a new
       * reduced token and push it back on the stack. Then re-analyze stack
       * state using `analyzeStack` with the provided lookahead.
       *
       * @private
       */
      private reduceAndPush(final: Set<RRule>, lookahead: Token) {
            const max = this.longestRuleOfSet(final);
            this.reduce(max, this.stack);
            this.analyzeStack(lookahead);
      }

      /**
       * Inspect the top of the stack and collect all reductions that match
       * the current suffix and are valid given the lookahead constraints.
       * If any valid reductions exist, perform the longest one.
       *
       * @private
       */
      private analyzeStack(lookahead: Token) {
            const token = this.stack.at(-1);
            if (!token) {
                  return;
            }
            const rules = this.table.get(token.type);
            
            if (!rules) {
                  return;
            }
            
            const final: Set<RRule> = new Set();
            
            rules.forEach(rule => {
                  if (rule.rule.length > this.stack.length) {
                        return;
                  }
                  if (rule.rule.at(-1) !== token.type) {
                        return;
                  }
                  if (this.lookahead.has(rule.reduction) && !this.lookahead.get(rule.reduction)?.has(lookahead.type)) {
                        return;
                  }
                  
                  for (let i = 2; i <= rule.rule.length; i++) {
                        if (this.stack.at(-i)?.type !== rule.rule.at(-i)) {
                              return;
                        }
                  }
                  final.add(rule);
            });
            if (final.size >= 1) {
                  this.reduceAndPush(final, lookahead);
            }
      }

      private getResult(): ComputationResult {
            if (this.stack.length == 1 && this.stack[0].type == this.axiom) {
                  return ComputationResult.ok(this.stack);
            }

            for (let i = 0; i < this.decisions.length; i++) {
                  const res = this.decisions[i].execute();

                  if (!res.error) {
                        return res;
                  }
            }
            return ComputationResult.error();
      }

      public execute() {
            this.analyzeStack(this.missing[0]);
            while (this.state < this.missing.length - 1) {
                  this.stack.push(this.missing[this.state]);
                  this.analyzeStack(this.missing[this.state + 1]);
                  this.state++;
            }
            this.stack.push(this.missing.at(-1)!);
            this.analyzeStack({ type: Reducer.NULL, $: Reducer.NULL });
            return this.getResult();
      }
}