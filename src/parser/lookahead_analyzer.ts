import { RRule, PRule } from "./index.d.ts";
import { Reducer } from "./reducer.ts";

const SetConstructor = () => new Set<any>();
export class LookaheadAnalyzer {
      private readonly starters: Map<string, Set<string>> = new Map();
      private readonly terminators: Map<string, Set<string>> = new Map();
      public readonly lookahead: Map<string, Set<string>> = new Map();
      public readonly ruleTable: Map<string, Set<RRule>> = new Map();
      public static fromRulesToToken(parsing: PRule[]) {
            return parsing.filter(rule => rule.type).map(rule => rule.type!);
      }

      constructor(private readonly axiom: string, private readonly rules: RRule[], private readonly tokens: string[]) {
            this.getStarters();
            this.getTerminators();
            this.getLookahead();
            for (let i = 0; i < rules.length; i++) {
                  this.ruleTable.getOrInsert(rules[i].rule.at(-1)!, new Set()).add(rules[i]);
            }
      }

      /**
       * extract the starter character of each rule. it extract the starter
       * iteratively, as follows:
       * - each simple token start with itself
       * - extract the tuple [complexToken, Set<starters of the complexToken>]
       * - repeat until all complex tokens are resolved
       *    - loop over each tuple
       *    - if any starter is not resolved, continue
       *    - otherwise add to the map all the starters of each starter
       *    - complexTokens will be resolved automatically to simpler tokens
       *    - simple tokens will be mapped to theirs elves
       */
      private getStarters() {
            for (let i = 0; i < this.tokens.length; i++) {
                  this.starters.set(this.tokens[i], new Set([this.tokens[i]]))
            }
            const starters = new Map<string, Set<string>>();
            this.rules.map(rule => [rule.reduction, rule.rule[0]]).forEach(([k,v]) => starters.getOrInsertComputed(k, SetConstructor).add(v));
            const ruleTokens = new Set(this.rules.map(rule => rule.reduction));

            while (ruleTokens.size > 0) {
                  const cpy = new Set(ruleTokens);
                  const empty = new Set<string>();

                  cpy.forEach(token => {
                        const set = starters.get(token)!;
                        const isComplete = set.values().map(dependency => dependency == token || this.starters.has(dependency)).reduce((p,c) => p && c, true);
                        if (!isComplete) {
                              return;
                        }
                        this.starters.set(token, set.values().map(dependency => dependency == token ? empty: this.starters.get(dependency)!).reduce((p,c) => p.union(c), empty));
                        ruleTokens.delete(token);
                  });
            }      
      }
      /**
       * algorithm specular to the starter extraction
       */
      private getTerminators() {
            for (let i = 0; i < this.tokens.length; i++) {
                  this.terminators.set(this.tokens[i], new Set([this.tokens[i]]))
            }
            const terminators = new Map<string, Set<string>>();
            this.rules.map(rule => [rule.reduction, rule.rule.at(-1)!]).forEach(([k,v]) => terminators.getOrInsertComputed(k, SetConstructor).add(v));
            const ruleTokens = new Set(this.rules.map(rule => rule.reduction));

            while (ruleTokens.size > 0) {
                  const cpy = new Set(ruleTokens);
                  const empty = new Set<string>();

                  cpy.forEach(token => {
                        const set = terminators.get(token)!;
                        const isComplete = set.values().map(dependency => dependency == token || this.terminators.has(dependency)).reduce((p,c) => p && c, true);
                        if (!isComplete) {
                              return;
                        }
                        this.terminators.set(token, set.values().map(dependency => dependency == token ? empty: this.terminators.get(dependency)!).reduce((p,c) => p.union(c), empty));
                        ruleTokens.delete(token);
                  });
            }      
      }
      private addLookahead(token: string, lookahead: string) {
            this.terminators.get(token)?.forEach(terminal => {
                  const set = this.lookahead.getOrInsertComputed(terminal, SetConstructor);
                  this.starters.get(lookahead)?.forEach(starter => set.add(starter));
            });
            const set = this.lookahead.getOrInsertComputed(token, SetConstructor);
            this.starters.get(lookahead)?.forEach(starter => set.add(starter));
      }
      private getLookahead() {
            const dependence: Map<string,Set<string>> = new Map();

            for (let i = 0; i < this.rules.length; i++) {
                  const rule = this.rules[i].rule;
                  
                  for (let j = 0; j < rule.length - 1; j++) {
                        this.addLookahead(rule[j], rule[j+1]);
                  }
                  dependence.getOrInsertComputed(this.rules[i].reduction, SetConstructor).add(this.rules[i].rule.at(-1)!);
            }
            this.lookahead.getOrInsertComputed(this.axiom, SetConstructor).add(Reducer.NULL);
            const stack = [this.axiom];
            const seen: Set<string> = new Set(stack);

            while (stack.length > 0) {
                  const rule = stack.shift()!;
                  const lookahead = this.lookahead.get(rule)!;
                  const set = dependence.get(rule);
                  lookahead.forEach(lookahead => set?.forEach(rule => this.lookahead.getOrInsertComputed(rule, SetConstructor).add(lookahead)));
                  set?.forEach(rule => {
                        if (seen.has(rule)) {
                              return;
                        }
                        seen.add(rule);
                        stack.push(rule);
                  });
            }
      }
}