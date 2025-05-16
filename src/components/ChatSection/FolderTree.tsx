
import React from 'react';
import { ChevronRight, FolderOpen, File } from 'lucide-react';
import { FolderNode, FileItem } from './useFileSelection';

interface FolderTreeProps {
    folder: FolderNode;
    level?: number;
    openFolders: Record<string, boolean>;
    toggleFolder: (path: string) => void;
    selectedFileIds: string[];
    toggleFileSelection: (fileId: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ 
    folder, 
    level = 0, 
    openFolders, 
    toggleFolder, 
    selectedFileIds, 
    toggleFileSelection 
}) => {
    const folderKeys = Object.keys(folder.children);
    
    return (
        <>
            {folderKeys.map(key => {
                const childFolder = folder.children[key];
                return (
                    <div key={childFolder.path} className="folder" style={{ marginLeft: `${level * 16}px` }}>
                        <div className="folder-header" onClick={() => toggleFolder(childFolder.path!)}>
                            <ChevronRight 
                                className={`folder-icon ${openFolders[childFolder.path!] ? 'open' : ''}`} 
                                size={16} 
                            />
                            <FolderOpen size={16} />
                            <span className="folder-name">{childFolder.name}</span>
                        </div>

                        {openFolders[childFolder.path!] && (
                            <div className="folder-content">
                                <FolderTree 
                                    folder={childFolder} 
                                    level={level + 1} 
                                    openFolders={openFolders}
                                    toggleFolder={toggleFolder}
                                    selectedFileIds={selectedFileIds}
                                    toggleFileSelection={toggleFileSelection}
                                />
                                
                                {childFolder.files.map(file => {
                                    const fileName = file.file_name.split('/').pop();
                                    return (
                                        <div 
                                            key={file.file_id} 
                                            className="file-item"
                                            style={{ marginLeft: `${(level + 1) * 16}px` }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="file-checkbox"
                                                checked={selectedFileIds.includes(file.file_id)}
                                                onChange={() => toggleFileSelection(file.file_id)}
                                            />
                                            <File size={14} />
                                            <span className="file-name">{fileName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
};
