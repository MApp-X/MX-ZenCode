// src/pages/files/File.tsx
import { effect, mount, state } from "levelojs";
import { ArrowLeft, Plus } from "kivex-levelo";
import './files.css';
import { handleOpenFolder, getSavedFiles, subFolderFiles, getFileContent, renameItem, deleteItem, showToast, createNewFile, createNewFolder } from "../../components/FileManager";
import { fileItem, folderStackItem } from "./types/file";
import { setActiveFileData } from "../home/Home";
import { FileActions } from "./components/fileactions/FileActions";
import { getFileIcon } from "../../assets/icons/fileIconMapper";
import { showHidden } from "./components/fileactions/FileActions";

export default function Files() {
    const [files, setFiles] = state<fileItem[]>([]);
    const [stack, setStack] = state<folderStackItem[]>([]);
    const [isLoading, setIsLoading] = state(true);
    const [selectedFileUri, setSelectedFileUri] = state<string>("");
    const [selectedFileName, setSelectedFileName] = state<string>("UNKNOWN");
    const [selectedFileIsFolder, setSelectedFileIsFolder] = state<boolean>(false);
    const [newName, setNewName] = state<string>("");
    const [renameModalShow, setRenameModalShow] = state<boolean>(false);
    const [showModal, setShowModal] = state<boolean>(false);
    const [delConModShow, setDelConModShow] = state<boolean>(false);
    const [addModalShow, setAddModalShow] = state<boolean>(false);
    const [newFileName, setNewFileName] = state<string>("");
    const [newFolderName, setNewFolderName] = state<string>("");
    const [fileModalShow, setFileModalShow] = state<boolean>(false);
    const [folderModalShow, setFolderModalShow] = state<boolean>(false);

    mount(() => {
        setSelectedFileUri('');
    });

    // Reusable filter function
    const filter = (items: fileItem[]) => {
        if (showHidden()) {
            return items;
        }
        return items.filter(i => !i.name.startsWith("."));
    };

    effect(() => {
        showHidden();
        setIsLoading(true);
        setTimeout(() => {
            try {
                const currentStack = stack();
            
                if (currentStack.length > 0) {
                    const currentFolder = currentStack[currentStack.length - 1];
                    setFiles(filter(currentFolder.files));
                } else {
                    const initialFiles = getSavedFiles();
                    setFiles(filter(initialFiles));
                    setStack([{ name: 'Root', uri: 'root', files: initialFiles }]);
                }
            } catch (error) {
                console.error("Failed to fetch files:", error);
            } finally {
                setIsLoading(false);
            }
        }, 0);
    });

    const selectFolder = () => {
        handleOpenFolder((fetchedFiles) => {
            setFiles(filter(fetchedFiles));
            setStack([{ name: 'Root', uri: 'root', files: fetchedFiles }]);
        });
    };

    const onFolderClick = (item: fileItem) => {
        if (item.isDirectory) {
            setIsLoading(true);
            setTimeout(() => {
                const rawSubFiles = subFolderFiles(item.uri);
                setFiles(filter(rawSubFiles));
                setStack([...stack(), { name: item.name, uri: item.uri, files: rawSubFiles }]);
                setIsLoading(false);
            }, 0);
        } else {
            const rawContent = getFileContent(item.uri);
            setActiveFileData({
                name: item.name,
                content: rawContent,
                path: item.uri,
            });
            window.history.back();
        }
    };

    const handleBreadcrumbClick = (targetIndex: number) => {
        const currentStack = stack();
        if (targetIndex === currentStack.length - 1) return;

        const newStack = currentStack.slice(0, targetIndex + 1);
        const targetFolder = newStack[newStack.length - 1];

        setStack(newStack);
        setFiles(filter(targetFolder.files));
    };

    // modal handler,
    let touchTimer: number | null = null;

    const handleTouchStart = (file: fileItem) => {
        if (touchTimer) clearTimeout(touchTimer);

        touchTimer = window.setTimeout(() => {
            setSelectedFileUri(file.uri);
            setSelectedFileName(file.name);
            setSelectedFileIsFolder(file.isDirectory);
            setShowModal(true);
            touchTimer = null;
        }, 500)
    }

    const handleTouchCancel = () => {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
    }

    const handleOpenFolderInEditor = () => {
        const newFolderUri = selectedFileUri();
        if (!newFolderUri) return;

        const data = localStorage.getItem('opened_folders');
        const existingFolders = data ? JSON.parse(data) : [];

        if (!existingFolders.includes(newFolderUri)) {
            existingFolders.push(newFolderUri);
        }
        localStorage.setItem('opened_folders', JSON.stringify(existingFolders));
        setShowModal(false);
        window.history.replaceState({}, '', '/');
        window.dispatchEvent(new PopStateEvent("popstate"));
    }

    const handleRename = () => {
        setShowModal(false);
        const isSuccess = renameItem(selectedFileUri(), newName());
        if (isSuccess) {
            setRenameModalShow(false);
            showToast("file renamed successfully");
            refreshFiles();
        } else {
            setRenameModalShow(false);
            showToast("file renamed Failed!");
        }
    };

    const handleDelete = () => {
        setShowModal(false);
        const isSuccess = deleteItem(selectedFileUri());
        if (isSuccess) {
            setDelConModShow(false);
            showToast("file deleted successfully");
            refreshFiles();
        } else {
            setDelConModShow(false);
            showToast("Failed to delete file");
        }
    }
    
    const refreshFiles = () => {
        showHidden();
        setIsLoading(true);
        setTimeout(() => {
            try {
                const currentStack = stack();
            
                if (currentStack.length > 0) {
                    const currentFolder = currentStack[currentStack.length - 1];
                    const updatedSubFiles = currentFolder.uri === 'root'
                        ? getSavedFiles()
                        : subFolderFiles(currentFolder.uri);
                    setFiles(filter(updatedSubFiles));
                } else {
                    const initialFiles = getSavedFiles();
                    setFiles(filter(initialFiles));
                    setStack([{ name: 'Root', uri: 'root', files: initialFiles }]);
                }
            } catch (error) {
                console.error("Failed to fetch files:", error);
            } finally {
                setIsLoading(false);
            }
        }, 0);
    }

    // Current directory URI retriever helper
    const getCurrentFolderUri = (): string => {
        const currentStack = stack();
        if (currentStack.length > 0) {
            const currentFolder = currentStack[currentStack.length - 1];
            return currentFolder.uri;
        }
        return 'root';
    };

    // Create New File Handler
    const handleCreateFile = () => {
        const fileName = newFileName().trim();
        if (!fileName) {
            showToast("Please enter a valid file name");
            return;
        }

        const currentUri = getCurrentFolderUri();
        const isSuccess = createNewFile(currentUri, fileName);

        if (isSuccess) {
            setFileModalShow(false);
            setNewFileName("");
            showToast("File created successfully");
            refreshFiles();
        } else {
            showToast("Failed to create file!");
        }
    };

    // Create New Folder Handler
    const handleCreateFolder = () => {
        const folderName = newFolderName().trim();
        if (!folderName) {
            showToast("Please enter a valid folder name");
            return;
        }

        const currentUri = getCurrentFolderUri();
        const isSuccess = createNewFolder(currentUri, folderName);

        if (isSuccess) {
            setFolderModalShow(false);
            setNewFolderName("");
            showToast("Folder created successfully");
            refreshFiles();
        } else {
            showToast("Failed to create folder!");
        }
    };

    return (
        <div class="flies">
            <div class="header">
                <div class="f-left">
                    <a onClick={() => window.history.back()}>
                        <ArrowLeft class="svg" />
                    </a>
                    <h2 class="title">File Browser</h2>
                </div>
                <div class="f-right">
                    <button class="add" onClick={() => setAddModalShow(!addModalShow())}>
                        <Plus class="svg" />
                        {addModalShow() && (
                            <div >
                                <div class="add-modal-overlay" onClick={(e) => {e.stopPropagation(); setAddModalShow(false);}}></div>
                                <div class="add-modal" onClick={(e) => e.stopPropagation()}>
                                    <button class="add-item" onClick={selectFolder}>Add path</button>
                                    <button class="add-item" onClick={() => {setFileModalShow(true); setAddModalShow(false)}}>New File</button>
                                    <button class="add-item" onClick={() => {setFolderModalShow(true); setAddModalShow(false)}}>New Folder</button>
                                </div>
                                
                            </div>
                        )}
                    </button>
                    <FileActions />
                </div>
            </div>
            
            <div class="breadcrumb">
                <span class="folder_name">/›</span>
                {stack().map((item, index) => (
                    <div key={item.uri} class="breadcrumb_item">
                        <span 
                            class={`folder_name ${index === stack().length - 1 ? 'active' : ''}`} 
                            onClick={() => handleBreadcrumbClick(index)}
                        >
                            {item.name}
                        </span>
                        {index < stack().length - 1 && (
                            <span class="separator">›</span>
                        )}
                    </div>
                ))}
            </div>

            <div class="content">
                {isLoading() ? (
                    <div class="loader">Loading files...</div>
                ) : files().length === 0 ? (
                    <p class="file_blank">No files or folders found</p>
                ) : (
                    files()
                        .slice()
                        .sort((a, b) => {
                            if (a.isDirectory !== b.isDirectory) {
                                return a.isDirectory ? -1 : 1;
                            }
                            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
                        })
                        .map((file) => (
                            <div key={file.uri} class="file_button" onClick={() => onFolderClick(file)} onTouchStart={() => handleTouchStart(file)} onTouchEnd={handleTouchCancel} onTouchMove={handleTouchCancel}>
                                <span class="icon_wrapper" renderString={getFileIcon(file.name, file.isDirectory)}></span>
                                <span class="file_name">
                                    {file.name}
                                </span>
                            </div>
                        ))
                )}
            </div>

            {showModal() && (
                <div>
                    <div class="modal_overlay" onClick={() => {setShowModal(false); setSelectedFileUri('')}}></div>
                    <div class="modal">
                        <h4>{selectedFileName()}</h4>
                        {selectedFileName() && selectedFileIsFolder() && (
                            <button onClick={handleOpenFolderInEditor}>Open in editor</button>
                        )}
                        <button onClick={() => {setRenameModalShow(true); setNewName(selectedFileName()); setShowModal(false)}}>Rename</button>
                        <button onClick={() => {setDelConModShow(true); setShowModal(false)}}>Delete</button>
                        <button onClick={() => {navigator.clipboard.writeText(selectedFileUri()); setShowModal(false)}}>Copy path</button>
                    </div>
                </div>
            )}

            {renameModalShow() && (
                <div>
                    <div class="modal_overlay" onClick={() => {setSelectedFileUri('')}}></div>
                    <div class="modal input_modal">
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
                    <div class="modal_overlay" onClick={() => {setSelectedFileUri('')}}></div>
                    <div class="modal input_modal">
                        <h4>WARNING</h4>
                        <p>Are you sure you want to permanently delete "{selectedFileName()}"? This action cannot be undone.</p>
                        <div class="action">
                            <button onClick={() => setDelConModShow(false)}>CANCEL</button>
                            <button onClick={()=> handleDelete()}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {fileModalShow() && (
                <div>
                    <div class="modal_overlay"></div>
                    <div class="modal input_modal">
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
                    <div class="modal_overlay"></div>
                    <div class="modal input_modal">
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