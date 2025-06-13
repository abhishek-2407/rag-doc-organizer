
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileIcon } from 'lucide-react';
import { GeneratedSummariesPanel } from './GeneratedSummariesPanel';
import { SectionsDisplayPanel } from './SectionsDisplayPanel';

interface Section {
  section_title: string;
  summary: string;
  pages: number[];
}

interface SummaryFile {
  file_name: string;
  s3_url: string;
  source_file_id: string[];
  file_id: string;
  status: string;
}

interface MainContentAreaProps {
  selectedFileIds: string[];
  isLoadingSections: boolean;
  dynamicSections: Section[];
  summaryFiles: SummaryFile[];
  isLoadingSummaries: boolean;
  deletingFileId: string | null;
  onRefreshSummaries: () => void;
  onDownload: (s3Url: string, fileName: string) => void;
  onDeleteSummary: (fileName: string, fileId: string) => void;
}

export const MainContentArea: React.FC<MainContentAreaProps> = ({
  selectedFileIds,
  isLoadingSections,
  dynamicSections,
  summaryFiles,
  isLoadingSummaries,
  deletingFileId,
  onRefreshSummaries,
  onDownload,
  onDeleteSummary,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Generated Summaries Panel - Top Right */}
      <GeneratedSummariesPanel
        summaryFiles={summaryFiles}
        isLoadingSummaries={isLoadingSummaries}
        deletingFileId={deletingFileId}
        onRefreshSummaries={onRefreshSummaries}
        onDownload={onDownload}
        onDeleteSummary={onDeleteSummary}
      />

      {/* Document Sections Analysis - Bottom */}
      <div className="flex-1 p-6 pt-0">
        <Card className="bg-gray-800 border-gray-700 h-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Document Sections Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <SectionsDisplayPanel
              selectedFileIds={selectedFileIds}
              isLoadingSections={isLoadingSections}
              dynamicSections={dynamicSections}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
