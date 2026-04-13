export abstract class Node {
      public abstract hasChildren(): boolean;
      public abstract getChildren(): readonly Node[];
      public abstract setChildren(nodes: Node[]): this;
}     

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
      public replace(child: Node, replacement: Node): this {
            for (let i = 0; i < this.children.length; i++) {
                  if (this.children[i] == child) {
                        this.children[i] = replacement;
                  }
            }
            return this;
      }
      public remove(child: Node): this {
            this.children = this.children.filter(c => c != child);    
            return this;
      }
      public append(...children: Node[]): this {
            this.children.push(...children);
            return this;
      }     
      public override setChildren(nodes: Node[]): this {
            this.children = nodes;
            return this;
      }
}


