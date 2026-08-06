// src/components/FileManager.ts
import { fileItem } from "../pages/files/types/file";

export function handleOpenFolder(onSelect: (files: fileItem[]) => void) {
    if ((window as any).AndroidBridge) {
      (window as any).onFolderSelected = (fileListJson: string) => {
        const files: fileItem[] = JSON.parse(fileListJson);
        onSelect(files);
      }
      (window as any).AndroidBridge.openFolderPicker();
    }
}

export function getSavedFiles(): fileItem[] {
  if ((window as any).AndroidBridge) {
    try {
      const savedJson = (window as any).AndroidBridge.getSavedFolderFiles();
      return JSON.parse(savedJson || "[]");
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function subFolderFiles(subFolderUri: string): fileItem[] {
  if ((window as any).AndroidBridge) {
    try {
      const jsonString = (window as any).AndroidBridge.getSubFolderFiles(subFolderUri);
      return JSON.parse(jsonString || "[]");
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function showToast(msg: string) {
  if ((window as any).AndroidBridge) {
    (window as any).AndroidBridge.showToast(msg);
  }
}

export function getFileContent(fileUri: string) {
  if ((window as any).AndroidBridge) {
    try {
      const content = (window as any).AndroidBridge.readFile(fileUri);
      return content;
    } catch (e) {
      return '';
    }
  }
}

export function saveFileContent(fileUri?: string, fileContent?: string) : boolean {
  if ((window as any).AndroidBridge) {
    const isSuccess = (window as any).AndroidBridge.saveFile(fileUri, fileContent);
    return  isSuccess;
  } else {
    return false;
  }
}

export function renameItem(fileUri?:string, newName?:string): boolean {
  if ((window as any).AndroidBridge) {
    const isSuccess = (window as any).AndroidBridge.renameFile(fileUri, newName);
    return isSuccess;
  } else {
    return false;
  }
}

export function deleteItem(fileUri?:string): boolean {
  if ((window as any).AndroidBridge) {
    const isSuccess = (window as any).AndroidBridge.deleteFile(fileUri);
    return isSuccess;
  } else {
    return false;
  }
}

export function createNewFolder(parentUri: string, name: string): boolean {
  if ((window as any).AndroidBridge) {
    const isSuccess = (window as any).AndroidBridge.createNewFolder(parentUri, name);
    return isSuccess;
  } else {
    return false;
  }
}

export function createNewFile(parentUri: string, name: string): boolean {
  if ((window as any).AndroidBridge) {
    const isSuccess = (window as any).AndroidBridge.createNewFile(parentUri, name);
    return isSuccess;
  } else {
    return false;
  }
}

export function checkDir(uri: string): string {
  if ((window as any).AndroidBridge) {
    const dataJson = (window as any).AndroidBridge.checkDir(uri);
    return dataJson;
  } else {
    return '';
  }
}

export function uriFormat(uri: string): string {
  if ((window as any).AndroidBridge) {
    const formatedURI = (window as any).AndroidBridge.uriFormat(uri);
    return formatedURI;
  } else {
    return '';
  }
}