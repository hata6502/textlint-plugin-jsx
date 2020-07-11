import { ASTNodeTypes } from '@textlint/ast-node-types'
import type { TxtParentNode } from '@textlint/ast-node-types'
import type {
  TextlintPluginOptions,
  TextlintPluginProcessor
} from '@textlint/types'
import * as ts from 'typescript'

const jsxToAST = (node: ts.Node): TxtParentNode => {
  const startLineAndCharacter = node
    .getSourceFile()
    .getLineAndCharacterOfPosition(node.pos)
  const endLineAndCharacter = node
    .getSourceFile()
    .getLineAndCharacterOfPosition(node.end)

  const children: TxtParentNode[] = []

  node.forEachChild((child) => {
    const txtChildNode = jsxToAST(child)

    if (
      txtChildNode.type !== ASTNodeTypes.Str &&
      txtChildNode.children.length === 0
    ) {
      return
    }

    children.push(txtChildNode)
  })

  return {
    // TODO: Implement map for all SyntaxKinds.
    type: node.kind === ts.SyntaxKind.SourceFile
      ? ASTNodeTypes.Document
      : node.kind === ts.SyntaxKind.JsxText
        ? ASTNodeTypes.Str
        : ASTNodeTypes.Html,
    raw: node.getText(),
    range: [node.pos, node.end],
    loc: {
      start: {
        column: startLineAndCharacter.character,
        line: startLineAndCharacter.line + 1
      },
      end: {
        column: endLineAndCharacter.character,
        line: endLineAndCharacter.line + 1
      }
    },
    children
  }
}

class JSXProcessor implements TextlintPluginProcessor {
  extensions: string[];

  constructor (options?: TextlintPluginOptions) {
    this.extensions = options?.extensions ?? []
  }

  availableExtensions () {
    return ['.js', '.jsx', '.ts', '.tsx', ...this.extensions]
  }

  processor () {
    return {
      preProcess (text: string, filePath?: string) {
        const sourceFile = ts.createSourceFile(
          filePath ?? 'foo.tsx',
          text,
          ts.ScriptTarget.Latest,
          true
        )

        return jsxToAST(sourceFile)
      },
      postProcess (messages: any[], filePath?: string) {
        return {
          messages,
          filePath: filePath ?? '<jsx>'
        }
      }
    }
  }
}

export default JSXProcessor
