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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var ast_node_types_1 = require("@textlint/ast-node-types");
var ts = require("typescript");
var extractCommentNodes = function (node) {
    var commentRanges = ts.getLeadingCommentRanges(node.getSourceFile().getFullText(), node.pos);
    if (!commentRanges) {
        return [];
    }
    return commentRanges.map(function (range) {
        var text = node
            .getSourceFile()
            .getFullText()
            .slice(range.pos, range.end);
        var start = ts.getLineAndCharacterOfPosition(node.getSourceFile(), range.pos);
        var end = ts.getLineAndCharacterOfPosition(node.getSourceFile(), range.end);
        var comment = text;
        if (text.startsWith('//')) {
            // single line comment
            comment = text.replace(/^\/\//, '');
        }
        else if (text.startsWith('/*')) {
            // multi line comment
            comment = text.replace(/^\/\*/, '').replace(/\*\/$/, '');
        }
        return {
            raw: text,
            range: [range.pos, range.end],
            type: ast_node_types_1.ASTNodeTypes.Comment,
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
var ignoredCommentKinds = [
    ts.SyntaxKind.SourceFile,
];
var jsxToAST = function (node) {
    var startLineAndCharacter = node
        .getSourceFile()
        .getLineAndCharacterOfPosition(node.pos);
    var endLineAndCharacter = node
        .getSourceFile()
        .getLineAndCharacterOfPosition(node.end);
    var children = [];
    if (!ignoredCommentKinds.includes(node.kind)) {
        children.push.apply(children, extractCommentNodes(node));
    }
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
        case ts.SyntaxKind.StringLiteral: {
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
        return __spreadArray(['.jsx', '.tsx'], this.extensions, true);
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