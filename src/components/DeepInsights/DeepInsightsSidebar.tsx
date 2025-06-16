import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="w-96 h-screen bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header - fixed height */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center ">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-500 hover:bg-gray-600">
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white ml-1">Deep Insights</h1>
        </div>
      </div>

      {/* Scrollable File List */}
      <div className="flex-1 overflow-y-auto">
        <FileSelectionSection
          files={files}
          selectedFileIds={selectedFileIds}
          toggleFileSelection={toggleFileSelection}
        />
      </div>

      {/* Fixed Generate Summary Section */}
      <div className="p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
        <h3 className="text-white font-semibold mb-3">Generate Summary</h3>
        <div className="space-y-3">
          <div>
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
