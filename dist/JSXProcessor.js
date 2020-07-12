"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var range = [node.pos, node.end];
    var txtPartialNode = {
        raw: node.getText(),
        range: range,
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
            var txtNode = __assign(__assign({}, txtPartialNode), { type: ast_node_types_1.ASTNodeTypes.Document, children: children });
            return txtNode;
        }
        case ts.SyntaxKind.JsxText: {
            var txtNode = __assign(__assign({}, txtPartialNode), { type: ast_node_types_1.ASTNodeTypes.Str, value: node.getText() });
            return txtNode;
        }
        default: {
            var txtNode = __assign(__assign({}, txtPartialNode), { type: ast_node_types_1.ASTNodeTypes.HtmlBlock, children: children });
            return txtNode;
        }
    }
};
var JSXProcessor = /** @class */ (function () {
    function JSXProcessor(options) {
        var _a;
        this.extensions = (_a = options === null || options === void 0 ? void 0 : options.extensions) !== null && _a !== void 0 ? _a : [];
    }
    JSXProcessor.prototype.availableExtensions = function () {
        return __spreadArrays(['.jsx', '.tsx'], this.extensions);
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