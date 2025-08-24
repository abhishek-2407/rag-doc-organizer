
import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronRight, FolderOpen, File, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useChatMessages } from './useChatMessages';
import { useFileSelection } from './useFileSelection';
import { FolderTree } from './FolderTree';
import { MessageList } from './MessageList';
import ChunksRetrieval from './ChunksRetrieval';
import './ChatSection.css';

const ChatSection = () => {
    const [showChunks, setShowChunks] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [includeNotes, setIncludeNotes] = useState(false);
    const [isCoreMode, setIsCoreMode] = useState(false);
    
    const {
        messages,
        inputMessage,
        setInputMessage,
        isLoading,
        handleSubmit,
        chatContainerRef,
        setSelectedFiles,
        setNotesFilter,
        setVersion,
    } = useChatMessages();

    const {
        files,
        selectedFileIds,
        toggleFileSelection,
        folderTree,
        openFolders,
        toggleFolder
    } = useFileSelection();

    // Update the selected files with both ID and name in the chat messages hook
    useEffect(() => {
        const selectedFilesWithNames = selectedFileIds.map(fileId => {
            const file = files.find(f => f.file_id === fileId);
            return {
                file_id: fileId,
                file_name: file?.file_name || ''
            };
        });
        setSelectedFiles(selectedFilesWithNames);
    }, [selectedFileIds, files, setSelectedFiles]);

    // Update notes filter in chat messages hook
    useEffect(() => {
        setNotesFilter(includeNotes ? "Yes" : "No");
    }, [includeNotes, setNotesFilter]);

    // Update version in chat messages hook
    useEffect(() => {
        setVersion(isCoreMode ? "core" : "doc");
    }, [isCoreMode, setVersion]);

    return (
        <div className='chat-section'>
            <div className="chat-layout">
                <div className="left-panel">
                    <h3>Available Files</h3>
                    {files.length === 0 && <p>Loading files...</p>}

                    <div className="folders-container">
                        <FolderTree 
                            folder={folderTree} 
                            openFolders={openFolders}
                            toggleFolder={toggleFolder}
                            selectedFileIds={selectedFileIds}
                            toggleFileSelection={toggleFileSelection}
                        />
                    </div>
                </div>

                <div className="right-panel">
                    <div className="chat-header">
                        <h1>Document Analysis</h1>
                        <div className="flex items-center justify-between gap-4">
                            <h2>Get Insights</h2>
                            <div className="flex items-center gap-12">
                                {/* Version Toggle */}
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="version-mode" className="text-xs text-gray-300">
                                        Full Doc
                                    </Label>
                                    <Switch
                                        id="version-mode"
                                        checked={isCoreMode}
                                        onCheckedChange={setIsCoreMode}
                                        className="data-[state=checked]:bg-pink-600"
                                    />
                                    <Label htmlFor="version-mode" className="text-xs text-gray-300">
                                        Core Statement
                                    </Label>
                                </div>
                                <Button
                                    onClick={() => setShowChunks(!showChunks)}
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {showChunks ? 'Back to Chat' : 'Get Chunks'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="chat-app">
                        {!showChunks ? (
                            <>
                                <ScrollArea className="chat-messages" ref={chatContainerRef}>
                                    <MessageList messages={messages} />
                                </ScrollArea>

                                {/* Filter Dialog Box - Hidden in Core mode */}
                                {!isCoreMode && (
                                    <div className="relative pl-5 pr-16">
                                        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                        <CollapsibleTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="w-full text-xs text-gray-400 hover:text-white hover:bg-gray-800 justify-between h-6 px-2 mb-0"
                                            >
                                                <span className="text-xs">Chat Filters</span>
                                                {isFilterOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="bg-gray-800 p-2 rounded-lg border border-gray-600 mb-0">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="include-notes"
                                                            checked={includeNotes}
                                                            onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                                                            className="border-gray-400 h-3 w-3"
                                                        />
                                                        <Label 
                                                            htmlFor="include-notes" 
                                                            className="text-xs text-gray-300 cursor-pointer"
                                                        >
                                                            Include Notes section
                                                        </Label>
                                                    </div>
                                                    {/* Future filters will go here side by side */}
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                                )}

                                <form className="chat-input pt-1" onSubmit={handleSubmit}>
                                    <Input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        disabled={isLoading}
                                        className="bg-gray-800 text-white border-gray-600"
                                    />
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading || !inputMessage.trim()}
                                        className="send-button"
                                        size="icon"
                                    >
                                        <Send size={20} />
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="p-4 h-full">
                                <ChunksRetrieval 
                                    selectedFiles={selectedFileIds.map(fileId => {
                                        const file = files.find(f => f.file_id === fileId);
                                        return {
                                            file_id: fileId,
                                            file_name: file?.file_name || ''
                                        };
                                    })} 
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatSection;
