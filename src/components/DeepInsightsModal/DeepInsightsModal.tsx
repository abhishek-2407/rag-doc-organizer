
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/sonner';
import { FileText, Loader2, Download } from 'lucide-react';
import { useFileSelection } from '../ChatSection/useFileSelection';
import { ApiUrl, UserId } from '@/Constants';

interface DeepInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SummaryFile {
  file_name: string;
  s3_url: string;
  source_file_id: string[];
  file_id: string;
  status: string;
}

export const DeepInsightsModal: React.FC<DeepInsightsModalProps> = ({ isOpen, onClose }) => {
  const { files, selectedFileIds, toggleFileSelection } = useFileSelection();
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryFiles, setSummaryFiles] = useState<SummaryFile[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSummaryFiles();
    }
  }, [isOpen]);

  const fetchSummaryFiles = async () => {
    setIsLoadingSummaries(true);
    try {
      const response = await fetch(`${ApiUrl}/doc-eval/get-summary-files`);
      const data = await response.json();
      
      if (data.status_code === 200) {
        setSummaryFiles(data.data);
      } else {
        toast.error('Failed to fetch summary files');
      }
    } catch (error) {
      console.error('Error fetching summary files:', error);
      toast.error('Failed to fetch summary files');
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!fileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    if (selectedFileIds.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(`${ApiUrl}/doc-eval/summary-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: 'testing',
          file_id_list: selectedFileIds,
          file_name: fileName.trim(),
          user_id: UserId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Summary document generated successfully!');
        setFileName('');
        fetchSummaryFiles(); // Refresh the summary files list
      } else {
        toast.error(data.message || 'Failed to generate summary document');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (s3Url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = s3Url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Deep Insights Summary</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 h-[70vh]">
          {/* File Selection Panel */}
          <div className="w-1/3 border-r border-gray-700 pr-6 flex flex-col">
            <h3 className="text-white font-semibold mb-4">Select Files</h3>
            <ScrollArea className="flex-1 bg-gray-800 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.file_id}
                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="accent-pink-600 mt-1 flex-shrink-0"
                      checked={selectedFileIds.includes(file.file_id)}
                      onChange={() => toggleFileSelection(file.file_id)}
                    />
                    <FileText size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white text-sm break-words leading-relaxed">
                      {file.file_name.split('/').pop()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="text-sm text-gray-400">
              {selectedFileIds.length} file(s) selected
            </div>
          </div>

          {/* Summary Generation Panel */}
          <div className="w-1/3 border-r border-gray-700 pr-6 flex flex-col">
            <h3 className="text-white font-semibold mb-4">Generate Summary</h3>
            <div className="space-y-4 flex-1">
              <div>
                <Label htmlFor="fileName" className="text-white">File Name</Label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter summary file name"
                  className="bg-gray-800 border-gray-700 text-white mt-2"
                />
              </div>

              <Button
                onClick={handleGenerateSummary}
                disabled={isGenerating || !fileName.trim() || selectedFileIds.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Summary Doc
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Summary Files List Panel */}
          <div className="w-1/3 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Generated Summaries</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSummaryFiles}
                disabled={isLoadingSummaries}
                className="text-gray-400 hover:text-white"
              >
                {isLoadingSummaries ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
            <ScrollArea className="flex-1 bg-gray-800 rounded-lg p-4">
              <div className="space-y-3">
                {summaryFiles.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No summary files found
                  </div>
                ) : (
                  summaryFiles.map((summaryFile, index) => (
                    <div
                      key={`${summaryFile.file_id}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText size={16} className="text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate" title={summaryFile.file_name}>
                            {summaryFile.file_name}
                          </p>
                          <p className={`text-xs ${summaryFile.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {summaryFile.status}
                          </p>
                        </div>
                      </div>
                      {summaryFile.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(summaryFile.s3_url, summaryFile.file_name)}
                          className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10 flex-shrink-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
