
import React, { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import FolderTile from './FolderTile';
import FolderModal from './FolderModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

// Define ApiUrl here - in a real app, this would come from environment variables
const ApiUrl = 'https://api.example.com';
const UserId = 'user123';

const DocumentManager = () => {
  const [newFolderName, setNewFolderName] = useState('');
  const [filesByFolder, setFilesByFolder] = useState<Record<string, any[]>>({});
  const [folderStructure, setFolderStructure] = useState<Record<string, any>>({});
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

  const handleCreateFolder = () => {
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

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>, folderPath: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const selectedFiles = Array.from(e.target.files);
    setPendingUploads(prev => ({
      ...prev,
      [folderPath]: [...(prev[folderPath] || []), ...selectedFiles]
    }));
    e.target.value = '';
  };

  const handleUploadDocuments = async (folderPath: string) => {
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

  const handleCreateRAG = async (fileId: string, folderPath: string) => {
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

  const handleDeleteFile = async (fileId: string, folderPath: string) => {
    setLoadingDelete(prev => ({ ...prev, [fileId]: true }));
    
    // Simulate file deletion - in production this would make actual API calls
    setTimeout(() => {
      const updated = filesByFolder[folderPath].filter(f => f.file_id !== fileId);
      setFilesByFolder(prev => ({ ...prev, [folderPath]: updated }));
      toast({ title: "Success", description: "File deleted successfully!" });
      setLoadingDelete(prev => ({ ...prev, [fileId]: false }));
    }, 1000);
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    setIsModalOpen(true);
  };

  return (
    <div className="container py-8 max-w-screen-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-pink-500">Document Manager</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Organize your documents in folders, create RAG knowledge bases, and manage your files efficiently.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8 justify-center">
        <Input
          type="text"
          value={newFolderName}
          placeholder="New Folder Name"
          onChange={(e) => setNewFolderName(e.target.value)}
          className="max-w-xs bg-gray-800 border-gray-700 text-white"
        />
        <Button 
          onClick={handleCreateFolder}
          className="bg-pink-600 hover:bg-pink-700 flex items-center gap-2"
        >
          <Plus size={16} /> Create Folder
        </Button>
      </div>

      {loadingFiles ? (
        <div className="text-center p-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-400">Loading folders and files...</p>
        </div>
      ) : Object.keys(folderStructure).length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-400">No folders found. Create a new folder to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.keys(folderStructure).map((folderName) => (
            <FolderTile 
              key={folderName} 
              folderName={folderName} 
              onClick={() => handleFolderClick(folderName)}
            />
          ))}
        </div>
      )}

      {/* Folder Modal */}
      {selectedFolder && (
        <FolderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          folderName={selectedFolder}
          folderStructure={folderStructure}
          filesByFolder={filesByFolder}
          pendingUploads={pendingUploads}
          setPendingUploads={setPendingUploads}
          handleFileSelection={handleFileSelection}
          handleUploadDocuments={handleUploadDocuments}
          handleCreateRAG={handleCreateRAG}
          handleDeleteFile={handleDeleteFile}
          loadingUpload={loadingUpload}
          loadingRAG={loadingRAG}
          loadingDelete={loadingDelete}
          collapsedFolders={collapsedFolders}
          setCollapsedFolders={setCollapsedFolders}
        />
      )}
    </div>
  );
};

export default DocumentManager;
