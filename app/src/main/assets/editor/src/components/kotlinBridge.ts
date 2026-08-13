// src/components/kotlinBridge.ts
export function handlePreview(path: string): boolean {
    if ((window as any).AndroidBridge) {
        const isSuccess = (window as any).AndroidBridge.onPreview(path);
        if (isSuccess) return true;
        return false;
    }
    return false
}

export function loadInstalledExtensions() {
    if ((window as any).AndroidBridge && (window as any).AndroidBridge.getInstalledExtensions) {
        try {
            const jsonString = (window as any).AndroidBridge.getInstalledExtensions();
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse extensions json:", e);
            return [];
        }
    }
    return [];
}

export function selectExtension(callback?: (success: boolean) => void) {
    if ((window as any).AndroidBridge) {
        (window as any).onExtensionImportResult = (isSuccess: boolean) => {
            if (callback) callback(isSuccess);
        };
        (window as any).AndroidBridge.selectExtension();
    } else {
        if (callback) callback(false);
    }
}

export function loadExtensionMainCode(folderPath: string): string {
    if ((window as any).AndroidBridge && (window as any).AndroidBridge.loadExtension) {
        return (window as any).AndroidBridge.loadExtension(folderPath);
    }
    return "";
}