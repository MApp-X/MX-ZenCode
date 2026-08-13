import { cssLanguage } from "@codemirror/lang-css";
import { linter, Diagnostic, lintGutter } from "@codemirror/lint";

const cssSyntextLinter = linter((view) => {
    const diagnostics: Diagnostic[] = [];
    const tree = cssLanguage.parser.parse(view.state.doc.toString());

    tree.iterate({
        enter(node) {
            if (node.type.isError) {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: "error",
                    message: "CSS Syntax Error: Invalid property or missing semicolon."
                });
            }
        }
    });
    return diagnostics;
})

export const cssLSPExtention = [cssSyntextLinter, lintGutter()];