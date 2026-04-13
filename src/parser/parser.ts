/**
 * Load and parse a JSON file resolved relative to the current module.
 *
 * This helper resolves the provided `file` path using `import.meta.resolve`
 * and performs a `fetch` to read and parse the JSON content. It is
 * intentionally generic so callers can request a typed JSON result.
 *
 * Remarks:
 * - This function requires an environment that exposes `import.meta.resolve`
 *   and `fetch` (for example, Deno). In Node.js a different loading strategy
 *   would be necessary.
 *
 * @template T - expected JSON shape returned by the file
 * @param {string} file - path to the JSON file (module-relative)
 * @returns {Promise<T>} resolved and parsed JSON content
 */
export async function jsonScheme<T>(file: string): Promise<T> {
      // @ts-ignore: some runtimes (Deno) provide import.meta.resolve
      const res = await fetch(import.meta.resolve(file));
      return await res.json();
}

/**
 * Abstract streaming parser base class.
 *
 * Extend `Parser` to implement grammar-specific parsing routines. The class
 * maintains a single cursor (`idx`) into the input `text` and exposes a small
 * set of protected helpers that make it easy to inspect and consume input
 * without exposing the internal cursor directly.
 *
 * Subclasses should call these protected helpers from their parsing methods:
 * - `cc()` to read the current character without advancing.
 * - `next()` to advance the cursor and obtain the next character.
 * - `remaining()` to obtain the substring from the current position.
 * - `ccIn(...)` to test membership against a small set of characters.
 */
export abstract class Parser {
      /**
       * Sentinel value returned when the parser has reached end-of-input.
       */
      protected static readonly TERMINAL = '\0';

      /**
       * Current zero-based index into `text`.
       * Kept private so subclasses cannot accidentally mutate it.
       */
      private idx: number = 0;

      /**
       * Create a parser over the provided input `text`.
       * @param text - the full input the parser will consume
       */
      constructor(private readonly text: string) {

      }

      /**
       * Return the current character at the cursor without advancing. If the
       * cursor is at or beyond the end of the input, returns `TERMINAL`.
       *
       * @protected
       * @returns {string} current character or `TERMINAL`
       */
      protected cc(): string {
            if (this.idx >= this.text.length) {
                  return Parser.TERMINAL;
            }
            return this.text[this.idx];
      }

      /**
       * Return the remaining input from the current cursor position. If at the
       * end, returns `TERMINAL` to signal no more input.
       *
       * @protected
       * @returns {string} substring from cursor or `TERMINAL`
       */
      protected remaining(): string {
            if (this.idx >= this.text.length) {
                  return Parser.TERMINAL;
            }
            return this.text.slice(this.idx);
      }

      /**
       * Advance the cursor by one position and return the new current
       * character (or `TERMINAL` if we've moved past the end).
       *
       * Note: callers should ensure they do not advance past the logical end
       * of a token if they rely on index positions for slicing.
       *
       * @protected
       * @returns new current character after advancing
       */
      protected next() {
            this.idx++;
            return this.cc();
      }

      /**
       * Check whether the current character matches any of the provided
       * characters. This is a convenience helper often used when building
       * finite-state style recognizers.
       *
       * @protected
       * @param {...string} chars - characters to compare against the current char
       * @returns {boolean} true if current char equals any of `chars`
       */
      protected ccIn(...chars: string[]): boolean {
            const char = this.cc();
            for (let i = 0; i < chars.length; i++) {
                  if (char === chars[i]) {
                        return true;
                  }
            }
            return false;
      }
}

/**
 * `Translator<T>` is a small helper on top of `Parser` that collects typed
 * translation results while parsing. Subclasses perform parsing and call
 * `push(...)` to append translation items to an internal buffer. Once parsing
 * completes, call `getTranslation()` to retrieve the accumulated results.
 */
export abstract class Translator<T> extends Parser {
      /** Buffer that accumulates translation results produced during parsing. */
      private readonly buffer: T[] = [];

      /**
       * Append a translation result to the internal buffer and return `this`
       * to allow fluent chaining from parsing routines.
       *
       * @protected
       * @param translation - item to append to the translation buffer
       * @returns {this} the translator instance for chaining
       */
      protected push(translation: T): this {
            this.buffer.push(translation);
            return this;
      }     

      /**
       * Retrieve the collected translation items. Call after parsing is
       * complete to access the results.
       *
       * @returns {T[]} accumulated translations in insertion order
       */
      public getTranslation(): T[] {
            return this.buffer;
      }
}