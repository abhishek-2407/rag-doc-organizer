
import React from 'react';
import { useDocumentManager } from './useDocumentManager';
import { handleCreateFolder, handleCreateChildFolder } from './folderUtils';
import FolderTile from './FolderTile';
import FolderModal from './FolderModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

const DocumentManager = () => {
  const {
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
    setIsModalOpen
  } = useDocumentManager();

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
          onClick={() => handleCreateFolder(newFolderName, folderStructure, setFolderStructure, 
            filesByFolder, setFilesByFolder, setNewFolderName)}
          className="bg-pink-600 hover:bg-pink-700 flex items-center gap-2"
        >
          <Plus size={16} /> Create Folder
        </Button>
      </div>

      {parentFolderForChildFolder && (
        <div className="bg-gray-800 p-4 rounded-lg mb-8 max-w-2xl mx-auto border border-gray-700">
          <h3 className="text-lg text-gray-300 mb-2">Creating folder inside: <span className="font-bold text-pink-400">{parentFolderForChildFolder}</span></h3>
          <div className="flex flex-wrap gap-3">
            <Input
              type="text"
              value={newChildFolderName}
              placeholder="Child Folder Name"
              onChange={(e) => setNewChildFolderName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white flex-1"
            />
            <Button 
              onClick={() => handleCreateChildFolder(newChildFolderName, parentFolderForChildFolder, 
                folderStructure, setFolderStructure, filesByFolder, setFilesByFolder, 
                setNewChildFolderName, setParentFolderForChildFolder)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Create
            </Button>
            <Button 
              onClick={() => setParentFolderForChildFolder(null)}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

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
          loadingUpload={loadingUpload}
          setLoadingUpload={setLoadingUpload}
          loadingRAG={loadingRAG}
          setLoadingRAG={setLoadingRAG}
          loadingDelete={loadingDelete}
          setLoadingDelete={setLoadingDelete}
          collapsedFolders={collapsedFolders}
          setCollapsedFolders={setCollapsedFolders}
          onCreateChildFolder={setParentFolderForChildFolder}
          setFilesByFolder={setFilesByFolder}
        />
      )}
    </div>
  );
};

export default DocumentManager;
