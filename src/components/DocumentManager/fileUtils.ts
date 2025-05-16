
import React from 'react';
import { FilesByFolder } from './useDocumentManager';
import { toast } from "@/components/ui/use-toast";

export const handleFileSelection = (
  e: React.ChangeEvent<HTMLInputElement>,
  folderPath: string,
  pendingUploads: Record<string, File[]>,
  setPendingUploads: React.Dispatch<React.SetStateAction<Record<string, File[]>>>
) => {
  if (!e.target.files || e.target.files.length === 0) return;
  
  const selectedFiles = Array.from(e.target.files);
  setPendingUploads(prev => ({
    ...prev,
    [folderPath]: [...(prev[folderPath] || []), ...selectedFiles]
  }));
  e.target.value = '';
};

export const handleUploadDocuments = async (
  folderPath: string,
  pendingUploads: Record<string, File[]>,
  setPendingUploads: React.Dispatch<React.SetStateAction<Record<string, File[]>>>,
  loadingUpload: Record<string, boolean>,
  setLoadingUpload: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  filesByFolder: FilesByFolder,
  setFilesByFolder: React.Dispatch<React.SetStateAction<FilesByFolder>>
) => {
  const files = pendingUploads[folderPath];
  if (!files?.length) return;

  setLoadingUpload(prev => ({ ...prev, [folderPath]: true }));

  // Simulate upload - in production this would make actual API calls
  setTimeout(() => {
    const uploaded = files.map(file => ({
      file_name: file.name,
      file_id: `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      folder_name: folderPath,
      rag_status: false
    }));

    setFilesByFolder(prev => ({
      ...prev,
      [folderPath]: [...(prev[folderPath] || []), ...uploaded]
    }));
    setPendingUploads(prev => ({ ...prev, [folderPath]: [] }));
    toast({ title: "Success", description: "Files uploaded successfully!" });
    setLoadingUpload(prev => ({ ...prev, [folderPath]: false }));
  }, 1500);
};

export const handleCreateRAG = async (
  fileId: string,
  folderPath: string,
  loadingRAG: Record<string, boolean>,
  setLoadingRAG: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  filesByFolder: FilesByFolder,
  setFilesByFolder: React.Dispatch<React.SetStateAction<FilesByFolder>>
) => {
  setLoadingRAG(prev => ({ ...prev, [fileId]: true }));
  
  // Simulate RAG creation - in production this would make actual API calls
  setTimeout(() => {
    const updated = filesByFolder[folderPath].map(file =>
      file.file_id === fileId ? { ...file, rag_status: true } : file
    );
    
    setFilesByFolder(prev => ({ ...prev, [folderPath]: updated }));
    toast({ title: "Success", description: "RAG created successfully!" });
    setLoadingRAG(prev => ({ ...prev, [fileId]: false }));
  }, 1500);
};

export const handleDeleteFile = async (
  fileId: string,
  folderPath: string,
  loadingDelete: Record<string, boolean>,
  setLoadingDelete: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  filesByFolder: FilesByFolder,
  setFilesByFolder: React.Dispatch<React.SetStateAction<FilesByFolder>>
) => {
  setLoadingDelete(prev => ({ ...prev, [fileId]: true }));
  
  // Simulate file deletion - in production this would make actual API calls
  setTimeout(() => {
    const updated = filesByFolder[folderPath].filter(f => f.file_id !== fileId);
    setFilesByFolder(prev => ({ ...prev, [folderPath]: updated }));
    toast({ title: "Success", description: "File deleted successfully!" });
    setLoadingDelete(prev => ({ ...prev, [fileId]: false }));
  }, 1000);
};
