
import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronRight, FolderOpen, File } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessages } from './useChatMessages';
import { useFileSelection } from './useFileSelection';
import { FolderTree } from './FolderTree';
import { MessageList } from './MessageList';
import './ChatSection.css';

const ChatSection = () => {
    const {
        messages,
        inputMessage,
        setInputMessage,
        isLoading,
        handleSubmit,
        chatContainerRef,
        setSelectedFileIds,
    } = useChatMessages();

    const {
        files,
        selectedFileIds,
        toggleFileSelection,
        folderTree,
        openFolders,
        toggleFolder
    } = useFileSelection();

    // Update the selected file IDs in the chat messages hook whenever they change in the file selection hook
    useEffect(() => {
        setSelectedFileIds(selectedFileIds);
    }, [selectedFileIds, setSelectedFileIds]);

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
                        <h2>Get Insights</h2>
                    </div>

                    <div className="chat-app">
                        <ScrollArea className="chat-messages" ref={chatContainerRef}>
                            <MessageList messages={messages} />
                        </ScrollArea>

                        <form className="chat-input" onSubmit={handleSubmit}>
                            <Input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="chat-input-field"
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatSection;
