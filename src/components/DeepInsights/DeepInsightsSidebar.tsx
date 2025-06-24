
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FileSelectionSection } from './FileSelectionSection';
import { SectionsSelectionModal } from './SectionsSelectionModal';

interface Section {
  section_title: string;
  summary: string;
  pages: number[];
}

interface DeepInsightsSidebarProps {
  files: any[];
  selectedFileIds: string[];
  toggleFileSelection: (fileId: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  isGenerating: boolean;
  onGenerateSummary: (dynamicSections?: any, fixedSections?: string[], fileType?: string) => void;
  dynamicSections: Section[];
}

export const DeepInsightsSidebar: React.FC<DeepInsightsSidebarProps> = ({
  files,
  selectedFileIds,
  toggleFileSelection,
  fileName,
  setFileName,
  isGenerating,
  onGenerateSummary,
  dynamicSections,
}) => {
  const [selectedDynamicSections, setSelectedDynamicSections] = useState<any>({});
  const [selectedFixedSections, setSelectedFixedSections] = useState<string[]>([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>(['detailed_insights']);

  const handleSectionSelection = (dynamicSectionList: any, fixedSectionList: string[]) => {
    console.log('Sections selected:', { dynamicSectionList, fixedSectionList });
    setSelectedDynamicSections(dynamicSectionList);
    setSelectedFixedSections(fixedSectionList);
  };

  const handleFileTypeChange = (values: string[]) => {
    // Ensure at least one option is always selected
    if (values.length > 0) {
      setSelectedFileTypes(values);
    }
  };

  const getFileTypeForAPI = () => {
    if (selectedFileTypes.length === 2) {
      return 'all';
    } else if (selectedFileTypes.includes('detailed_insights')) {
      return 'detailed_insights';
    } else if (selectedFileTypes.includes('discussion_points')) {
      return 'discussion_points';
    }
    return 'detailed_insights'; // default fallback
  };

  const handleGenerateSummary = () => {
    const fileType = getFileTypeForAPI();
    onGenerateSummary(selectedDynamicSections, selectedFixedSections, fileType);
  };

  const isDetailedInsightsSelected = selectedFileTypes.includes('detailed_insights');
  const canGenerateSummary = selectedFileTypes.length > 0 && fileName.trim() && selectedFileIds.length > 0;

  return (
    <div className="w-96 h-screen bg-gray-800 flex flex-col">
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Generate Summary</h3>
          <SectionsSelectionModal
            dynamicSections={dynamicSections}
            selectedFileIds={selectedFileIds}
            onSectionSelection={handleSectionSelection}
            disabled={!isDetailedInsightsSelected || selectedFileIds.length === 0}
          />
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="fileType" className="text-white text-sm font-medium">
              Select File Type
            </Label>
            <ToggleGroup 
              type="multiple" 
              value={selectedFileTypes} 
              onValueChange={handleFileTypeChange}
              className="grid grid-cols-1 gap-1 mt-1"
            >
              <ToggleGroupItem 
                value="detailed_insights" 
                className="bg-gray-700 border-gray-600 text-white text-xs py-1 px-2 data-[state=on]:bg-emerald-600 data-[state=on]:text-white hover:bg-gray-600"
              >
                Detailed Insights
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="discussion_points" 
                className="bg-gray-700 border-gray-600 text-white text-xs py-1 px-2 data-[state=on]:bg-emerald-600 data-[state=on]:text-white hover:bg-gray-600"
              >
                Discussion Points
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
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
            onClick={handleGenerateSummary}
            disabled={isGenerating || !canGenerateSummary}
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
