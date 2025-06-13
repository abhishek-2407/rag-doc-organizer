
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

interface FileSelectionSectionProps {
  files: any[];
  selectedFileIds: string[];
  toggleFileSelection: (fileId: string) => void;
}

export const FileSelectionSection: React.FC<FileSelectionSectionProps> = ({
  files,
  selectedFileIds,
  toggleFileSelection,
}) => {
  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-white font-semibold mb-3">Select Documents</h3>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {files.map((file) => (
            <div
              key={file.file_id}
              className="flex items-start gap-2 p-2 rounded hover:bg-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                className="accent-pink-600 mt-1 flex-shrink-0"
                checked={selectedFileIds.includes(file.file_id)}
                onChange={() => toggleFileSelection(file.file_id)}
              />
              <FileText size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-white text-xs break-words leading-relaxed">
                {file.file_name.split('/').pop()}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="text-xs text-gray-400 mt-2 flex-shrink-0">
        {selectedFileIds.length} file(s) selected
      </div>
    </div>
  );
};
