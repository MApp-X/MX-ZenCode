export interface fileItem {
    name: string,
    uri: string,
    isDirectory: boolean,
}
interface folderStackItem {
  name: string;
  uri: string;
  files: fileItem[];
}