/**
 * Base AST node.
 *
 * Subclasses implement whether they have children and provide accessors to
 * manipulate child nodes. This abstract API allows tree transformations to
 * operate on nodes without knowledge of concrete implementations.
 */
export abstract class Node {
      /**
       * Returns `true` when the node contains child nodes.
       */
      public abstract hasChildren(): boolean;
      /**
       * Retrieve the node's children as a read-only array.
       */
      public abstract getChildren(): readonly Node[];
      /**
       * Replace the node's children with the provided array.
       *
       * @param nodes - new children for the node
       * @returns `this` for chaining
       */
      public abstract setChildren(nodes: Node[]): this;
}     

/**
 * Leaf nodes never contain children. Calls to child accessors throw to
 * signal invalid manipulation attempts.
 */
export abstract class Leaf extends Node {
      public override hasChildren(): boolean {
            return false;
      }
      public override getChildren(): readonly Node[] {
            throw new Error("invalid access to children: Leafs doesn't have any children");
      }
      public override setChildren(nodes: Node[]): this {
            throw new Error("invalid access to children: Leafs doesn't have any children");
      }
}

/**
 * Branch nodes contain a mutable list of `children` and provide helpers to
 * update, remove or append child nodes. Methods return `this` to allow
 * fluent modifications during tree transformations.
 */
export abstract class Branch extends Node {
      public constructor(protected children: Node[]) {
            super();
      }
      public override hasChildren(): boolean {
            return true;
      }
      public override getChildren(): readonly Node[] {
            return this.children;
      }
      /**
       * Replace a child node with another node. If the `child` appears
       * multiple times, each occurrence is replaced.
       */
      public replace(child: Node, replacement: Node): this {
            for (let i = 0; i < this.children.length; i++) {
                  if (this.children[i] == child) {
                        this.children[i] = replacement;
                  }
            }
            return this;
      }
      /**
       * Remove the provided child from this branch.
       */
      public remove(child: Node): this {
            this.children = this.children.filter(c => c != child);    
            return this;
      }
      /**
       * Append one or more children to the end of the current children list.
       */
      public append(...children: Node[]): this {
            this.children.push(...children);
            return this;
      }     
      public override setChildren(nodes: Node[]): this {
            this.children = nodes;
            return this;
      }
}


