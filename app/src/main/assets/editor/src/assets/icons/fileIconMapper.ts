import { exactFileNameMap } from "./exactFileNameMap";
import { iconExtensionMap } from "./iconExtensionMap";

// Load all SVG files as raw strings at build/runtime
const rawIcons = import.meta.glob('./fileicons/*.svg', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;

/**
 * Returns raw SVG string directly for any given filename or folder
 */
export function getFileIcon(fileName: string, isDirectory: boolean = false): string {
    if (isDirectory) {
        return rawIcons['./fileicons/folder.svg'] || '';
    }

    const lowerName = fileName.toLowerCase().trim();

    // 1. Check exact filename match
    if (exactFileNameMap[lowerName]) {
        const iconName = exactFileNameMap[lowerName];
        return rawIcons[`./fileicons/${iconName}`] || rawIcons['./fileicons/default.svg'] || '';
    }

    // 2. Check extension match
    const ext = lowerName.split(".").pop() || "";
    if (iconExtensionMap[ext]) {
        const iconName = iconExtensionMap[ext];
        return rawIcons[`./fileicons/${iconName}`] || rawIcons['./fileicons/default.svg'] || '';
    }

    // 3. Fallback to default icon
    return rawIcons['./fileicons/default.svg'] || '';
}