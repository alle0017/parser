import { Traverse } from "./ast/traverse.ts";
import type { PRule, RRule } from "./parser/index.d.ts";
import { Tokenizer } from './parser/tokenizer.ts';
import { PMachine } from './parser/index.d.ts';
import { Reducer } from './parser/reducer.ts';
import { ConsoleWriter, Diagnostics, Writer } from './diagnostics.ts';

export abstract class Grammar {
      public abstract getGrammarTokens(): PRule[];
      public getGrammarState(): string {
            return GrammarApplication.INITIAL_STATE;
      }
      public abstract getReductionRules(): RRule[];
      public abstract convert(traverser: Traverse): void;
}

export class GrammarApplication {
      public static readonly INITIAL_STATE = '-';
      private readonly grammars: Grammar[] = [];
      private readonly traverser: Traverse = new Traverse();
      public readonly diagnostics: Diagnostics;

      get program() {
            return this.traverser.program;
      }
      
      constructor(private readonly axiom: string, writer: Writer = new ConsoleWriter()) {
            this.diagnostics = new Diagnostics(writer);
      }

      public addGrammar(grammar: Grammar): this {
            this.grammars.push(grammar);
            return this;
      }

      public execute(code: string) {
            const machine: PMachine = {};
            const rules: PRule[] = [];

            for (let i = 0; i < this.grammars.length; i++) {
                  const state = this.grammars[i].getGrammarState();
                  const tokens = this.grammars[i].getGrammarTokens();
                  machine[state] = machine[state] ?? [];
                  machine[state].push(...tokens);
                  rules.push(...tokens);
            }
            const tokens = new Tokenizer(code).execute(GrammarApplication.INITIAL_STATE, machine).getTranslation();
            const ast = new Reducer(this.axiom, this.grammars.flatMap(gram => gram.getReductionRules()), rules).reduce(tokens);

            for (let i = 0; i < this.grammars.length; i++) {
                  this.grammars[i].convert(this.traverser);
            }
            this.traverser.convertAll(ast);
      }
}