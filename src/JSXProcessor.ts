import { ASTNodeTypes } from '@textlint/ast-node-types';
import type {
  TxtNode,
  TxtParentNode,
  TxtTextNode,
} from '@textlint/ast-node-types';
import type {
  TextlintPluginOptions,
  TextlintPluginProcessor,
} from '@textlint/types';
import * as ts from 'typescript';

const jsxToAST = (node: ts.Node) => {
  const startLineAndCharacter = node
    .getSourceFile()
    .getLineAndCharacterOfPosition(node.pos);
  const endLineAndCharacter = node
    .getSourceFile()
    .getLineAndCharacterOfPosition(node.end);

  const children: TxtNode[] = [];

  node.forEachChild((child) => {
    const txtChildNode = jsxToAST(child);

    if (
      txtChildNode.type !== ASTNodeTypes.Str &&
      txtChildNode.children.length === 0
    ) {
      return;
    }

    children.push(txtChildNode);
  });

  const range: [number, number] = [node.pos, node.end];
  const txtPartialNode = {
    raw: node.getText(),
    range,
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
  };

  // TODO: Implement map for all SyntaxKinds.
  switch (node.kind) {
    case ts.SyntaxKind.SourceFile: {
      const txtNode: TxtParentNode = {
        ...txtPartialNode,
        type: ASTNodeTypes.Document,
        children,
      };

      return txtNode;
    }
    case ts.SyntaxKind.JsxText: {
      const txtNode: TxtTextNode = {
        ...txtPartialNode,
        type: ASTNodeTypes.Str,
        value: node.getText(),
      };

      return txtNode;
    }
    default: {
      const txtNode: TxtParentNode = {
        ...txtPartialNode,
        type: ASTNodeTypes.HtmlBlock,
        children,
      };

      return txtNode;
    }
  }
};

class JSXProcessor implements TextlintPluginProcessor {
  extensions: string[];

  constructor(options?: TextlintPluginOptions) {
    this.extensions = options?.extensions ?? [];
  }

  availableExtensions() {
    return ['.jsx', '.tsx', ...this.extensions];
  }

  processor() {
    return {
      preProcess(text: string) {
        const sourceFile = ts.createSourceFile(
          'foo.tsx',
          text,
          ts.ScriptTarget.Latest,
          true
        );

        return jsxToAST(sourceFile) as TxtParentNode;
      },
      postProcess(messages: any[], filePath?: string) {
        return {
          messages,
          filePath: filePath ?? '<jsx>',
        };
      },
    };
  }
}

export default JSXProcessor;
