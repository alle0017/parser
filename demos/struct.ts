import { Tokenizer } from "../src/parser/tokenizer.ts";
import { Branch, Leaf, Node, } from "../src/ast/node.ts";
import { Reducer } from "../src/parser/reducer.ts";
import { Converter } from "../src/ast/converter.ts";
import { PRule, RRule } from "../src/parser/index.d.ts";
import { TokenNotRecognizedError } from "../src/exceptions/index.ts";
import { IRConverter, Program, Instruction, } from "../src/ast/program.ts";

class AttrNode extends Branch {
      constructor(public readonly name: Node, public readonly type: Node) {
            super([name, type])
      }
      public getType(): string {
            return (this.type as IdNode).value;
      }
      public getName(): string {
            return (this.name as IdNode).value;
      }
      public override toInstruction(): Iterable<Instruction> {
            return [];
      }
}     

class IdNode extends Leaf {
      constructor(public readonly value: string) {
            super();
      }
      public override toInstruction(): Iterable<Instruction> {
            return [];
      }
}
class AttrListNode extends Branch {
      constructor(public readonly attribute: Node, public readonly next?: Node) {
            super([attribute]);
            if (next) {
                  this.append(next);
            }
      }
      public override toInstruction(): Iterable<Instruction> {
            return [];
      }
}
class StructNode extends Branch {
      public readonly attr: Node;
      constructor(public readonly name: Node, attr: Node) {
            const canary = new AttrListNode(new AttrNode(new IdNode('canary'), new IdNode('flag_t')), attr);
            super([name, canary]);
            this.attr = canary; 
      }
      public override * toInstruction(program: Program): IterableIterator<Instruction> {
            let curr: AttrListNode | undefined = this.attr as AttrListNode;

            while (curr) {
                  const name = (curr.attribute as AttrNode).getName();
                  const type = (curr.attribute as AttrNode).getType();
                  curr = curr.next as AttrListNode;
                  yield new AllocInstr(program, type, name);
            }

      }
}


const GRAMMAR: PRule[] = [
      { regex: 'type', type: 'T_KEY' },
      { regex: '[a-zA-Z][a-zA-Z0-9_]*', type: 'ID' },
      { regex: '{', type: 'L_BRACKET' },
      { regex: '}', type: 'R_BRACKET' },
      { regex: ':', type: 'COLUMN' },
      { regex: ',', type: 'COMMA' },
      { regex: ' ' }
];

const REDUCTION: RRule[] =  [
      { reduction: 'ATTR', rule: ['ID', 'COLUMN', 'ID'] },
      { reduction: 'ATTR_L', rule: ['ATTR'] },
      { reduction: 'ATTR_L', rule: ['ATTR_L', 'COMMA', 'ATTR'] },
      { reduction: 'STRUCT', rule: ['T_KEY', 'ID', 'L_BRACKET', 'ATTR_L', 'R_BRACKET'] },
]

const tokens = new Tokenizer('type Struct { id: int, value: string }').execute('INIT', { INIT: GRAMMAR }).getTranslation();
const ast = new Reducer(REDUCTION, GRAMMAR).reduce(tokens);
const converter = new Converter()
.addConversion('ID', (_, token) => new IdNode(token.$ as string))
.addConversion('ATTR_L', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      return token.$.length == 3 ? 
            new AttrListNode(self.convert(token.$[2]), self.convert(token.$[0])): 
            new AttrListNode(self.convert(token.$[0]));
})
.addConversion('ATTR', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      return new AttrNode(self.convert(token.$[0]), self.convert(token.$[2]))
})
.addConversion('STRUCT', (self, token) => {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      return new StructNode(self.convert(token.$[1]), self.convert(token.$[3]))
})

class AllocInstr extends Instruction {
      private static registry = 0;
      private readonly reg;

      public constructor(program: Program, private readonly type: string, private readonly name: string) {
            super(program, program.createLabel());
            this.addSuccessor(program.getNextLabel())
            this.reg = AllocInstr.registry++;
      }
      public override toString() {
            return `%${this.reg} = alloc ${this.type}(Symbol.${this.name})`
      }
}
const ir = new IRConverter().convert(converter.convertAll(ast));



console.log(ir.map(ir => ir.toString()).join('\n'))