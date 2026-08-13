// English comments for LeveloJs project
import { Menu, MenuVertical, Folder, Settings, Save, Play } from 'kivex-levelo';
import './topbar.css';
import { batch, effect, state } from 'levelojs';
import { SideBar } from '../sidebar/SideBar';
import { activeFileData } from '../../pages/home/Home';
import { saveFileContent, showToast, uriFormat } from '../FileManager';
import { handlePreview } from '../kotlinBridge';

export const [sidebarOpen, setSidebarOpen] = state(false);

export function TopBar() {
    
    const [menuOpen, setMenuOpen] = state(false);
    const [saveDisabled, setSaveDisabled] = state(false);
    const [activeFileName, setActiveFileName] = state(activeFileData()?.name || '');
    const [activeFilePath, setActiveFilePath] = state(activeFileData()?.path || '');
    const [activeFileExt, setActiveFileExt] = state("");

    effect(() => {
        const activeFile = activeFileData();
        const Name = activeFile?.name || '';
        const Path = activeFile?.path || '';
        let Ext = '';
        if (activeFile?.name) {
            const extension = activeFile.name.split(".").pop()?.toLowerCase();
            Ext = extension || "";
        }
        batch(() => {
            setActiveFileName(Name);
            setActiveFilePath(Path);
            setActiveFileExt(Ext);
        });
    });

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

    const isPreviewable = (ext: string | null) => {
        if (ext) {
            const supportedExtensions = ["html", "htm", "md", "markdown", "svg"];
            return supportedExtensions.includes(ext) ? true : false;
        } else {
            return false
        }
    }

    const handlePreviewSystem = async (filePath: string) => {
        if (filePath) {
            await handlePreview(filePath);
        } else {
            showToast("Active File Path not found")
        }
    }

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
                {isPreviewable(activeFileExt()) && (
                    <button class="play" onClick={(e) => {e.stopPropagation(); handlePreviewSystem(activeFilePath())}}>
                        <Play class="svg" size={20} />
                    </button>
                )}
                
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