import type { RRule, PRule } from './index.d.ts';
import { Reducer } from './reducer.ts';
export class MachineNet {
      public readonly lookahead: Map<string, Set<string>> = new Map();
      public readonly table: Map<string, Set<RRule>> = new Map();
      public readonly starters: Map<string, Set<string>>;
      public readonly terminators: Map<string, Set<string>>;
      private static readonly SetConstructor = () => new Set<string>();

      public static fromRulesToToken(parsing: PRule[]) {
            return parsing.filter(rule => rule.type).map(rule => rule.type!);
      }

      constructor(private readonly axiom: string, private readonly reductions: RRule[], parsing: string[]) {
            this.starters = this.getStartersSet(reductions, parsing);
            this.terminators = this.getTerminatorSet(reductions, parsing);
            this.terminators.getOrInsertComputed(axiom, MachineNet.SetConstructor).add(Reducer.NULL);

            for (let i = 0; i < reductions.length; i++) {
                  const rule = reductions[i].rule;
                  for (let j = 0; j < rule.length - 1; j++) {
                        this.addLookahead(rule[j], rule[j + 1]);
                  }
            }

            for (let i = 0; i < reductions.length; i++) {
                  this.table.getOrInsert(reductions[i].rule.at(-1)!, new Set()).add(reductions[i]);
            }
      }

      private addLookahead(token: string, next: string) {
            const terms = this.terminators.get(token);

            terms?.forEach(term => {
                  const lookahead = this.lookahead.getOrInsertComputed(term, MachineNet.SetConstructor);
                  this.lookahead.set(term, lookahead.union(this.starters.getOrInsertComputed(next, MachineNet.SetConstructor)));
            });

            const lookahead = this.lookahead.getOrInsertComputed(token, MachineNet.SetConstructor);
            this.lookahead.set(token, lookahead.union(this.starters.getOrInsertComputed(next, MachineNet.SetConstructor)));
      }

      private getMappedSet(mapper: (rule: RRule) => [string, string], reductions: RRule[], parsing: string[]) {
            const starters: Map<string, Set<string>> = new Map();
            parsing
                  .forEach(rule => 
                        starters
                              .getOrInsertComputed(rule, MachineNet.SetConstructor)
                              .add(rule)
                        );
            const rules: Map<string, string[]> = new Map();
            reductions
                  .map(mapper)
                  .filter(rule => rule[0] != rule[1])
                  .forEach(rule => 
                        rules
                              .getOrInsert(rule[0], [])
                              .push(rule[1])
                  );
            while (rules.size > 0) {
                  const iterable = new Map(rules);
                  iterable.forEach((rule,type) => {
                        let set = new Set<string>();

                        for (let i = 0; i < rule.length; i++) {
                              if (!starters.has(rule[i])) {
                                    return;
                              }
                              set = set.union(starters.get(rule[i])!);
                        }
                        rules.delete(type);
                        starters.set(type, set);
                  });
            }
            return starters;
      }
      private getTerminatorSet(reductions: RRule[], parsing: string[]): Map<string, Set<string>> {
            return this.getMappedSet(rule => [rule.reduction, rule.rule.at(-1)!], reductions, parsing);
      }

      private getStartersSet(reductions: RRule[], parsing: string[]): Map<string, Set<string>> {
            return this.getMappedSet(rule => [rule.reduction, rule.rule[0]], reductions, parsing);
      }
}