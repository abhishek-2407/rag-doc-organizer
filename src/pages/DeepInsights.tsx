import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useFileSelection } from '../components/ChatSection/useFileSelection';
import { ApiUrl, UserId } from '@/Constants';
import { DeepInsightsSidebar } from '../components/DeepInsights/DeepInsightsSidebar';
import { MainContentArea } from '../components/DeepInsights/MainContentArea';

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

  const handleGenerateSummary = async (dynamicSectionList?: any, fixedSectionList?: string[]) => {
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
      const payload: any = {
        thread_id: 'generated-summary-file',
        file_id_list: selectedFileIds,
        file_name: fileName.trim(),
        user_id: UserId
      };

      // Add section selections if provided
      if (dynamicSectionList && Object.keys(dynamicSectionList).length > 0) {
        payload.dynamic_section_list = dynamicSectionList;
      }

      if (fixedSectionList && fixedSectionList.length > 0) {
        payload.fixed_section_list = fixedSectionList;
      }

      const response = await fetch(`${ApiUrl}/doc-eval/summary-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
      <DeepInsightsSidebar
        files={files}
        selectedFileIds={selectedFileIds}
        toggleFileSelection={toggleFileSelection}
        fileName={fileName}
        setFileName={setFileName}
        isGenerating={isGenerating}
        onGenerateSummary={handleGenerateSummary}
        dynamicSections={dynamicSections}
      />
      
      <MainContentArea
        selectedFileIds={selectedFileIds}
        isLoadingSections={isLoadingSections}
        dynamicSections={dynamicSections}
        summaryFiles={summaryFiles}
        isLoadingSummaries={isLoadingSummaries}
        deletingFileId={deletingFileId}
        onRefreshSummaries={fetchSummaryFiles}
        onDownload={handleDownload}
        onDeleteSummary={handleDeleteSummary}
      />
    </div>
  );
};

export default DeepInsights;
