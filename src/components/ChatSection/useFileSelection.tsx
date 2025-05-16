
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { ApiUrl } from '@/Constants';

export interface FileItem {
    file_id: string;
    file_name: string;
    folder_name: string;
    rag_status: boolean;
}

export interface FolderNode {
    name: string;
    path?: string;
    children: { [key: string]: FolderNode };
    files: FileItem[];
}

export const useFileSelection = () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
    const [folderTree, setFolderTree] = useState<FolderNode>({ name: 'root', children: {}, files: [] });
    
    const FILES_URL = `${ApiUrl}/doc-eval/get-final-files`;

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        if (files.length > 0) {
            setFolderTree(buildFolderTree());
        }
    }, [files]);

    const fetchFiles = async () => {
        try {
            const response = await fetch(FILES_URL);
            const data = await response.json();
            
            if (data.status_code === 200) {
                setFiles(data.data);
                // Initialize all folders as closed
                const folderPaths = new Set<string>();
                data.data.forEach((file: FileItem) => {
                    const parts = file.folder_name.split('/');
                    let path = '';
                    parts.forEach(part => {
                        path = path ? `${path}/${part}` : part;
                        folderPaths.add(path);
                    });
                });
                
                const foldersState: Record<string, boolean> = {};
                folderPaths.forEach(path => {
                    foldersState[path] = false;
                });
                setOpenFolders(foldersState);
            }
        } catch (err) {
            console.error("Error fetching files", err);
            toast({ 
                title: "Error", 
                description: "Failed to fetch files", 
                variant: "destructive" 
            });
        }
    };

    const toggleFolder = (folderPath: string) => {
        setOpenFolders(prev => ({
            ...prev,
            [folderPath]: !prev[folderPath]
        }));
    };

    const toggleFileSelection = (fileId: string) => {
        if (selectedFileIds.includes(fileId)) {
            setSelectedFileIds(prev => prev.filter(id => id !== fileId));
        } else {
            setSelectedFileIds(prev => [...prev, fileId]);
        }
    };

    // Build a folder hierarchy tree from the flat list of files
    const buildFolderTree = (): FolderNode => {
        const tree: FolderNode = { name: 'root', children: {}, files: [] };
        
        files.forEach(file => {
            const folderPath = file.folder_name;
            const pathParts = folderPath.split('/').filter(Boolean);
            
            let current = tree;
            
            // Navigate the tree
            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];
                const fullPath = pathParts.slice(0, i + 1).join('/');
                
                if (!current.children[part]) {
                    current.children[part] = {
                        name: part,
                        path: fullPath,
                        children: {},
                        files: []
                    };
                }
                
                current = current.children[part];
            }
            
            // Add file to the current folder
            current.files.push(file);
        });
        
        return tree;
    };

    return {
        files,
        selectedFileIds,
        setSelectedFileIds,
        openFolders,
        toggleFolder,
        toggleFileSelection,
        folderTree,
    };
};
