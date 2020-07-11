"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ast_node_types_1 = require("@textlint/ast-node-types");
var ts = require("typescript");
var jsxToAST = function (node) {
    var startLineAndCharacter = node
        .getSourceFile()
        .getLineAndCharacterOfPosition(node.pos);
    var endLineAndCharacter = node
        .getSourceFile()
        .getLineAndCharacterOfPosition(node.end);
    var children = [];
    node.forEachChild(function (child) {
        var txtChildNode = jsxToAST(child);
        if (txtChildNode.type !== ast_node_types_1.ASTNodeTypes.Str &&
            txtChildNode.children.length === 0) {
            return;
        }
        children.push(txtChildNode);
    });
    return {
        // TODO: Implement map for all SyntaxKinds.
        type: node.kind === ts.SyntaxKind.SourceFile
            ? ast_node_types_1.ASTNodeTypes.Document
            : node.kind === ts.SyntaxKind.JsxText
                ? ast_node_types_1.ASTNodeTypes.Str
                : ast_node_types_1.ASTNodeTypes.Html,
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
        children: children,
    };
};
var JSXProcessor = /** @class */ (function () {
    function JSXProcessor(options) {
        var _a;
        this.extensions = (_a = options === null || options === void 0 ? void 0 : options.extensions) !== null && _a !== void 0 ? _a : [];
    }
    JSXProcessor.prototype.availableExtensions = function () {
        return __spreadArrays(['.js', '.jsx', '.ts', '.tsx'], this.extensions);
    };
    JSXProcessor.prototype.processor = function () {
        return {
            preProcess: function (text) {
                var sourceFile = ts.createSourceFile('foo.tsx', text, ts.ScriptTarget.Latest, true);
                return jsxToAST(sourceFile);
            },
            postProcess: function (messages, filePath) {
                return {
                    messages: messages,
                    filePath: filePath !== null && filePath !== void 0 ? filePath : '<jsx>',
                };
            },
        };
    };
    return JSXProcessor;
}());
exports.default = JSXProcessor;
//# sourceMappingURL=JSXProcessor.js.map