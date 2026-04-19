import { readFileSync, writeFileSync } from "node:fs";
import { Converter } from "../src/ast/converter.ts";
import { Ir, Symbol } from "../src/ast/ir.ts";
import { Grammar, registerAll } from "../src/grammar.ts";
import type { PRule, RRule } from "../src/parser/index.d.ts";

enum Tokens {
      Axiom = 'Axiom', 
      Skip = 'Skip',
      Reduction = 'Reduction',
      Token = 'Token',
      Id = 'ID',
      Regex = 'regex',
      RAxiom = 'red_axiom',
      RSkip = 'red_skip',
      RReduction = 'red_reduction',
      RToken = 'red_token',
      Expression = 'expression',
      ExpressionList = 'expression_list',
}
type Syntax = {
      tokens: PRule[],
      reductions: RRule[],
      axiom: string,
};

abstract class GrammarIr extends Ir {
      abstract convert(syntax: Syntax): void;
}
class RegexOp extends Ir {
      public readonly regex: string;

      constructor(regex: string) { 
            super(); 
            this.regex = regex.substring(1, regex.length - 1) 
      }
      public override toString(): string {
            return `regex {${this.regex}}`;
      }
}

class Token extends GrammarIr {
      constructor(private readonly id: Symbol, private readonly regex: RegexOp) { super() }
      public override toString(): string {
            return `@token ${this.id} ${this.regex.toString()}`;
      }
      override convert(syntax: Syntax): void {
            syntax.tokens.push({
                  type: this.id.value,
                  regex: this.regex.regex
            });
      }
}

class Axiom extends GrammarIr {
      constructor(private readonly id: Symbol) { super() }
      public override toString(): string {
            return `@axiom ${this.id}`;
      }
      override convert(syntax: Syntax): void {
            syntax.axiom = this.id.value;
      }
}

class Reduction extends GrammarIr {
      constructor(private readonly id: Symbol, private readonly regex: RegexOp) { super() }
      public override toString(): string {
            return `@reduction ${this.id} ${this.regex.toString()}`;
      }
      override convert(syntax: Syntax): void {
            const rules = this.regex.regex.split('|').map(rule => rule.split(' ').map(token => token.trim()).filter(tok => tok.length > 0));
            
            for (const rule of rules) {
                  syntax.reductions.push({
                        rule,
                        reduction: this.id.value
                  });
            }
      }
}

class DefinitionGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [
                  { regex: 'axiom', type: Tokens.Axiom },
                  { regex: 'skip', type: Tokens.Skip },
                  { regex: 'reduction', type: Tokens.Reduction },
                  { regex: 'token', type: Tokens.Token },
                  { regex: '[A-Z][A-Z0-9_]*', type: Tokens.Id},
                  { regex: '("[^"]+"|\'[^\']+\')', type: Tokens.Regex },
                  { regex: '[ \t\n\r]+' },
            ]
      }
      public override getReductionRules(): RRule[] {
            return [
                  { rule: [Tokens.Skip, Tokens.Regex], reduction: Tokens.RSkip },
                  { rule: [Tokens.Reduction, Tokens.Id, Tokens.Regex], reduction: Tokens.RReduction },
                  { rule: [Tokens.Token, Tokens.Id, Tokens.Regex], reduction: Tokens.RToken },
                  { rule: [Tokens.Axiom, Tokens.Id], reduction: Tokens.RAxiom },
                  { rule: [Tokens.RAxiom], reduction: Tokens.Expression },
                  { rule: [Tokens.RReduction], reduction: Tokens.Expression },
                  { rule: [Tokens.RToken], reduction: Tokens.Expression },
                  { rule: [Tokens.RSkip], reduction: Tokens.Expression },
                  { rule: [Tokens.Expression], reduction: Tokens.ExpressionList },
                  { rule: [Tokens.ExpressionList, Tokens.Expression], reduction: Tokens.ExpressionList },
            ]
      }
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.ExpressionList, (self, token) => self.convertAll(token.$).flat())
            .addRecursiveConversion(Tokens.Expression, (self, token) => self.convertAll(token.$).flat())
            .addRecursiveConversion(Tokens.RToken, (self, token) => [new Token(self.convert(token.$[1])[0] as Symbol, self.convert(token.$[2])[0] as RegexOp)])
            .addRecursiveConversion(Tokens.RReduction, (self, token) => [new Reduction(self.convert(token.$[1])[0] as Symbol, self.convert(token.$[2])[0] as RegexOp)])
            .addRecursiveConversion(Tokens.RSkip, (self, token) => [new Token(Symbol.from(''), self.convert(token.$[1])[0] as RegexOp)])
            .addRecursiveConversion(Tokens.RAxiom, (self, token) => [new Axiom(self.convert(token.$[1])[0] as Symbol)])
            .addTerminalConversion(Tokens.Id, (_,token) => [Symbol.from(token.$)])
            .addTerminalConversion(Tokens.Regex, (_,token) => [new RegexOp(token.$)])
      }
}


function syntaxToString(syntax: Syntax, lib: string) {
      const enumTokens = [...new Set(syntax
                        .reductions
                        .map(token => `${token.reduction} = "${token.reduction}"`)
                        .concat(
                              syntax
                              .tokens
                              .filter(t => t.type)
                              .map(token => `${token.type!} = "${token.type!}"`)
                        ))].join(',\n')
      return `
import { Converter } from "${lib}src/ast/converter.ts";
import { Ir, } from "${lib}src/ast/ir.ts";
import { Grammar, GrammarApplication } from "${lib}src/grammar.ts";
import type { PRule, RRule } from "${lib}src/parser/index.d.ts";
export enum Tokens {
      ${enumTokens}
}
export class Syntax extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return ${JSON.stringify(syntax.tokens)}
      }
      public override getReductionRules(): RRule[] {
            return ${JSON.stringify(syntax.reductions)}
      }
      public override convert(traverser: Converter<Ir[]>): void {}     
}
export function useSyntax() {
      const app = new GrammarApplication("${syntax.axiom}");
      app.addGrammar(Syntax)
      return app;
}
      `;
}
export function generateGrammar(file: string, lib: string = './') {
      const grammar = readFileSync(file, 'utf8');
      const program = registerAll(Tokens.ExpressionList, [DefinitionGrammar]).execute(grammar)
      const syntax: Syntax = {
            tokens: [],
            reductions: [],
            axiom: '',
      };
      
      (program.toIr() as GrammarIr[]).forEach(token => token.convert(syntax))
      const classFile = syntaxToString(syntax, lib);
      writeFileSync('./grammar_gen.ts', classFile);
}
