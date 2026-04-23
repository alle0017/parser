import { Optional } from "./optional.ts";

export class Node<T> {
      public predecessor: Optional<Node<T>> = Optional.empty();
      constructor(public readonly value: T, public readonly next: Node<T>[]) {}
      public append(node: Node<T>) {
            this.next.push(node);
            this.predecessor = Optional.of(node);
      }

      public forEach(callback: (value: T) => void) {
            const stack: Node<T>[] = [this];

            while (stack.length > 0) {
                  const curr = stack.shift()!;

                  callback(curr.value);

                  for (let i = 0; i < curr.next.length; i++) {
                        stack.push(curr.next[i]);
                  }
            }
      }
}