// src/pages/files/File.tsx
import { mount, state } from "levelojs";
import { ArrowLeft, Plus } from "kivex-levelo";
import './files.css';
import { handleOpenFolder, getSavedFiles, subFolderFiles, showToast, getFileContent } from "../../components/FileManager";
import { fileItem, folderStackItem } from "./types/file";
import { setActiveFileData } from "../home/Home";
import { FileActions } from "./components/fileactions/FileActions";
import { getFileIcon } from "../../assets/icons/fileIconMapper";
import folderIcon from "../../assets/icons/fileicons/folder.svg";

export default function Files() {
    const [files, setFiles] = state<fileItem[]>([]);
    const [stack, setStack] = state<folderStackItem[]>([]);

    mount(() => {
        const initialFiles = getSavedFiles();
        if (initialFiles.length > 0) {
            setFiles(initialFiles);
        }
        setStack([{ name: 'Root', uri: 'root', files: initialFiles}])
    })

    const selectFolder = () => {
        handleOpenFolder((fetchedFiles) => {
            setFiles(fetchedFiles);
            setStack([{ name: 'Root', uri: 'root', files: fetchedFiles }]);
        });
    };

    const onFolderClick = (item: fileItem) => {
        if (item.isDirectory) {
            const sub_folder_files = subFolderFiles(item.uri);
            setFiles(sub_folder_files);
            setStack([ ...stack(), { name: item.name, uri: item.uri, files: sub_folder_files }]);
        } else {
            const rawContent = getFileContent(item.uri);
            setActiveFileData({
                name: item.name,
                content: rawContent,
                path: item.uri,
            });
            window.history.back();
        }
    }

    const handleBreadcrumbClick = (targetIndex: number) => {
        const currentStack = stack();

        if (targetIndex === currentStack.length - 1) return;

        const newStack = currentStack.slice(0, targetIndex + 1);
        const targetFolder = newStack[newStack.length - 1];

        setStack(newStack);
        setFiles(targetFolder.files);
    }

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
                    <button onClick={selectFolder}>
                        <Plus class="svg" />
                    </button>

                    <FileActions />

                </div>
            </div>
            
            <div class="breadcrumb">
                <span class="folder_name">/›</span>
                {stack().map((item, index) => (
                    <div key={item.uri} class="breadcrumb_item">
                        <span class={`folder_name ${index === stack().length - 1 ? 'active' : ''}`} onClick={() => handleBreadcrumbClick(index)}>{item.name}</span>
                        {index < stack().length - 1 && (
                            <span class="separator">›</span>
                        )}
                    </div>
                ))}
            </div>

            <div class="content">
                {files().length === 0 ? (
                    <p class="file_blank">No folder opened yet</p>
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
                            <div key={file.uri} class="file_button" onClick={() => onFolderClick(file)}>
                                <span class="icon_wrapper" renderString={getFileIcon(file.name, file.isDirectory)}></span>
                                <span class="file_name">
                                    {file.name}
                                </span>
                            </div>
                        ))
                )}
            </div>
        </div>
    )
}