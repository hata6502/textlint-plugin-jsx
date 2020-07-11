import { ASTNodeTypes } from '@textlint/ast-node-types'
import type { TxtParentNode } from '@textlint/ast-node-types'
import type {
  TextlintPluginCreator,
  TextlintPluginOptions,
  TextlintPluginProcessor,
} from '@textlint/types'
import * as ts from 'typescript'

const jsxToAST = (node: ts.Node): TxtParentNode => {
  const startLineAndCharacter = node
    .getSourceFile()
    .getLineAndCharacterOfPosition(node.pos)
  const endLineAndCharacter = node
    .getSourceFile()
    .getLineAndCharacterOfPosition(node.end)

  return {
    // TODO: Implement map for all SyntaxKinds.
    type:
      node.kind === ts.SyntaxKind.JsxText
        ? ASTNodeTypes.Str
        : ASTNodeTypes.HtmlBlock,
    raw: node.getText(),
    range: [node.pos, node.end],
    loc: {
      start: {
        column: startLineAndCharacter.character,
        line: startLineAndCharacter.line + 1,
      },
      end: {
        column: endLineAndCharacter.character,
        line: endLineAndCharacter.line + 1,
      },
    },
    children: node.getChildren().map(jsxToAST),
  }
}

class JSXProcessor implements TextlintPluginProcessor {
  extensions: string[]

  constructor(options?: TextlintPluginOptions) {
    this.extensions = options?.extensions ?? []
  }

  availableExtensions() {
    return ['.jsx', '.tsx', ...this.extensions]
  }

  processor() {
    return {
      preProcess(text: string, filePath?: string) {
        const sourceFile = ts.createSourceFile(
          filePath ?? 'foo.tsx',
          text,
          ts.ScriptTarget.Latest,
          true
        )

        return jsxToAST(sourceFile)
      },
      postProcess(messages: any[], filePath?: string) {
        return {
          messages,
          filePath: filePath ?? '<jsx>',
        }
      },
    }
  }
}

const creator: TextlintPluginCreator = {
  Processor: JSXProcessor,
}

export default creator
