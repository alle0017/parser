/**
 * Represents a container object which may or may not contain a non-null value.
 *
 * Use {@link Optional.of} when the value is guaranteed to be present, and
 * {@link Optional.ofNullable} when the value may be null or undefined.
 *
 * @typeParam T - The type of the contained value.
 */
export class Optional<T> {
      /**
       * Creates an {@link Optional} containing the provided non-null value.
       *
       * @typeParam T - The type of the value.
       * @param value - The value to wrap.
       * @returns An {@link Optional} containing `value`.
       * @throws {Error} If `value` is `null` or `undefined`.
       */
      public static of<T>(value: T): Optional<T> {
            if (value == null) {
                  throw new Error('cannot pass null as argument for Optional.of method. prefer the use of Optional.ofNullable');
            }
            return new Optional(value);
      }
      /**
       * Creates an {@link Optional} that may contain a nullable value.
       *
       * Unlike {@link Optional.of}, this method accepts `null` and `undefined`.
       *
       * @typeParam T - The type of the value.
       * @param value - The value to wrap, if any.
       * @returns An {@link Optional} containing `value`, or an empty optional if it is nullish.
       */
      public static ofNullable<T>(value: T): Optional<T> {
            return new Optional(value);
      }
      /**
       * Creates an empty {@link Optional} instance.
       *
       * @typeParam T - The expected contained type.
       * @returns An empty {@link Optional}.
       */
      public static empty<T>(): Optional<T> {
            return new Optional<T>(null);
      }

      private constructor(private readonly value: T | null) {}
      /**
       * Returns this optional if the predicate matches the contained value.
       * Otherwise, returns an empty optional.
       *
       * If the optional is empty, the same empty instance is returned.
       *
       * @param lambda - Predicate used to evaluate the contained value.
       * @returns This optional if the predicate returns `true`; otherwise an empty optional.
       */
      public filter(lambda: (val: T) => boolean): Optional<T> {
            if (this.value == null) {
                  return this;
            }
            return lambda(this.value) ? this: Optional.empty();
      }
      /**
       * Executes the provided function if a value is present.
       *
       * If this optional is empty, the callback is not invoked.
       *
       * @param lambda - Function to execute with the contained value.
       * @returns This optional instance for chaining.
       */
      public ifPresent(lambda: (val: T) => void): this {
            if (this.value == null) {
                  return this;
            }
            lambda(this.value);
            return this;
      }
      /**
       * Checks whether this optional is empty.
       *
       * @returns `true` if no value is present; otherwise `false`.
       */
      public empty(): boolean {
            return this.value == null;
      }
      /**
       * Checks whether this optional contains a value.
       *
       * @returns `true` if a value is present; otherwise `false`.
       */
      public isPresent(): boolean {
            return this.value != null;
      }
      /**
       * Retrieves the contained value.
       *
       * @returns The contained value.
       * @throws {Error} If this optional is empty.
       */
      public get(): T {
            if (this.value == null) {
                  throw new Error('found empty optional');
            }
            return this.value;
      }
      /**
       * Transforms the contained value using the provided mapping function.
       *
       * If this optional is empty, an empty optional is returned.
       * If the mapping function returns `null` or `undefined`, the result will be
       * wrapped using {@link Optional.of}, which will throw.
       *
       * @typeParam K - The mapped value type.
       * @param lambda - Mapping function applied to the contained value.
       * @returns An optional containing the mapped value, or an empty optional.
       */
      public map<K>(lambda: (value: T) => K): Optional<K> {
            return this.value == null ? Optional.empty(): Optional.of(lambda(this.value));
      }
      /**
       * Returns the contained value if present, otherwise returns the supplied fallback.
       *
       * @param value - Fallback value to return when this optional is empty.
       * @returns The contained value or `value`.
       */
      public orElse(value: T): T {
            return this.value ?? value;
      }
      /**
       * Returns the contained value if present, otherwise computes a fallback value.
       *
       * @param value - Supplier function used to produce a fallback value.
       * @returns The contained value or the result of `value()`.
       */
      public orElseGet(value: () => T): T {
            return this.value ?? value();
      }
      /**
       * Returns the contained value if present, otherwise throws the supplied error.
       *
       * @param lambda - Function that creates the error to throw when empty.
       * @returns The contained value.
       * @throws {Error} The error returned by `lambda` when this optional is empty.
       */
      public orElseThrow(lambda: () => Error): T {
            if (this.value == null) {
                  throw lambda();
            }
            return this.value;
      }

}