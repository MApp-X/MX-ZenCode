import { state } from "levelojs";
import { getFileContent } from "../../FileManager";

interface TabItem {
    name: string,
    path: string,
    content: string,
}

export function tabLoader() {
    const tabs = localStorage.getItem("editor-tabs");
    return tabs;
}

export function saveTab(file: {name: string, path: string, content: string}): boolean {
    const openedTabs  = localStorage.getItem("editor-tabs");
    const TabsJson: TabItem[] = openedTabs ? JSON.parse(openedTabs) : [];
    const isAlready = TabsJson.some(t => t.path === file.path);

    if (!isAlready) {
        TabsJson.push(file);
        localStorage.setItem("editor-tabs", JSON.stringify(TabsJson));
        return true;
    } else {
        return false;
    }
}

export function updateTabContent(path: string, newContent: string): boolean {
    const openedTabs = localStorage.getItem("editor-tabs");
    if (!openedTabs) return false;

    try {
        const tabs: TabItem[] = JSON.parse(openedTabs);
        const updatedTabs = tabs.map(t => {
            if (t.path === path) {
                return { ...t, content: newContent };
            }
            return t;
        });
        localStorage.setItem("editor-tabs", JSON.stringify(updatedTabs));
        return true;
    } catch (e) {
        console.error("Failed to update tab content:", e);
        return false;
    }
}

export function getTabContent(filePath: string): string {
    const openedTabs = localStorage.getItem("editor-tabs");
    if (!openedTabs) return getFileContent(filePath) || "";
    
    try {
        const tabs: TabItem[] = JSON.parse(openedTabs);
        const target = tabs.find(t => t.path === filePath);
        return target ? target.content : (getFileContent(filePath) || "");
    } catch (e) {
        return getFileContent(filePath) || "";
    }
}