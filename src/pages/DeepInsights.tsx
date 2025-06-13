
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { FileText, Loader2, Download, Trash2, ArrowLeft, BookOpen, FileIcon } from 'lucide-react';
import { useFileSelection } from '../components/ChatSection/useFileSelection';
import { ApiUrl, UserId } from '@/Constants';
import { Link } from 'react-router-dom';

interface SummaryFile {
  file_name: string;
  s3_url: string;
  source_file_id: string[];
  file_id: string;
  status: string;
}

interface Section {
  section_title: string;
  summary: string;
  pages: number[];
}

interface DynamicSectionsResponse {
  status: number;
  response: {
    sections: Section[];
  };
}

const DeepInsights = () => {
  const { files, selectedFileIds, toggleFileSelection } = useFileSelection();
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryFiles, setSummaryFiles] = useState<SummaryFile[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [dynamicSections, setDynamicSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  useEffect(() => {
    fetchSummaryFiles();
  }, []);

  useEffect(() => {
    if (selectedFileIds.length > 0) {
      fetchDynamicSections();
    } else {
      setDynamicSections([]);
    }
  }, [selectedFileIds]);

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

  const fetchDynamicSections = async () => {
    setIsLoadingSections(true);
    try {
      const response = await fetch(`${ApiUrl}/doc-eval/get-dynamic-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id_list: selectedFileIds,
          user_id: UserId
        }),
      });

      const data: DynamicSectionsResponse = await response.json();

      if (data.status === 200) {
        setDynamicSections(data.response.sections);
      } else {
        toast.error('Failed to fetch dynamic sections');
      }
    } catch (error) {
      console.error('Error fetching dynamic sections:', error);
      toast.error('Failed to fetch dynamic sections');
    } finally {
      setIsLoadingSections(false);
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
          thread_id: 'generated-summary-file',
          file_id_list: selectedFileIds,
          file_name: fileName.trim(),
          user_id: UserId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Summary document generated successfully!');
        setFileName('');
        fetchSummaryFiles();
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

  const handleDeleteSummary = async (fileName: string, fileId: string) => {
    setDeletingFileId(fileId);
    
    try {
      const response = await fetch(`${ApiUrl}/doc-eval/delete-summary-file?file_key=${encodeURIComponent(fileName)}&user_id=${UserId}`, {
        method: 'DELETE',
      });

      if (response.status === 200) {
        toast.success('Summary file deleted successfully!');
        fetchSummaryFiles();
      } else {
        toast.error('Error deleting summary file');
      }
    } catch (error) {
      console.error('Error deleting summary file:', error);
      toast.error('Failed to delete summary file');
    } finally {
      setDeletingFileId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-500 mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">Deep Insights</h1>
        </div>

        {/* File Selection */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold mb-3">Select Documents</h3>
            <ScrollArea className="h-64">
              <div className="space-y-2">
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
            <div className="text-xs text-gray-400 mt-2">
              {selectedFileIds.length} file(s) selected
            </div>
          </div>

          {/* Summary Generation */}
          <div className="p-4 border-b border-gray-700">
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
                onClick={handleGenerateSummary}
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

          {/* Generated Summaries */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Generated Summaries</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSummaryFiles}
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
            <ScrollArea className="h-full">
              <div className="space-y-2">
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
                              onClick={() => handleDownload(summaryFile.s3_url, summaryFile.file_name)}
                              className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10 h-6 w-6 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSummary(summaryFile.file_name, summaryFile.file_id)}
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <Card className="bg-gray-800 border-gray-700 h-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Document Sections Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            {selectedFileIds.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Select documents from the left panel</p>
                  <p className="text-gray-500 text-sm mt-2">Choose one or more documents to view their section analysis</p>
                </div>
              </div>
            ) : isLoadingSections ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
                  <p className="text-white">Analyzing document sections...</p>
                </div>
              </div>
            ) : dynamicSections.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No sections found</p>
                  <p className="text-gray-500 text-sm mt-2">The selected documents don't have any analyzable sections</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeepInsights;
