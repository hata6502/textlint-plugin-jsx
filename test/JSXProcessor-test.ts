import fs from "fs";
import path from "path";
import { test } from "@textlint/ast-tester";
import JSXProcessor from "../src/JSXProcessor";
import {
  ASTNodeTypes,
  TxtNode,
  TxtParentNode,
} from '@textlint/ast-node-types';
import assert from "assert";

describe("processor()", () => {
  const processor = new JSXProcessor()
  const { preProcess } = processor.processor()

  describe("preProcess()", () => {
    function getNodes(node: TxtParentNode | TxtNode, collection: TxtNode[] = []): TxtNode[] {
      collection.push(node)

      if ('children' in node) {
        for (let i = 0; i < node.children.length; i++) {
          getNodes(node.children[i], collection)
        }
      }

      return collection
    }

    it("returns AST that passed isTxtAST string.ts", () => {
      const script = fs.readFileSync(path.join(__dirname, "fixtures/string.ts"), "utf-8");
      const AST = preProcess(script);
      test(AST);

      const nodes = getNodes(AST)
      const foundStr = nodes.some((node) => node.type === ASTNodeTypes.Str && /str/.test(node.value))
      assert(foundStr)
    })

    it("returns AST that passed isTxtAST line_comment.ts", () => {
      const script = fs.readFileSync(path.join(__dirname, "fixtures/line_comment.ts"), "utf-8");
      const AST = preProcess(script);
      test(AST);

      const nodes = getNodes(AST)
      const lineComment = nodes.find((node) => node.type === ASTNodeTypes.Comment && /line-comment/.test(node.value))
      assert.strictEqual(lineComment?.value, " line-comment")
    })
  })
})
