import { ReductionNotFoundError } from '../exceptions/index.ts';
import type { RRule, PRule, Token, } from './index.d.ts';
import { LookaheadAnalyzer } from './lookahead_analyzer.ts';

/**
 * LR-style reducer that performs grammar reductions on a token stream.
 *
 * The reducer uses a lookahead table derived from the provided parsing
 * rules to decide when a reduction is valid. The implementation chooses the
 * longest matching reduction when multiple candidates are available.
 */
export class Reducer {
      /** Sentinel token type used to mark end-of-input. */
      public static readonly NULL = '\0';
      private readonly lookahead: Map<string, Set<string>>;
      private readonly table: Map<string, Set<RRule>>;
      private stack: Token[] = [];

      /**
       * Construct a reducer.
       *
       * @param axiom - grammar start symbol
       * @param reductions - reduction rules (RRule)
       * @param parsing - production rules used to build lookahead sets
       */
      constructor(axiom: string, private readonly reductions: RRule[], parsing: PRule[]) {
            const net = new LookaheadAnalyzer(axiom, reductions, LookaheadAnalyzer.fromRulesToToken(parsing));
            this.table = net.ruleTable;
            this.lookahead = net.lookahead;
      }

      /**
       * Pick the longest rule from a candidate set. Throws if the set is empty.
       *
       * @private
       */
      private longestRuleOfSet(set: Set<RRule>) {
            let max: RRule | null = null;
            set.forEach(rule => {
                  if (!max || max.rule.length < rule.rule.length) {
                        max = rule;
                  }
            });
            if (!max) {
                  throw new ReductionNotFoundError();
            }
            max = max as RRule;
            return max;
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
            const children: Token[] = [];
            for (let i = 0; i < max.rule.length; i++) {
                  children.unshift(this.stack.pop()!);
            }
            this.stack.push({
                  $: children,
                  type: max.reduction
            });
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

      /**
       * Reduce the provided token stream by repeatedly applying grammar
       * reductions. The method returns the reduced token stack.
       *
       * @param tokens - token stream to reduce
       * @returns reduced token stack
       */
      public reduce(tokens: Token[]): Token[] {
            this.stack = [];
            for (let i = 0; i < tokens.length - 1; i++) {
                  this.stack.push(tokens[i]);
                  this.analyzeStack(tokens[i + 1]);
            }
            this.stack.push(tokens.at(-1)!);
            this.analyzeStack({ type: Reducer.NULL, $: Reducer.NULL });
            return this.stack;
      }     
}