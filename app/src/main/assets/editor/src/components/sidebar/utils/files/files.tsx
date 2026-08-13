import { mount, state } from "levelojs";
import { subFolderFiles, checkDir, getFileContent, showToast, deleteItem, renameItem, createNewFile, createNewFolder, } from "../../../FileManager";
import { getFileIcon } from "../../../../assets/icons/fileIconMapper";
import './files.css';
import { activeFileData, setActiveFileData } from "../../../../pages/home/Home";
import { setSidebarOpen } from "../../../topbar/Topbar";
import { getTabContent, saveTab, updateTabContent } from "../../../editortabs/utils/TabManager";
import { setTabs, tabs } from "../../../editortabs/EditorTabs";

interface FileItem {
    name: string;
    uri: string;
    isDirectory: boolean;
}

interface CheckDirResult {
    exists: boolean;
    name: string;
    isDirectory: boolean;
    uri: string;
}

function FileTreeItem({ file, level, onRefresh }: { file: FileItem; level: number; key?: string; onRefresh?: () => void }) {
    const [isOpen, setIsOpen] = state(false);
    const [isLoading, setIsLoading] = state(false);
    const [children, setChildren] = state<FileItem[]>([]);
    const [fileActionModalShow, setFileActionModalShow] = state(false);
    const [selectedFileName, setSelectedFileName] = state('');
    const [selectedFileUri, setSelectedFileUri] = state('');
    const [renameModalShow, setRenameModalShow] = state(false);
    const [newName, setNewName] = state('');
    const [delConModShow, setDelConModShow] = state(false);
    const [newFileName, setNewFileName] = state('');
    const [newFolderName, setNewFolderName] = state('');
    const [fileModalShow, setFileModalShow] = state(false);
    const [folderModalShow, setFolderModalShow] = state(false);


    const isRootFolder = level === 0;

    const fileClick = () => {
        if (!file.isDirectory) {

            const currentActive = activeFileData();
            if (currentActive) {
                updateTabContent(currentActive.path, currentActive.content);
            }
            const currentTabs = tabs();
            const existingTab = currentTabs.find(t => t.path === file.uri);
            let finalContent = "";
            if (existingTab) {
                finalContent = getTabContent(file.uri);
            } else {
                finalContent = getFileContent(file.uri) || "";
                const updatedTabs = [...currentTabs, { name: file.name, path: file.uri, content: finalContent }];

                setTabs(updatedTabs);
                localStorage.setItem("editor-tabs", JSON.stringify(updatedTabs));
            }
            setActiveFileData({
                name: file.name,
                content: finalContent,
                path: file.uri
            });

            setSidebarOpen(false);

        } else {
            if (isOpen()) {
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            setIsOpen(true);

            setTimeout(() => {
                try {
                    const subFiles = subFolderFiles(file.uri);
                    setChildren(subFiles);
                } catch (error) {
                    console.error("Failed to load subfolder files:", error);
                } finally {
                    setIsLoading(false);
                }
            }, 300);
        }
    };

    let touchTimer: number | null = null;
    const handleTouchStart = () => {
        if (touchTimer) clearTimeout(touchTimer);

        touchTimer = window.setTimeout(() => {
            setFileActionModalShow(true);
            setSelectedFileName(file.name);
            setSelectedFileUri(file.uri);
        }, 500);
    }

    const handleTouchCancel = () => {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
    }

    const handleDelete = (uri: string) => {
        setFileActionModalShow(false);
        const isSuccess = deleteItem(uri);
        if (isSuccess) {
            showToast("file deleted successfully");
            if (onRefresh) {
                onRefresh();
            }
        } else {
            showToast("Failed to delete file!");
        }
    }

    const handleRename = () => {
        setFileActionModalShow(false);
        const isSuccess = renameItem(selectedFileUri(), newName());
        if (isSuccess) {
            setRenameModalShow(false);
            showToast("file renamed successfully");
            handleRefreshCurrentFolder();
        } else {
            setRenameModalShow(false);
            showToast("file renamed Failed!");
        }
    };

    const handleRefreshCurrentFolder = () => {
        try {
            const subFiles = subFolderFiles(file.uri);
            setChildren(subFiles);
        } catch (error) {
            showToast(`Failed to refresh folder: ${error}`);
        }
    }

    // Create New File Handler
        const handleCreateFile = () => {
            setFileModalShow(false);
            const fileName = newFileName().trim();
            if (!fileName) {
                showToast("Please enter a valid file name");
                return;
            }
    
            const currentUri = file.uri;
            const isSuccess = createNewFile(currentUri, fileName);
    
            if (isSuccess) {
                setFileModalShow(false);
                setNewFileName("");
                showToast("File created successfully");
                handleRefreshCurrentFolder();
            } else {
                showToast("Failed to create file!");
            }
        };
    
        // Create New Folder Handler
        const handleCreateFolder = () => {
            setFolderModalShow(false);
            const folderName = newFolderName().trim();
            if (!folderName) {
                showToast("Please enter a valid folder name");
                return;
            }
    
            const currentUri = file.uri;
            const isSuccess = createNewFolder(currentUri, folderName);
    
            if (isSuccess) {
                setFolderModalShow(false);
                setNewFolderName("");
                showToast("Folder created successfully");
                handleRefreshCurrentFolder();
            } else {
                showToast("Failed to create folder!");
            }
        };
    
    const handleFolderClose = (uri: string) => {
        const data = localStorage.getItem('opened_folders');
        const existingFolders = data ? JSON.parse(data) : [];
        if (existingFolders.includes(uri)) {
            let updatedFiles = existingFolders.filter((f:string) => f !== uri);
            localStorage.setItem('opened_folders', JSON.stringify(updatedFiles));
            showToast("Folder closed successfully");
            if (onRefresh) onRefresh();
        } else {
            showToast("Failed to close!");
        }
    }

    return (
        <div class="tree-node">
            <div 
                class={`sidebar-file-item ${file.isDirectory ? 'is-folder' : ''} ${isRootFolder ? 'root' : ''}`}
                style={{ paddingLeft: '8px' }}
                onClick={fileClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchCancel}
            >
                <span class="icon" renderString={getFileIcon(file.name, file.isDirectory)}></span>
                <span class="file-name">{file.name}</span>
            </div>

            {isLoading() && (
                <div class="folder-loader-wrapper" style={{ paddingLeft: '8px' }}>
                    <div class="folder-progress-bar"></div>
                </div>
            )}

            {isOpen() && !isLoading() && (
                <div class="folder-children-list">
                    {children().length === 0 ? (
                        <div class="empty-folder" style={{ paddingLeft: '8px' }}>
                            (Empty)
                        </div>
                    ) : (
                        children()
                            .slice()
                            .sort((a, b) => {
                                if (a.isDirectory !== b.isDirectory) {
                                    return a.isDirectory ? -1 : 1;
                                }
                                return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
                            })
                            .map((child) => (
                            <FileTreeItem key={child.uri} file={child} level={level + 1} onRefresh={handleRefreshCurrentFolder} />
                        ))
                    )}
                </div>
            )}

            {fileActionModalShow() && (
                <div  >
                    <div class="modal-overlay" onClick={(e: MouseEvent) => {e.stopPropagation(); setFileActionModalShow(false);}}></div>
                    <div class="file-action-modal" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => {navigator.clipboard.writeText(selectedFileUri()); setFileActionModalShow(false)}}>Copy path</button>
                        <button onClick={() => {setDelConModShow(true); setFileActionModalShow(false)}}>Delete</button>
                        <button onClick={() => {setRenameModalShow(true); setFileActionModalShow(false); setNewName(file.name)}}>Rename</button>
                        {file.isDirectory && (<button onClick={() => {setFileModalShow(true); setFileActionModalShow(false)}}>New file</button>)}
                        {file.isDirectory && (<button onClick={() => {setFolderModalShow(true); setFileActionModalShow(false)}}>New folder</button>)}
                        {isRootFolder && (<button onClick={() => {handleFolderClose(file.uri); setFileActionModalShow(false)}}>Close</button>)}
                    </div>
                </div>
            )}

            {renameModalShow() && (
                <div>
                    <div class="modal-overlay" onClick={() => {setSelectedFileUri('')}}></div>
                    <div class="file-action-modal input_modal">
                        <h4>Rename</h4>
                        <input value={newName()} onChange={(e) => setNewName((e.target as HTMLInputElement).value)} />
                        <div class="action">
                            <button onClick={() => setRenameModalShow(false)}>CANCEL</button>
                            <button onClick={()=> handleRename()}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {delConModShow() && (
                <div>
                    <div class="modal-overlay" onClick={() => {setSelectedFileUri('')}}></div>
                    <div class="file-action-modal input_modal">
                        <h4>WARNING</h4>
                        <p>Are you sure you want to permanently delete "{selectedFileName()}"? This action cannot be undone.</p>
                        <div class="action">
                            <button onClick={() => setDelConModShow(false)}>CANCEL</button>
                            <button onClick={()=> handleDelete(selectedFileUri())}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {fileModalShow() && (
                <div>
                    <div class="modal-overlay"></div>
                    <div class="file-action-modal input_modal">
                        <h4>Enter New File Name</h4>
                        <input value={newFileName()} onChange={(e) => setNewFileName((e.target as HTMLInputElement).value)} />
                        <div class="action">
                            <button onClick={() => setFileModalShow(false)}>CANCEL</button>
                            <button onClick={handleCreateFile} >OK</button>
                        </div>
                    </div>
                </div>
            )}

            {folderModalShow() && (
                <div>
                    <div class="modal-overlay"></div>
                    <div class="file-action-modal input_modal">
                        <h4>Enter New Folder Name</h4>
                        <input value={newFolderName()} onChange={(e) => setNewFolderName((e.target as HTMLInputElement).value)} />
                        <div class="action">
                            <button onClick={() => setFolderModalShow(false)}>CANCEL</button>
                            <button onClick={handleCreateFolder} >OK</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export function SidebarFiles() {
    const [openedFolders, setOpenedFolders] = state<FileItem[]>([]);
    
    mount(() => {loadFolders();})

    const loadFolders = () => {
        const foldersUri = localStorage.getItem('opened_folders');
        const existingUris: string[] = foldersUri ? JSON.parse(foldersUri) : [];

        const validFolders: FileItem[] = [];

        existingUris.forEach((uri) => {
            const rawJson = checkDir(uri);
            if (rawJson) {
                try {
                    const dirInfo: CheckDirResult = JSON.parse(rawJson);
                    if (dirInfo.exists && dirInfo.isDirectory) {
                        validFolders.push({
                            name: dirInfo.name,
                            uri: dirInfo.uri,
                            isDirectory: true
                        });
                    }
                } catch (e) {
                    console.error("Failed to parse checkDir response:", e);
                }
            }
        });

        setOpenedFolders(validFolders);
    };

    return (
        <div class="sidebar-files">
            {openedFolders().length === 0 ? (
                <div class="no-folder-message">
                    No folder opened
                </div>
            ) : (
                openedFolders().map((folder) => {
                    return (
                        <div key={folder.uri} class="folder-group">
                            <FileTreeItem key={folder.uri} file={folder} level={0} onRefresh={loadFolders} />
                        </div>
                    );
                })
            )}
        </div>
    );
}