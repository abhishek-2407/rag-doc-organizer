
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import axios from 'axios';


// Define ApiUrl here - in a real app, this would come from environment variables
// const ApiUrl = 'https://api.example.com';
const UserId = 'user123';

import { ApiUrl } from '@/Constants';

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


  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await axios.get(`${ApiUrl}/doc-eval/get-files-and-folders`);
      const data = response.data;
      if (data.status === 'success') {
        processFetchedData(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoadingFiles(false);
    }
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
