
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import axios from 'axios';
import { ApiUrl, UserId } from '@/Constants';

export interface FileItem {
  folder_name: string;
  file_id: string;
  file_name: string;
  s3_file_url?: string;
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
      // Use the same API endpoint as FolderManager component
      const response = await axios.get(`${ApiUrl}/doc-eval/get-files-and-folders`);
      const data = response.data;
      
      if (data.status === 'success') {
        processFetchedData(data);
      } else {
        toast({ 
          title: "Error", 
          description: data.message || "Failed to fetch files", 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to fetch files", 
        variant: "destructive" 
      });
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

        // Build folder structure
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
