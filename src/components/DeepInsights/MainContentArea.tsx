
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, FileIcon, FileText, Download, Trash2, Loader2 } from 'lucide-react';
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-screen relative bg-gray-900">
      {/* Fixed Top Bar with Heading and Button */}
      <div className="fixed top-0 left-96 right-0 z-10 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Document Section Details
        </CardTitle>
  
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <FileIcon className="h-4 w-4 mr-2" />
              Generated Summaries ({summaryFiles.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 bg-gray-800 border-gray-700" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Generated Summaries</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefreshSummaries}
                  disabled={isLoadingSummaries}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  {isLoadingSummaries ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-2 pr-2">
                  {summaryFiles.length === 0 ? (
                    <div className="text-gray-400 text-center py-4 text-sm">
                      No summaries found
                    </div>
                  ) : (
                    summaryFiles.map((summaryFile, index) => (
                      <div
                        key={`${summaryFile.file_id}-${index}`}
                        className="bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={14} className="text-gray-400 flex-shrink-0" />
                          <p className="text-white text-xs font-medium truncate flex-1" title={summaryFile.file_name}>
                            {summaryFile.file_name}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs ${summaryFile.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {summaryFile.status}
                          </p>
                          <div className="flex items-center gap-1">
                            {summaryFile.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDownload(summaryFile.s3_url, summaryFile.file_name)}
                                className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10 h-6 w-6 p-0"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteSummary(summaryFile.file_name, summaryFile.file_id)}
                              disabled={deletingFileId === summaryFile.file_id}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-6 w-6 p-0"
                            >
                              {deletingFileId === summaryFile.file_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>
  
      {/* Scrollable Body below header */}
      <div className="flex-1 mt-24 overflow-y-auto pb-12">
        <Card className="bg-gray-900 border-gray-900">
          <CardContent>
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
