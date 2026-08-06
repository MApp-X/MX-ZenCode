import './home.css'
import { getLanguageExtension } from '../../lang/lang'
import { indentedLineWrap } from '../../plugins/indentedWrap'
import { activeSubline, activeSublineTheme } from '../../plugins/activeSubline'
import { TopBar } from '../../components/topbar/Topbar'

import { state, mount, effect } from 'levelojs'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'

const languageCompartment = new Compartment();

export interface fileData {
  name: string,
  content: string,
  path: string
}

export const [activeFileData, setActiveFileData] = state<fileData | null>(null);

export default function Home() {
  let editorView: EditorView | null = null;

  mount(() => {
    const editorDiv = document.getElementById('editor');

    const currentFileData = activeFileData();
    const currentFileName = currentFileData ? currentFileData.name : 'untitiled.txt';

    const startState = EditorState.create({
      doc: currentFileData?.content || "",
      extensions: [
        basicSetup,
        activeSubline,
        activeSublineTheme,
        EditorView.lineWrapping,
        indentedLineWrap,
        languageCompartment.of(getLanguageExtension(currentFileName)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
 
            const currentData = activeFileData();
            if (currentData) {
              setActiveFileData({
                ...currentData,
                content: newContent
              });
            }
          }
        }),
        EditorView.theme({
          "&": { height: '100%' },
          ".cm-scroller": { overflow: "auto" },
          ".cm-content": { paddingBottom: "300px" },
          ".cm-gutters": { paddingBottom: "300px" }
        })
      ]
    });

    editorView = new EditorView({
      state: startState,
      parent: editorDiv as HTMLElement,
    });
  });

  effect(() => {
    const file = activeFileData();
    if (!editorView || !file) return;

    const currentDoc = editorView.state.doc.toString();

    if (currentDoc !== file.content) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: file.content
        },
        effects: languageCompartment.reconfigure(getLanguageExtension(file.name))
      });
    }
  });

  return (
    <div class="home">
      <TopBar />
      <div class="editor" id="editor" />
    </div>
  )
}