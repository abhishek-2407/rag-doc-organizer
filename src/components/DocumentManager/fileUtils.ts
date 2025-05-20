
import React from 'react';
import { FilesByFolder } from './useDocumentManager';
import { toast } from "@/components/ui/use-toast";
import axios from 'axios';
import { ApiUrl, UserId } from '@/Constants';

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
    // Create payload format for the API
    const payload = files.map(file => ({
      fileName: file.name,
      fileType: file.type
    }));

    // Make the API call with the correct format
    const { data } = await axios.post(`${ApiUrl}/doc-eval/get-presigned-urls`, {
      user_id: UserId,
      files: payload,
      folder_name: folderPath,
      thread_id: folderPath.split('/')[0]
    });

    if (data.status_code === 200) {
      // Upload each file with presigned URL
      const uploaded = await Promise.all(
        data.urls.map(async (urlObj: any, index: number) => {
          const file = files[index];
          await axios.put(urlObj.presigned_url, file, {
            headers: { 'Content-Type': file.type }
          });
          return {
            file_name: file.name,
            s3_file_url: urlObj.file_url,
            file_id: urlObj.file_id,
            folder_name: folderPath,
            rag_status: false
          };
        })
      );

      // Update UI state
      setFilesByFolder(prev => ({
        ...prev,
        [folderPath]: [...(prev[folderPath] || []), ...uploaded]
      }));
      setPendingUploads(prev => ({ ...prev, [folderPath]: [] }));
      toast({ title: "Success", description: "Files uploaded successfully!" });
    } else {
      toast({ 
        title: "Error", 
        description: data.message || "Upload failed", 
        variant: "destructive" 
      });
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
    // Make the API call to create RAG with the correct payload structure
    const { data } = await axios.post(`${ApiUrl}/doc-eval/create-knowledge-base`, {
      file_id_list: [fileId],
      thread_id: folderPath.split('/')[0],
      upload_type: "file",
      user_id: UserId
    });

    if (data.status === 'success') {
      // Update file status in UI
      const updated = filesByFolder[folderPath].map(file =>
        file.file_id === fileId ? { ...file, rag_status: true } : file
      );
      
      setFilesByFolder(prev => ({ ...prev, [folderPath]: updated }));
      toast({ title: "Success", description: "RAG created successfully!" });
    } else {
      toast({ 
        title: "Error", 
        description: data.message || "Failed to create RAG", 
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
    // Make the API call to delete the file with the correct payload
    const { data } = await axios.post(`${ApiUrl}/doc-eval/delete-file`, {
      file_id: fileId,
      thread_id: folderPath.split('/')[0]
    });

    if (data.status === 200 || data.status === 'success') {
      // Remove the file from UI
      const updated = filesByFolder[folderPath].filter(f => f.file_id !== fileId);
      setFilesByFolder(prev => ({ ...prev, [folderPath]: updated }));
      toast({ title: "Success", description: "File deleted successfully!" });
    } else {
      toast({ 
        title: "Error", 
        description: data.message || "Failed to delete file", 
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
