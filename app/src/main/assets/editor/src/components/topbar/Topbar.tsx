// English comments for LeveloJs project
import { Menu, MenuVertical, Folder, Settings, Save } from 'kivex-levelo';
import './topbar.css';
import { effect, state } from 'levelojs';
import { SideBar } from '../sidebar/SideBar';
import { activeFileData } from '../../pages/home/Home';
import { saveFileContent, showToast, uriFormat } from '../FileManager';

export const [sidebarOpen, setSidebarOpen] = state(false);

export function TopBar() {
    
    const [menuOpen, setMenuOpen] = state(false);
    const [saveDisabled, setSaveDisabled] = state(false);
    const [activeFileName, setActiveFileName] = state(activeFileData()?.name || 'untitled.txt');
    const [activeFilePath, setActiveFilePath] = state(activeFileData()?.path || '');

    effect(() => {
        setActiveFileName(activeFileData()?.name || 'untitled.txt');
        setActiveFilePath(activeFileData()?.path || '');
    })

    const handleSaveFile = () => {
        const fileUri = activeFileData()?.path;
        const fileContent = activeFileData()?.content;

        const isSuccess = saveFileContent(fileUri, fileContent);

        if (isSuccess) {
            showToast("Successfully Saved!");
        } else {
            showToast("Failed to save file!");
        }
    };

    return (
        <div class="topbar">
            <div 
                class={sidebarOpen() ? "sidebar-overlay active" : "sidebar-overlay"} 
                onClick={() => setSidebarOpen(false)} 
            />
            <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div class="top-left">
                <button class="menu" onClick={() => setSidebarOpen(!sidebarOpen())}>
                    <Menu class="svg" />
                </button>
                <div class="active-file-data">
                    <span class="active-file-name" onClick={() => navigator.clipboard.writeText(activeFileName())}>{activeFileName()}</span>
                    <span class="active-file-path">{uriFormat(activeFilePath())}</span>
                </div>
            </div>
            <div class="top-right">
                <button onClick={() => setMenuOpen(!menuOpen())}>
                    <MenuVertical class="svg" />
                </button>
                <div 
                    class={menuOpen() ? "sidebar-overlay active" : "sidebar-overlay"} 
                    onClick={() => setMenuOpen(false)}
                />
                <div class={menuOpen() ? "dropdown-menu active" : "dropdown-menu"}>
                    <a href="/files" class="dropdown-item" onClick={() => {setMenuOpen(false); }}>
                        <Folder class="svg" />
                        <span>Files</span>
                    </a>
                    <button class="dropdown-item" onClick={() => { handleSaveFile(); setMenuOpen(false)}}>
                        <Save class="svg" />
                        <span>Save</span>
                    </button>
                    <a href="/settings" class="dropdown-item" onClick={() => setMenuOpen(false)}>
                        <Settings class="svg" />
                        <span>Settings</span>
                    </a>
                </div>
            </div>
        </div>
    );
}