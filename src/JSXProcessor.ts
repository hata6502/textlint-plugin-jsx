import { ASTNodeTypes } from "@textlint/ast-node-types";
import type {
  TxtNode,
  TxtParentNode,
  TxtTextNode,
} from "@textlint/ast-node-types";
import type {
  TextlintPluginOptions,
  TextlintPluginProcessor,
} from "@textlint/types";
import * as ts from "typescript";

const extractCommentNodes = (node: ts.Node): TxtNode[] => {
  const commentRanges = ts.getLeadingCommentRanges(
    node.getSourceFile().getFullText(),
    node.pos,
  );

  if (!commentRanges) {
    return [];
  }

  return commentRanges.map((range) => {
    const text = node.getSourceFile().getFullText().slice(range.pos, range.end);
    const start = ts.getLineAndCharacterOfPosition(
      node.getSourceFile(),
      range.pos,
    );
    const end = ts.getLineAndCharacterOfPosition(
      node.getSourceFile(),
      range.end,
    );
    let comment = text;

    if (text.startsWith("//")) {
      // single line comment
      comment = text.replace(/^\/\//, "");
    } else if (text.startsWith("/*")) {
      // multi line comment
      comment = text.replace(/^\/\*/, "").replace(/\*\/$/, "");
    }

    return {
      raw: text,
      range: [range.pos, range.end],
      type: ASTNodeTypes.Comment,
      value: comment,
      loc: {
        start: {
          column: start.character,
          line: start.line + 1,
        },
        end: {
          column: end.character,
          line: end.line + 1,
        },
      },
    };
  });
};

// A list of ts.SyntaxKind that the parsing of comments at the parent node is skipped. Comments should be parsed at the child node.
const ignoredCommentKinds = [ts.SyntaxKind.SourceFile];

function trimQuotes(str: string): string {
  if (str.length < 2) {
    return str;
  }
  if (str[0] !== `"` && str[0] !== `'`) {
    return str;
  }
  if (str[0] !== str[str.length - 1]) {
    return str;
  }
  return str.slice(1, -1);
}

const jsxToAST = (node: ts.Node) => {
  const startLineAndCharacter = node
    .getSourceFile()
    .getLineAndCharacterOfPosition(node.pos);
  const endLineAndCharacter = node
    .getSourceFile()
    .getLineAndCharacterOfPosition(node.end);

  const children: TxtNode[] = [];

  if (!ignoredCommentKinds.includes(node.kind)) {
    children.push(...extractCommentNodes(node));
  }

  node.forEachChild((child) => {
    const txtChildNode = jsxToAST(child);

    if ("children" in txtChildNode && !txtChildNode.children.length) {
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
      return {
        ...txtPartialNode,
        type: ASTNodeTypes.Document,
        children,
      } satisfies TxtParentNode;
    }

    case ts.SyntaxKind.JsxText: {
      return {
        ...txtPartialNode,
        type: ASTNodeTypes.Str,
        value: node.getText(),
      } satisfies TxtTextNode;
    }

    case ts.SyntaxKind.StringLiteral: {
      let text = node.getText();
      if (node.parent.kind === ts.SyntaxKind.JsxAttribute) {
        text = trimQuotes(text);
      }

      return {
        ...txtPartialNode,
        type: ASTNodeTypes.Str,
        value: text,
      } satisfies TxtTextNode;
    }

    default: {
      return {
        ...txtPartialNode,
        type: ASTNodeTypes.HtmlBlock,
        children,
      } satisfies TxtParentNode;
    }
  }
};

class JSXProcessor implements TextlintPluginProcessor {
  extensions: string[];

  constructor(options?: TextlintPluginOptions) {
    this.extensions = options?.extensions ?? [];
  }

  availableExtensions() {
    return [".jsx", ".tsx", ...this.extensions];
  }

  processor() {
    return {
      preProcess(text: string) {
        const sourceFile = ts.createSourceFile(
          "foo.tsx",
          text,
          ts.ScriptTarget.Latest,
          true,
        );
        return jsxToAST(sourceFile) as TxtParentNode;
      },
      postProcess(messages: any[], filePath?: string) {
        return {
          messages,
          filePath: filePath ?? "<jsx>",
        };
      },
    };
  }
}

export default JSXProcessor;
