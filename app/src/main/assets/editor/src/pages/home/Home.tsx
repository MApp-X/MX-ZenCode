import './home.css'

import { getLanguageExtension } from '../../lang/lang'
import { indentedLineWrap } from '../../plugins/indentedWrap'
import { activeSubline, activeSublineTheme } from '../../plugins/activeSubline'

import { TopBar } from '../../components/topbar/Topbar'
import { EditorTabs } from '../../components/editortabs/EditorTabs'
import { tabLoader } from '../../components/editortabs/utils/TabManager'
import { vsDark } from '../../components/sidebar/utils/extensions/extensions'
import { updateTabContent } from '../../components/editortabs/utils/TabManager'

import { state, mount, effect } from 'levelojs'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { getFileContent, showToast } from '../../components/FileManager'
import { tags as t } from '@lezer/highlight';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';

const languageCompartment = new Compartment();
const themeCompartment = new Compartment();

export interface fileData {
  name: string,
  content: string,
  path: string
}

interface TabItem {
  name: string,
  path: string,
}

export const [activeFileData, setActiveFileData] = state<fileData | null>(null);

// Track the current path to detect file switching properly
let currentActivePath: string | null = null;

export default function Home() {
  let editorView: EditorView | null = null;
  let isInternalChange = false;
  let localSaveTimer: ReturnType<typeof setTimeout> | null = null;

  mount(() => {
    // Load last saved active file
    const loadedTab = tabLoader();
    if (loadedTab) {
      try {
        const parsedTabs: TabItem[] = JSON.parse(loadedTab);
        if (parsedTabs.length > 0) {
          const lastActiveFile = parsedTabs[parsedTabs.length - 1];
          const lastActiveFileContent = getFileContent(lastActiveFile.path);
          setActiveFileData({
            name: lastActiveFile.name,
            content: lastActiveFileContent,
            path: lastActiveFile.path
          });
        }
      } catch (error) {
        console.error("Failed to parse saved tabs:", error);
      }
    }

    // Initialize CodeMirror editor
    const editorDiv = document.getElementById('editor');
    const currentFileData = activeFileData();
    const currentFileName = currentFileData ? currentFileData.name : 'untitled.txt';
    currentActivePath = currentFileData ? currentFileData.path : null;

    const startState = EditorState.create({
      doc: currentFileData?.content || "",
      extensions: [
        basicSetup,
        activeSubline,
        activeSublineTheme,
        EditorView.lineWrapping,
        indentedLineWrap,
        languageCompartment.of(getLanguageExtension(currentFileName)),
        themeCompartment.of([]),
        EditorView.updateListener.of((update) => {
          // Sync state only when user edits inside the editor
          if (update.docChanged && !isInternalChange) {
            const newContent = update.state.doc.toString();
            const currentData = activeFileData();
            if (currentData) {
              setActiveFileData({
                ...currentData,
                content: newContent
              });
            }

            if (localSaveTimer) clearTimeout(localSaveTimer);
            localSaveTimer = setTimeout(() => {
              const latestData = activeFileData();
              if (latestData) updateTabContent(latestData?.path, newContent);
              return;
            }, 1000);
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

    if (localSaveTimer) clearTimeout(localSaveTimer);

    if (!editorView) return;

    if (!file) {
      currentActivePath = null;
      isInternalChange = true;
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: ""
        },
        effects: languageCompartment.reconfigure(getLanguageExtension("untitled.txt"))
      });
      isInternalChange = false;
      return;
    }

    const isPathChanged = currentActivePath !== file.path;
    const isContentChanged = editorView.state.doc.toString() !== file.content;

    if (isPathChanged || (isContentChanged && !isInternalChange)) {
      currentActivePath = file.path;
      isInternalChange = true;

      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: file.content
        },
        effects: languageCompartment.reconfigure(getLanguageExtension(file.name))
      });

      isInternalChange = false;
    }

  });

  effect(() => {
    const code = vsDark();
    if (!editorView) return;

    if (code) {
      try {
        const moduleExports: { default?: () => any } = {};
        const runCode = new Function('module', 'exports', 'require', code);
        runCode(moduleExports, moduleExports, (modName: string) => {
          if (modName === '@codemirror/language') return { HighlightStyle, syntaxHighlighting };
          if (modName === '@codemirror/view') return { EditorView };
          if (modName === '@lezer/highlight') return { tags: t };
        });

        const themeExtension = moduleExports.default ? moduleExports.default() : [];

        editorView.dispatch({
          effects: themeCompartment.reconfigure(themeExtension)
        });
      } catch (e) {
        console.error("Failed to evaluate extension code:", e);
      }
    }
  });

  return (
    <div class="home">
      <TopBar />
      <EditorTabs />
      <div class="editor" id="editor" style={{ display: activeFileData() ? 'block' : 'none' }} />
      {!activeFileData() && (
        <div class="empty-editor-placeholder">
          <p>No file is open</p>
        </div>
      )}
    </div>
  );
}
