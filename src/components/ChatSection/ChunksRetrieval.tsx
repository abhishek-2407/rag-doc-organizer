import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ApiUrl } from '@/Constants';

interface ChunksRetrievalProps {
  selectedFiles: { file_id: string; file_name: string }[];
}

interface ChunkResponse {
  status_code: number;
  message: string;
  chunks: Array<{
    id: string | null;
    metadata: {
      doc_id: string;
      thread_id: string;
      file_id: string;
      file_name: string;
      page_number: number;
      type: string;
      is_financial_statement: string;
      statement_type: string;
      _id: string;
      _collection_name: string;
    };
    page_content: string;
    type: string;
  }>;
}

const ChunksRetrieval: React.FC<ChunksRetrievalProps> = ({ selectedFiles }) => {
  const [userQuery, setUserQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [pageList, setPageList] = useState('');
  const [statementTypes, setStatementTypes] = useState<string[]>([]);
  const [isFinancialStatement, setIsFinancialStatement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chunks, setChunks] = useState<ChunkResponse | null>(null);

  const statementOptions = ['consolidated', 'standalone', 'both', 'none'];

  const handleStatementTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setStatementTypes(prev => [...prev, type]);
    } else {
      setStatementTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user query",
        variant: "destructive"
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        user_query: userQuery,
        file_id_list: selectedFiles.map(f => f.file_id),
        top_k: topK,
        page_list: pageList.split(',').map(p => p.trim()).filter(p => p),
        statement_type: statementTypes,
        is_financial_statement: isFinancialStatement
      };

      const response = await fetch(`${ApiUrl}/doc-eval/retrieve-chunks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve chunks');
      }

      const data: ChunkResponse = await response.json();
      setChunks(data);
      
      toast({
        title: "Success",
        description: `Retrieved ${data.chunks?.length || 0} chunks`
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to retrieve chunks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chunks-retrieval h-full flex gap-6">
      {/* Left Panel - Form */}
      <div className="w-1/2 flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">Retrieve Document Chunks</h2>
          <p className="text-gray-400 text-sm">
            Selected Files: {selectedFiles.length > 0 ? selectedFiles.map(f => f.file_name).join(', ') : 'None'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userQuery" className="text-white">User Query</Label>
            <Textarea
              id="userQuery"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Show me the consolidated revenue growth for last 5 years"
              className="bg-gray-800 text-white border-gray-600"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topK" className="text-white">Top K</Label>
              <Input
                id="topK"
                type="number"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
                className="bg-gray-800 text-white border-gray-600"
                min="1"
                max="20"
              />
            </div>

            <div>
              <Label htmlFor="pageList" className="text-white">Page List (comma separated)</Label>
              <Input
                id="pageList"
                value={pageList}
                onChange={(e) => setPageList(e.target.value)}
                placeholder="1, 2, 3"
                className="bg-gray-800 text-white border-gray-600"
              />
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Statement Type (multiple selection)</Label>
            <div className="grid grid-cols-2 gap-2">
              {statementOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={statementTypes.includes(option)}
                    onCheckedChange={(checked) => handleStatementTypeChange(option, checked as boolean)}
                  />
                  <Label htmlFor={option} className="text-white capitalize">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Is Financial Statement</Label>
            <Select value={isFinancialStatement} onValueChange={setIsFinancialStatement}>
              <SelectTrigger className="bg-gray-800 text-white border-gray-600">
                <SelectValue placeholder="Select Yes or No" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Retrieving...' : 'Retrieve Chunks'}
          </Button>
        </form>
      </div>

      {/* Right Panel - Results */}
      <div className="w-1/2 flex flex-col">
        {chunks && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">
                Results ({chunks.chunks?.length || 0} chunks)
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {chunks.chunks?.map((chunk, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white">
                        {chunk.metadata.file_name} - Page {chunk.metadata.page_number}
                      </CardTitle>
                      <div className="text-xs text-gray-400">
                        Type: {chunk.metadata.type} | 
                        Statement: {chunk.metadata.statement_type} | 
                        Financial: {chunk.metadata.is_financial_statement}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">{chunk.page_content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
        {!chunks && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Submit a query to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChunksRetrieval;