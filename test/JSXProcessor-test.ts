// FIXME: When using `import fs from "fs"`, raising the error of `Could not statically evaluate how the fs module was required/imported`.
const fs = require("fs");

import path from "path";
import { test } from "@textlint/ast-tester";
import JSXProcessor from "../src/JSXProcessor";
import assert from "assert";

describe("processor()", () => {
  const processor = new JSXProcessor();
  const { preProcess } = processor.processor();

  describe("preProcess()", () => {
    function findInputFile(dir: string): string {
      const exts = ["ts", "js", "tsx", "jsx"];
      const candidates = exts.map((ext) => path.join(dir, `input.${ext}`));

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }

      throw new Error(`${dir}/input.(${exts.join("|")}) file not found`);
    }

    const fixturesDir = path.join(__dirname, "snapshots");
    fs.readdirSync(fixturesDir).map((caseName: string) => {
      const normalizedTestName = caseName.replace(/-/g, " ");
      describe(`Test ${normalizedTestName}`, function () {
        it("returns expected AST", function () {
          const fixtureDir = path.join(fixturesDir, caseName);
          const actualFilePath = findInputFile(fixtureDir);
          const actualContent = fs.readFileSync(actualFilePath, "utf-8");
          const actual = preProcess(actualContent);
          const expectedFilePath = path.join(fixtureDir, "output.json");

          // Usage: update snapshots
          // UPDATE_SNAPSHOT=1 npm test
          if (
            !fs.existsSync(expectedFilePath) ||
            process.env.UPDATE_SNAPSHOT === "1"
          ) {
            if (fs.existsSync(expectedFilePath)) {
              fs.rmSync(expectedFilePath);
            }

            fs.writeFileSync(expectedFilePath, JSON.stringify(actual, null, 2));
            this.skip(); // skip when updating snapshots
          } else {
            // compare input and output
            const expected = JSON.parse(
              fs.readFileSync(expectedFilePath, "utf-8"),
            );
            assert.deepStrictEqual(actual, expected);
          }
        });

        it("returns AST that passed isTxtAST", function () {
          const fixtureDir = path.join(fixturesDir, caseName);
          const actualFilePath = findInputFile(fixtureDir);
          const actualContent = fs.readFileSync(actualFilePath, "utf-8");
          const actual = preProcess(actualContent);

          test(actual);
        });
      });
    });
  });
});
