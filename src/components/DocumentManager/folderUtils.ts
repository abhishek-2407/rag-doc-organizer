
import { toast } from "@/components/ui/use-toast";
import { FolderStructure, FilesByFolder } from './useDocumentManager';

export const handleCreateFolder = (
  newFolderName: string,
  folderStructure: FolderStructure,
  setFolderStructure: React.Dispatch<React.SetStateAction<FolderStructure>>,
  filesByFolder: FilesByFolder,
  setFilesByFolder: React.Dispatch<React.SetStateAction<FilesByFolder>>,
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>
) => {
  if (!newFolderName.trim()) {
    toast({ title: "Error", description: "Folder name cannot be empty", variant: "destructive" });
    return;
  }
  
  if (!Object.keys(folderStructure).includes(newFolderName)) {
    setFolderStructure(prev => ({ ...prev, [newFolderName]: {} }));
    setFilesByFolder(prev => ({ ...prev, [newFolderName]: [] }));
    setNewFolderName('');
    toast({ title: "Success", description: `Folder "${newFolderName}" created successfully!` });
  } else {
    toast({ title: "Error", description: "Folder already exists", variant: "destructive" });
  }
};

export const handleCreateChildFolder = (
  newChildFolderName: string,
  parentFolderForChildFolder: string | null,
  folderStructure: FolderStructure,
  setFolderStructure: React.Dispatch<React.SetStateAction<FolderStructure>>,
  filesByFolder: FilesByFolder,
  setFilesByFolder: React.Dispatch<React.SetStateAction<FilesByFolder>>,
  setNewChildFolderName: React.Dispatch<React.SetStateAction<string>>,
  setParentFolderForChildFolder: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!newChildFolderName.trim() || !parentFolderForChildFolder) {
    toast({ 
      title: "Error", 
      description: "Child folder name cannot be empty and parent folder must be selected", 
      variant: "destructive" 
    });
    return;
  }
  
  const newPath = `${parentFolderForChildFolder}/${newChildFolderName}`;
  
  // Check if the folder already exists at this path
  const folderPaths = Object.keys(filesByFolder);
  if (folderPaths.includes(newPath)) {
    toast({ title: "Error", description: "Folder already exists at this path", variant: "destructive" });
    return;
  }
  
  // Update the folder structure
  setFolderStructure(prev => {
    const updated = {...prev};
    let parentFolder = updated;
    
    // Navigate to the parent folder in the structure
    const parts = parentFolderForChildFolder.split('/');
    for (const part of parts) {
      parentFolder = parentFolder[part];
    }
    
    // Add the new folder to the parent
    parentFolder[newChildFolderName] = {};
    
    return updated;
  });
  
  // Update the files by folder
  setFilesByFolder(prev => ({ ...prev, [newPath]: [] }));
  
  // Reset state
  setNewChildFolderName('');
  setParentFolderForChildFolder(null);
  
  toast({ 
    title: "Success", 
    description: `Folder "${newChildFolderName}" created successfully inside "${parentFolderForChildFolder}"!` 
  });
};
