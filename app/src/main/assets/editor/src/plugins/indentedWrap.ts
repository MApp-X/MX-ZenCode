/**
 * Adapted from Pluto.jl & CodeMirror discussion community.
 * Handles wrapped line indentation matching tabs and spaces.
 */

import { EditorView, Decoration } from "@codemirror/view";
import { StateField } from '@codemirror/state';

export function getLeadingIndentWidth(lineText: string, tabSize: number) {
    const leadingText = /^[\t ]*/.exec(lineText)?.[0] ?? "";
    let width = 0;
    for (const char of leadingText) {
        width += char === "\t" ? tabSize : 1;
    }
    return width;
};

function getDecorations(state: any) {
    const decorations = [];

    for (let i = 0; i < state.doc.lines; i++) {
        const line = state.doc.line(i + 1);
        const indentWidth = getLeadingIndentWidth(line.text, state.tabSize);

        if (indentWidth === 0) continue;

        const lineWrapper = Decoration.line({
            attributes: {
                style: `--indented: ${indentWidth}ch;`,
                class: "indented-wrapped-line",
            },
        });
        decorations.push(lineWrapper.range(line.from, line.from));
    }

    return Decoration.set(decorations);
};

export const indentedLineWrap = StateField.define({
    create(state) {
        return getDecorations(state);
    },
    update(deco, tr) {
        if (!tr.docChanged) {
            return deco;
        }
        return getDecorations(tr.state);
    },
    provide: (f) => EditorView.decorations.from(f),
})