/**
 * Primitive token produced by the tokenizer.
 *
 * - `type`: Identifier for the token kind (for example: 'IDENTIFIER', 'NUMBER').
 * - `$`: Raw matched text for the token.
 *
 * @example
 * const t: PToken = { type: 'NUMBER', $: '42' };
 */
export type PToken = {
      type: string,
      $: string
};

/**
 * A parser rule describing how to match input at the lexical/state level.
 *
 * - `regex`: A string representation of the regular expression used to match input
 *   (typically without surrounding slashes; the tokenizer may convert it to a RegExp).
 * - `type` (optional): The token type to emit when this rule matches.
 * - `next` (optional): The name of the state to transition to after a match.
 *
 * @example
 * const r: PRule = { regex: "\\d+", type: 'NUMBER' };
 */
export type PRule = {
      regex: string,
      type?: string,
      next?: string
};

/**
 * A parser state: an ordered array of `PRule` elements that are evaluated in sequence.
 *
 * @example
 * const state: PState = [ { regex: "\\s+" }, { regex: "[a-zA-Z_][a-zA-Z0-9_]*", type: 'IDENT' } ];
 */
export type PState = PRule[]

/**
 * The parser machine configuration mapping state names to `PState`.
 * Keys are state names (strings) and values are the arrays of rules used while in that state.
 *
 * @example
 * const machine: PMachine = { main: [ { regex: "\\w+", type: 'WORD' } ] };
 */
export type PMachine = Record<string,PState>;

/**
 * A reduction rule used by the reducer (parser's grammar rules).
 *
 * - `rule`: An ordered list of token type names (strings) that must match in sequence for
 *   this reduction to apply.
 * - `reduction`: The resulting non-terminal type produced when the rule is applied.
 *
 * @example
 * const rr: RRule = { rule: ['NUMBER', 'PLUS', 'NUMBER'], reduction: 'AddExpr' };
 */
export type RRule = {
      rule: string[],
      reduction: string
}

/**
 * A recursive token produced by reductions. Represents a non-terminal node in the AST.
 *
 * - `$`: Array of child tokens; each child is either a primitive `PToken` or another `RToken`.
 * - `type`: The non-terminal type/name produced by this reduction.
 *
 * @example
 * const t: RToken = { type: 'AddExpr', $: [ { type: 'NUMBER', $: '1' }, { type: 'PLUS', $: '+' }, { type: 'NUMBER', $: '2' } ] };
 */
export type RToken = {
      $: (PToken | RToken)[],
      type: string
}

/**
 * Union type for any token used by the parser: either a primitive `PToken` or a reduced `RToken`.
 */
export type Token = PToken | RToken