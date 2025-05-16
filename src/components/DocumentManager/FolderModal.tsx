
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { X, Folder, File, ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  folderStructure: any;
  filesByFolder: any;
  pendingUploads: any;
  setPendingUploads: (value: any) => void;
  handleFileSelection: (e: React.ChangeEvent<HTMLInputElement>, folderPath: string) => void;
  handleUploadDocuments: (folderPath: string) => void;
  handleCreateRAG: (fileId: string, folderPath: string) => void;
  handleDeleteFile: (fileId: string, folderPath: string) => void;
  loadingUpload: any;
  loadingRAG: any;
  loadingDelete: any;
  collapsedFolders: any;
  setCollapsedFolders: (value: any) => void;
  onCreateChildFolder: (folderPath: string) => void;
}

const FolderModal = ({
  isOpen,
  onClose,
  folderName,
  folderStructure,
  filesByFolder,
  pendingUploads,
  setPendingUploads,
  handleFileSelection,
  handleUploadDocuments,
  handleCreateRAG,
  handleDeleteFile,
  loadingUpload,
  loadingRAG,
  loadingDelete,
  collapsedFolders,
  setCollapsedFolders,
  onCreateChildFolder
}: FolderModalProps) => {
  // Toggle folder collapse state
  const toggleCollapse = (folderPath: string) => {
    setCollapsedFolders((prev: any) => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  // Render folder content including files and upload controls
  const renderFolderContent = (folderPath: string) => (
    <div className="folder-content bg-gray-800 p-4 rounded-lg mt-2 mb-3">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <label className="bg-gray-700 rounded-lg px-3 py-2 text-white cursor-pointer hover:bg-gray-600 transition flex items-center gap-1">
          <input 
            type="file" 
            className="hidden" 
            multiple 
            onChange={(e) => handleFileSelection(e, folderPath)} 
            accept="application/pdf"
          />
          <Plus size={16} /> Select Files
        </label>
        <Button 
          onClick={() => handleUploadDocuments(folderPath)} 
          disabled={loadingUpload[folderPath] || !(pendingUploads[folderPath]?.length > 0)}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {loadingUpload[folderPath] ? 'Uploading...' : 'Upload Files'}
        </Button>
        
        {/* Add button to create folder inside current folder */}
        <Button 
          onClick={() => {
            onClose();
            onCreateChildFolder(folderPath);
          }}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <Plus size={16} className="mr-1" /> Add Folder
        </Button>
      </div>

      {(pendingUploads[folderPath] || []).length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Pending Uploads:</h4>
          <ul className="space-y-1">
            {pendingUploads[folderPath].map((file: File, idx: number) => (
              <li key={idx} className="flex justify-between items-center text-sm text-white">
                <span className="truncate flex-1">{file.name}</span>
                <button 
                  onClick={() => setPendingUploads((prev: any) => ({
                    ...prev,
                    [folderPath]: prev[folderPath].filter((_: any, i: number) => i !== idx)
                  }))}
                  className="ml-2 text-gray-400 hover:text-red-400 transition p-1"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(filesByFolder[folderPath]?.length > 0) ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-gray-700 text-gray-300">
              <tr>
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2">RAG Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filesByFolder[folderPath].map((file: any) => (
                <tr key={file.file_id} className="border-b border-gray-700">
                  <td className="px-4 py-2 font-medium flex items-center">
                    <File size={16} className="mr-2 text-gray-400" />
                    {file.file_name}
                  </td>
                  <td className="px-4 py-2">
                    {file.rag_status ? 
                      <span className="text-green-400">✓ Complete</span> : 
                      <span className="text-yellow-400">Pending</span>
                    }
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    {!file.rag_status && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCreateRAG(file.file_id, folderPath)}
                        disabled={loadingRAG[file.file_id]}
                        className="bg-amber-600 hover:bg-amber-700 h-8 text-xs"
                      >
                        {loadingRAG[file.file_id] ? 'Creating...' : 'Create RAG'}
                      </Button>
                    )}
                    <Button 
                      size="sm"
                      variant="destructive" 
                      onClick={() => handleDeleteFile(file.file_id, folderPath)}
                      disabled={loadingDelete[file.file_id]}
                      className="h-8 text-xs"
                    >
                      {loadingDelete[file.file_id] ? 'Deleting...' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-4 text-gray-400 italic">
          No files in this folder
        </div>
      )}
    </div>
  );

  // Recursively render a folder and its subfolders
  const renderFolder = (folderName: string, structure: any, path = '', depth = 0) => {
    const currentPath = path ? `${path}/${folderName}` : folderName;
    const isCollapsed = collapsedFolders[currentPath];
    const hasSubfolders = Object.keys(structure).length > 0;

    return (
      <div key={currentPath} className={cn("border-l-2 pl-4 border-pink-600 mb-3", depth > 0 ? "ml-4" : "")}>
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-700 px-2 py-1 rounded"
          onClick={() => toggleCollapse(currentPath)}
        >
          {isCollapsed ? 
            <ArrowDown size={16} className="text-gray-400 mr-2" /> : 
            <ArrowUp size={16} className="text-gray-400 mr-2" />
          }
          <Folder size={18} className="text-pink-500 mr-2" />
          <span className="font-medium text-white">{folderName}</span>
        </div>
        
        {!isCollapsed && (
          <div className="mt-2">
            {hasSubfolders && (
              <div className="pl-2">
                {Object.keys(structure).map(sub =>
                  renderFolder(sub, structure[sub], currentPath, depth + 1)
                )}
              </div>
            )}
            {renderFolderContent(currentPath)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Folder className="text-pink-500" />
            {folderName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {renderFolder(folderName, folderStructure[folderName] || {})}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FolderModal;
