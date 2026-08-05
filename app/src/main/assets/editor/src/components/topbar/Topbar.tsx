// English comments for LeveloJs project
import { Menu, MenuVertical, Folder, Settings, Save } from 'kivex-levelo';
import './topbar.css';
import { state } from 'levelojs';
import { SideBar } from '../sidebar/SideBar';
import { activeFileData } from '../../pages/home/Home';
import { saveFileContent, showToast } from '../FileManager';

export function TopBar() {
    const [sidebarOpen, setSidebarOpen] = state(false);
    const [menuOpen, setMenuOpen] = state(false);
    const [saveDisabled, setSaveDisabled] = state(false);

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
                <div class="file-name">
                    {activeFileData()?.name || 'untitled.txt'}
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