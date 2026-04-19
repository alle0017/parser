import { Grammar } from "../src/grammar.ts";
import { PRule, RRule } from "../src/parser/index.d.ts";

export abstract class SemanticAction extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [];
      }
      public override getReductionRules(): RRule[] {
            return [];
      }
}