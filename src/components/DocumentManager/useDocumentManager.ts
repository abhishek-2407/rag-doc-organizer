
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

// Define ApiUrl here - in a real app, this would come from environment variables
const ApiUrl = 'https://api.example.com';
const UserId = 'user123';

export interface FileItem {
  folder_name: string;
  file_id: string;
  file_name: string;
  rag_status: boolean;
}

export interface FolderStructure {
  [key: string]: FolderStructure;
}

export interface FilesByFolder {
  [key: string]: FileItem[];
}

export const useDocumentManager = () => {
  const [newFolderName, setNewFolderName] = useState('');
  const [newChildFolderName, setNewChildFolderName] = useState('');
  const [parentFolderForChildFolder, setParentFolderForChildFolder] = useState<string | null>(null);
  const [filesByFolder, setFilesByFolder] = useState<FilesByFolder>({});
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [pendingUploads, setPendingUploads] = useState<Record<string, File[]>>({});
  const [loadingUpload, setLoadingUpload] = useState<Record<string, boolean>>({});
  const [loadingRAG, setLoadingRAG] = useState<Record<string, boolean>>({});
  const [loadingDelete, setLoadingDelete] = useState<Record<string, boolean>>({});
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  
  // Modal state
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  // Simulated fetch function - in a real app, this would make an API call
  const fetchFiles = async () => {
    setLoadingFiles(true);
    
    // Simulated data - in production this would come from your API
    setTimeout(() => {
      const mockData = {
        status: 'success',
        data: [
          { folder_name: 'Project A', file_id: 'file1', file_name: 'document1.pdf', rag_status: true },
          { folder_name: 'Project A', file_id: 'file2', file_name: 'document2.pdf', rag_status: false },
          { folder_name: 'Project B', file_id: 'file3', file_name: 'document3.pdf', rag_status: false },
          { folder_name: 'Project B/Research', file_id: 'file4', file_name: 'research.pdf', rag_status: true },
          { folder_name: 'Project C/Data/Results', file_id: 'file5', file_name: 'results.pdf', rag_status: false }
        ]
      };
      
      processFetchedData(mockData);
      setLoadingFiles(false);
    }, 1000);
  };

  const processFetchedData = (response: any) => {
    if (response.status === 'success') {
      const folderMap: Record<string, any[]> = {};
      const structureMap: Record<string, any> = {};

      response.data.forEach((file: any) => {
        const folderPath = file.folder_name;
        if (!folderMap[folderPath]) folderMap[folderPath] = [];
        folderMap[folderPath].push(file);

        const pathParts = folderPath.split('/');
        let currentLevel = structureMap;
        pathParts.forEach((part: string) => {
          if (!currentLevel[part]) currentLevel[part] = {};
          currentLevel = currentLevel[part];
        });
      });

      setFilesByFolder(folderMap);
      setFolderStructure(structureMap);
    }
  };

  return {
    newFolderName,
    setNewFolderName,
    newChildFolderName,
    setNewChildFolderName,
    parentFolderForChildFolder,
    setParentFolderForChildFolder,
    filesByFolder,
    setFilesByFolder,
    folderStructure,
    setFolderStructure,
    pendingUploads,
    setPendingUploads,
    loadingUpload,
    setLoadingUpload,
    loadingRAG,
    setLoadingRAG,
    loadingDelete,
    setLoadingDelete,
    loadingFiles,
    collapsedFolders,
    setCollapsedFolders,
    selectedFolder,
    setSelectedFolder,
    isModalOpen,
    setIsModalOpen,
    fetchFiles
  };
};
