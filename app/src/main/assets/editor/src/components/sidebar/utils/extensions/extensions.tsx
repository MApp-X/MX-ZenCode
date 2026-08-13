import { Plus } from 'kivex-levelo';
import './extensions.css';
import { loadInstalledExtensions, selectExtension, loadExtensionMainCode } from '../../../kotlinBridge';
import { mount, state } from 'levelojs';
import { showToast } from '../../../FileManager';

interface ExtensionsList {
    folderName: string;
    path: string;
}

export const [vsDark, setVsDark] = state("");

export function Extensions() {
    const [extensions, setExtensions] = state<ExtensionsList[]>([]);

    mount(() => {
        const list = loadInstalledExtensions();
        setExtensions(list);
    });

    const handleImport = () => {
        selectExtension((success) => {
            if (success) {
                const updatedList = loadInstalledExtensions();
                setExtensions(updatedList);
            }
        });
    };

    const handleApplyExtension = (path: string) => {
        const code = loadExtensionMainCode(path);
        if (code) {
            showToast("succssfully load")
            setVsDark(code);
            alert(code)
        } else {
            showToast("failed to load")
        }
    };

    return (
        <div class="extensions-container">
            <div class="extensions-header">
                <h3>Installed Extensions</h3>
                <button class="import-btn" onClick={handleImport} title="Import Extension Zip">
                    <Plus size={18} class="svg" />
                </button>
            </div>

            <div class="extensions-list">
                {extensions() && extensions().length > 0 ? (
                    extensions().map((ex) => (
                        <div class="extension-card" onClick={() => handleApplyExtension(ex.path)}>
                            <div class="extension-info">
                                <span class="extension-name">{ex.folderName}</span>
                                <span class="extension-path">{ex.path}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div class="extensions-empty">
                        <p>No extensions installed</p>
                    </div>
                )}
            </div>
        </div>
    );
}