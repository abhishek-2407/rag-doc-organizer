
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileIcon } from 'lucide-react';

interface Section {
  section_title: string;
  summary: string;
  pages: number[];
}

interface SectionsDisplayPanelProps {
  selectedFileIds: string[];
  isLoadingSections: boolean;
  dynamicSections: Section[];
}

export const SectionsDisplayPanel: React.FC<SectionsDisplayPanelProps> = ({
  selectedFileIds,
  isLoadingSections,
  dynamicSections,
}) => {
  if (selectedFileIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Select documents from the left panel</p>
          <p className="text-gray-500 text-sm mt-2">Choose one or more documents to view their section analysis</p>
        </div>
      </div>
    );
  }

  if (isLoadingSections) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Analyzing document sections...</p>
        </div>
      </div>
    );
  }

  if (dynamicSections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No sections found</p>
          <p className="text-gray-500 text-sm mt-2">The selected documents don't have any analyzable sections</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
        {dynamicSections.map((section, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <FileIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <h3 className="text-white font-semibold text-lg">{section.section_title}</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
              {section.summary}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-400 text-xs">Pages:</span>
              {section.pages.map((page, pageIndex) => (
                <span
                  key={pageIndex}
                  className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                >
                  {page}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
