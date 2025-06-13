
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, Download, Trash2 } from 'lucide-react';

interface SummaryFile {
  file_name: string;
  s3_url: string;
  source_file_id: string[];
  file_id: string;
  status: string;
}

interface GeneratedSummariesPanelProps {
  summaryFiles: SummaryFile[];
  isLoadingSummaries: boolean;
  deletingFileId: string | null;
  onRefreshSummaries: () => void;
  onDownload: (s3Url: string, fileName: string) => void;
  onDeleteSummary: (fileName: string, fileId: string) => void;
}

export const GeneratedSummariesPanel: React.FC<GeneratedSummariesPanelProps> = ({
  summaryFiles,
  isLoadingSummaries,
  deletingFileId,
  onRefreshSummaries,
  onDownload,
  onDeleteSummary,
}) => {
  return (
    <div className="p-6 pb-0">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-48">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Generated Summaries</h3>
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
        <ScrollArea className="h-32">
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
    </div>
  );
};
