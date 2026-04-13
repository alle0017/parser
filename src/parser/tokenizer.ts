import { Parser, Translator } from "./parser.ts";
import type { PToken, PMachine } from "./index.d.ts";
import { NoValidTokenError } from "../exceptions/index.ts";


/**
 * Tokenizer
 *
 * A small finite-state tokenizer built on top of `Translator<PToken>`.
 *
 * The tokenizer consumes the input provided to the `Parser` base class and
 * produces an ordered list of `PToken` items by following a `PMachine` state
 * transition table. Each state is an array of rules; each rule contains a
 * `regex`, an optional `type` and a `next` state name.
 */
export class Tokenizer extends Translator<PToken> {
      /**
       * Anchor used to force regex matching at the current cursor position.
       * The implementation builds a regex like `^(:?regex)` and applies it to
       * `this.remaining()`, which effectively tests for a match anchored at
       * the current parser position.
       */
      private static readonly START_OF_LINE_ANCHOR = '^'

      /**
       * Attempt to match the provided regex at the current cursor position.
       *
       * The method composes a RegExp anchored with `START_OF_LINE_ANCHOR` and
       * executes it against `this.remaining()`. If a match is found the
       * function returns the length (in characters) of the matched text; if
       * no match is found it returns `0`.
       *
       * @param regex - a regex string (without anchors) describing the token
       * @returns number of characters matched at the current position
       */
      private match(regex: string): number {
            const match = this.remaining().match(new RegExp(Tokenizer.START_OF_LINE_ANCHOR + '(?:' + regex + ')'));

            if (match && match.length > 0) {
                  return match[0].length;
            }
            return 0;
      }

      /**
       * Execute tokenization using the provided state machine.
       *
       * Algorithm (high level):
       * - Start from `machine[init]` (an array of rules for the initial state).
       * - While input remains:
       *   - Try each rule's regex and pick the longest match (classic "maximal
       *     munch" strategy).
       *   - If no rule matches, throw an error indicating an invalid sequence.
       *   - Consume the matched characters from the input and build the token
       *     text (`$`). If the winning rule has a `type`, push a `PToken`.
       *   - Transition to the rule's `next` state and repeat.
       *
       * @param init - name of the initial state in the machine
       * @param machine - the `PMachine` state table describing token rules
       * @returns this tokenizer instance (useful for chaining)
       */
      public execute(init: string, machine: PMachine): this {
            let current = machine[init];
            while (!this.ccIn(Parser.TERMINAL)) {
                  const matches: number[] = [];
                  let max = 0;

                  for (let i = 0; i < current.length; i++) {
                        matches.push(this.match(current[i].regex));
                        if (matches[i] > matches[max]) {
                              max = i;
                        }
                  }
                  if (matches[max] <= 0) {
                        throw new NoValidTokenError(this.remaining());
                  }
                  
                  // Collect the matched characters into `$` and advance the cursor
                  let $ = '';
                  for (let i = 0; i < matches[max]; i++) {
                        $ += this.cc();
                        this.next();
                  }

                  // If a type is associated with the winning rule, emit a token
                  if (current[max].type) {
                        this.push({ type: current[max].type!, $ });
                  }
                  if (current[max].next) { 
                        // Transition to the next state's rule set
                        current = machine[current[max].next!];
                  }
            }
            return this;
      }
}
