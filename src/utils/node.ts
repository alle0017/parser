import { Optional } from "./optional.ts";

export class Node<T> {
      public predecessor: Optional<Node<T>> = Optional.empty();
      constructor(public readonly value: T, public readonly next: Node<T>[]) {}
      public append(node: Node<T>) {
            this.next.push(node);
            this.predecessor = Optional.of(node);
      }
}