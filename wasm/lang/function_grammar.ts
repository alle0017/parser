import { Converter } from "../../src/ast/converter.ts";
import { Func, Ir, TypedSymbol } from "../../src/ast/ir.ts";
import { SemanticAction } from "../../grammar/semantic_action.ts";
import { Tokens } from "../grammar_gen.ts";
import { getFirstChildOfType, asPToken, keepChildrenOfTypes, getFirstAsString } from '../../src/parser/query.ts';

export class FunctionGrammar extends SemanticAction {
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.ARG, (self, token) => [new TypedSymbol(asPToken(getFirstChildOfType(token, Tokens.ID).get()).$, asPToken(getFirstChildOfType(token, Tokens.TYPE).get()).$)])
            .addRecursiveConversion(Tokens.ARG_LIST, (self, token) => self.convertAll(keepChildrenOfTypes(token, Tokens.ARG_LIST, Tokens.ARG)).flat() )
            .addRecursiveConversion(Tokens.FUNCTION, (self, token) => {
                  const name = getFirstAsString(token, Tokens.ID).get();
                  const type = getFirstAsString(token, Tokens.TYPE).get();
                  const args: TypedSymbol[] = [];
                  const optArgs = getFirstChildOfType(token, Tokens.ARG_LIST).map(args => self.convert(args) as TypedSymbol[])

                  if (optArgs.isPresent()) {
                        args.push(...optArgs.get());
                  }
                  return [
                        new Func(
                              new TypedSymbol(name,type), 
                              args, 
                              getFirstChildOfType(token, Tokens.CODE_BLOCK)
                              .map(token => self.convert(token))
                              .get()
                        )
                  ];
            })
      }
}