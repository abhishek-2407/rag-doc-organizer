
import React from 'react';
import { FilesByFolder } from './useDocumentManager';
import { toast } from "@/components/ui/use-toast";
import axios from 'axios';
import { ApiUrl } from '@/Constants';

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

  try {
    // Create FormData for file upload
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('thread_id', folderPath);
    formData.append('user_id', "11111111-1111-1111-1111-111111111111");

    // Make the API call
    const response = await axios.post(
      `${ApiUrl}/doc-eval/upload-files`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (response.data.status === 'success') {
      // Get the uploaded files from the response and add them to the state
      const uploadedFiles = response.data.data.map((file: any) => ({
        file_name: file.file_name,
        file_id: file.file_id,
        folder_name: folderPath,
        rag_status: false
      }));

      setFilesByFolder(prev => ({
        ...prev,
        [folderPath]: [...(prev[folderPath] || []), ...uploadedFiles]
      }));
      setPendingUploads(prev => ({ ...prev, [folderPath]: [] }));
      toast({ title: "Success", description: "Files uploaded successfully!" });
    } else {
      toast({ title: "Error", description: response.data.message || "Upload failed", variant: "destructive" });
    }
  } catch (error: any) {
    console.error("Error uploading files:", error);
    toast({ 
      title: "Error", 
      description: error.response?.data?.message || "Failed to upload files", 
      variant: "destructive" 
    });
  } finally {
    setLoadingUpload(prev => ({ ...prev, [folderPath]: false }));
  }
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
  
  try {
    // Make the API call to create RAG
    const response = await axios.post(`${ApiUrl}/doc-eval/create-rag`, {
      file_id: fileId,
      user_id: "11111111-1111-1111-1111-111111111111"
    });

    if (response.data.status === 'success') {
      const updated = filesByFolder[folderPath].map(file =>
        file.file_id === fileId ? { ...file, rag_status: true } : file
      );
      
      setFilesByFolder(prev => ({ ...prev, [folderPath]: updated }));
      toast({ title: "Success", description: "RAG created successfully!" });
    } else {
      toast({ 
        title: "Error", 
        description: response.data.message || "Failed to create RAG", 
        variant: "destructive" 
      });
    }
  } catch (error: any) {
    console.error("Error creating RAG:", error);
    toast({ 
      title: "Error", 
      description: error.response?.data?.message || "Failed to create RAG", 
      variant: "destructive" 
    });
  } finally {
    setLoadingRAG(prev => ({ ...prev, [fileId]: false }));
  }
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
  
  try {
    // Make the API call to delete the file
    const response = await axios.delete(`${ApiUrl}/doc-eval/delete-file`, {
      data: {
        file_id: fileId,
        user_id: "11111111-1111-1111-1111-111111111111"
      }
    });

    if (response.data.status === 'success') {
      const updated = filesByFolder[folderPath].filter(f => f.file_id !== fileId);
      setFilesByFolder(prev => ({ ...prev, [folderPath]: updated }));
      toast({ title: "Success", description: "File deleted successfully!" });
    } else {
      toast({ 
        title: "Error", 
        description: response.data.message || "Failed to delete file", 
        variant: "destructive" 
      });
    }
  } catch (error: any) {
    console.error("Error deleting file:", error);
    toast({ 
      title: "Error", 
      description: error.response?.data?.message || "Failed to delete file", 
      variant: "destructive" 
    });
  } finally {
    setLoadingDelete(prev => ({ ...prev, [fileId]: false }));
  }
};
