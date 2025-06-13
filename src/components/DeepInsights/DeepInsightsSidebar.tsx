
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FileSelectionSection } from './FileSelectionSection';

interface DeepInsightsSidebarProps {
  files: any[];
  selectedFileIds: string[];
  toggleFileSelection: (fileId: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  isGenerating: boolean;
  onGenerateSummary: () => void;
}

export const DeepInsightsSidebar: React.FC<DeepInsightsSidebarProps> = ({
  files,
  selectedFileIds,
  toggleFileSelection,
  fileName,
  setFileName,
  isGenerating,
  onGenerateSummary,
}) => {
  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-white hover:text-purple-500 mb-2">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-white">Deep Insights</h1>
      </div>

      {/* File Selection - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        <FileSelectionSection
          files={files}
          selectedFileIds={selectedFileIds}
          toggleFileSelection={toggleFileSelection}
        />
      </div>

      {/* Summary Generation - Fixed at bottom */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0 bg-gray-800">
        <h3 className="text-white font-semibold mb-3">Generate Summary</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="fileName" className="text-white text-sm">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter summary file name"
              className="bg-gray-700 border-gray-600 text-white mt-1 text-sm"
            />
          </div>

          <Button
            onClick={onGenerateSummary}
            disabled={isGenerating || !fileName.trim() || selectedFileIds.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-3 w-3" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
