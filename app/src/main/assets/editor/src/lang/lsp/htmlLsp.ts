import {html, htmlLanguage} from "@codemirror/lang-html"
import { linter, Diagnostic, lintGutter } from "@codemirror/lint"

const htmlSyntaxLinter = linter((view) => {
    let diagnostics : Diagnostic[] = [];
    let tree = htmlLanguage.parser.parse(view.state.doc.toString());
    tree.iterate({
        enter(node) {
            if (node.type.isError) {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: "error",
                    message: "HTML Syntax Error: Unclosed tag or invalid structure."
                });
            }
        }
    });
    return diagnostics;
});

export const htmlLSPExtention = [htmlSyntaxLinter, lintGutter()];