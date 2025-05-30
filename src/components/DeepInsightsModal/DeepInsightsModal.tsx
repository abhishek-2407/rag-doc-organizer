
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { FileText, Loader2 } from 'lucide-react';
import { useFileSelection } from '../ChatSection/useFileSelection';
import { ApiUrl, UserId } from '@/Constants';

interface DeepInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeepInsightsModal: React.FC<DeepInsightsModalProps> = ({ isOpen, onClose }) => {
  const { files, selectedFileIds, toggleFileSelection } = useFileSelection();
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
        onClose();
        setFileName('');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Generate Deep Insights Summary</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 h-[60vh]">
          {/* File Selection Panel */}
          <div className="w-1/2 border-r border-gray-700 pr-6">
            <h3 className="text-white font-semibold mb-4">Select Files</h3>
            <div className="h-[50vh] overflow-y-auto space-y-2 bg-gray-800 rounded-lg p-4">
              {files.map((file) => (
                <div
                  key={file.file_id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="accent-pink-600"
                    checked={selectedFileIds.includes(file.file_id)}
                    onChange={() => toggleFileSelection(file.file_id)}
                  />
                  <FileText size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-white text-sm truncate">
                    {file.file_name.split('/').pop()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-400">
              {selectedFileIds.length} file(s) selected
            </div>
          </div>

          {/* Summary Generation Panel */}
          <div className="w-1/2 pl-6">
            <h3 className="text-white font-semibold mb-4">Summary Details</h3>
            <div className="space-y-4">
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

              <div className="pt-4">
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating || !fileName.trim() || selectedFileIds.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Summary...
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
