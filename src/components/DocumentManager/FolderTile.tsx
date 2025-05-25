
import React from 'react';
import { Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FolderTileProps {
  folderName: string;
  onClick: () => void;
}

const FolderTile = ({ folderName, onClick }: FolderTileProps) => {
  return (
    <div
      className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
      onClick={onClick}
    >
      <Folder className="w-16 h-16 text-pink-600 mb-3" />
      <h3 className="text-white font-medium text-center break-words w-full">{folderName}</h3>
    </div>
  );
};

export default FolderTile;
