import type { PRule, RRule, Token } from "./parser/index.d.ts";
import { Tokenizer } from './parser/tokenizer.ts';
import { PMachine } from './parser/index.d.ts';
import { Reducer, printTree } from './parser/reducer.ts';
import { ConsoleWriter, Diagnostics, Writer } from './diagnostics.ts';
import { Ir, } from "./ast/ir.ts";
import { Program } from "./ast/program.ts";
import { Converter } from "./ast/converter.ts";
export type Class<T> = new () => T
export abstract class Grammar {
      public abstract getGrammarTokens(): PRule[];
      public getGrammarState(): string {
            return GrammarApplication.INITIAL_STATE;
      }
      public abstract getReductionRules(): RRule[];
      public abstract convert(converter: Converter<Ir[]>): void;
}

export class GrammarApplication {
      public static readonly INITIAL_STATE = '-';
      private readonly grammars: Class<Grammar>[] = [];
      private readonly converter: Converter<Ir[]> = new Converter();
      public readonly diagnostics: Diagnostics;
      
      constructor(private readonly axiom: string, writer: Writer = new ConsoleWriter()) {
            this.diagnostics = new Diagnostics(writer);
      }
      public addGrammar(grammar: Class<Grammar>): this {
            this.grammars.push(grammar);
            return this;
      }

      public execute(code: string, print: boolean = false) {
            const machine: PMachine = {};
            const rules: PRule[] = [];
            const program = new Program();
            const grammars = this.grammars.map(g => new g());

            for (let i = 0; i < grammars.length; i++) {
                  const state = grammars[i].getGrammarState();
                  const tokens = grammars[i].getGrammarTokens();
                  machine[state] = machine[state] ?? [];
                  machine[state].push(...tokens);
                  rules.push(...tokens);
            }
            const tokens = new Tokenizer(code).execute(GrammarApplication.INITIAL_STATE, machine).getTranslation();
            const ast = new Reducer(this.axiom, grammars.flatMap(gram => gram.getReductionRules()), rules).reduce(tokens);

            if (print) {
                  printTree(ast);
            }
            
            for (let i = 0; i < grammars.length; i++) {
                  grammars[i].convert(this.converter);
            }
            const ir = this.converter.convertAll(ast).flat();
            for (let i = 0; i < ir.length; i++) {
                  program.addInstruction(ir[i]);
            }
            return program;
      }
}

export function registerAll(axiom: string, grammars: Class<Grammar>[]) {
      const app = new GrammarApplication(axiom);

      for (let i = 0; i < grammars.length; i++) {
            app.addGrammar(grammars[i]);
      }
      return app;
}