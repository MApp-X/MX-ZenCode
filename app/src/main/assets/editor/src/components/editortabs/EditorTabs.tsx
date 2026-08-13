import { mount, state } from 'levelojs';
import './editortabs.css';
import { getTabContent, tabLoader, updateTabContent } from './utils/TabManager';
import { X } from 'kivex-levelo';
import { activeFileData, setActiveFileData } from '../../pages/home/Home';
import { getFileContent, showToast } from '../FileManager';
import { getFileIcon } from '../../assets/icons/fileIconMapper';
import { saveTab } from './utils/TabManager';

interface TabItem {
    name: string,
    path: string,
    content: string
}

export const [tabs, setTabs] = state<TabItem[]>([]);
export function EditorTabs() {

    mount(() => {
        const savedTabs = tabLoader();
        if (savedTabs) {
            setTabs(JSON.parse(savedTabs));
        }
    });

    const setToActiveFile = (n: string, p: string) => {
        const fileContent = getTabContent(p);
        setActiveFileData({
            name: n,
            content: fileContent || "",
            path: p,
        });

    }

    const handleFileClose = (uri: string) => {
        const getSavedTabs = tabLoader();
        const parsedTabs: TabItem[] = getSavedTabs ? JSON.parse(getSavedTabs) : [];
        const updatedTabs = parsedTabs.filter((tab) => tab.path !== uri);
        localStorage.setItem("editor-tabs", JSON.stringify(updatedTabs));
        
        setTabs(updatedTabs);

        if (activeFileData()?.path === uri) {
            if (updatedTabs.length > 0) {
                const nextTab = updatedTabs[updatedTabs.length - 1];
                const nextTabContent = getTabContent(nextTab.path);
                setActiveFileData({
                    name: nextTab.name,
                    content: nextTabContent,
                    path: nextTab.path
                });
            } else {
                setActiveFileData(null);
            }
        }
    }

    const handleTabChange = (name: string, path: string) => {
        const currentActive = activeFileData();
        if (currentActive) {
            updateTabContent(currentActive.path, currentActive.content);
        }
        setToActiveFile(name, path);
    }

    return (
        <div class="editor-tabs">
            {tabs().map(tab => (
                <button onClick={() => handleTabChange(tab.name, tab.path)} class={`tab-button-container ${activeFileData()?.path === tab.path ? "tabActive" : ""}`}>
                    <span class="svg fileLogo" renderString={getFileIcon(tab.name, false)}></span>
                    <p>{tab.name}</p>
                    <button onClick={(e) => {e.stopPropagation(); handleFileClose(tab.path)}}>
                        <X size={12} class="svg" />
                    </button>
                </button>
            ))}
        </div>
    )
}