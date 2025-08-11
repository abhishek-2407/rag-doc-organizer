
import { useState, useEffect, useRef } from 'react';
import { toast } from "@/components/ui/use-toast";
import { ApiUrl } from '@/Constants';

export interface Message {
    id?: number;
    content: string;
    sender: 'user' | 'system';
    streaming?: boolean;
}

export const useChatMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<{file_id: string, file_name: string}[]>([]);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const userScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

    const CHAT_URL = `${ApiUrl}/doc-eval/chat`;

    useEffect(() => {
        setMessages([
            {
                content: "Welcome to the AI-powered document evaluation system. You can ask questions about the documents you've uploaded. Let's get started!",
                sender: "system"
            }
        ]);
    }, []);

    useEffect(() => {
        if (shouldAutoScroll && !isUserScrolling) {
            scrollToBottom(true);
        }
    }, [messages, shouldAutoScroll, isUserScrolling]);

    useEffect(() => {
        const container = chatContainerRef.current;

        const handleScroll = () => {
            if (!container) return;

            // Clear any existing timer
            if (userScrollTimerRef.current) {
                clearTimeout(userScrollTimerRef.current);
            }

            // Set user is actively scrolling
            setIsUserScrolling(true);

            // Calculate if we're near the bottom
            const threshold = 100;
            const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

            // Update auto-scroll state based on position
            setShouldAutoScroll(distanceFromBottom <= threshold);

            // Reset user scrolling state after a delay
            userScrollTimerRef.current = setTimeout(() => {
                setIsUserScrolling(false);
            }, 500);
        };

        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
            if (userScrollTimerRef.current) {
                clearTimeout(userScrollTimerRef.current);
            }
        };
    }, []);

    const scrollToBottom = (smooth = false) => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        setMessages(prev => [...prev, { content: inputMessage, sender: "user" }]);
        const messageToProcess = inputMessage;
        setInputMessage('');

        // Reset scroll state when a new message is sent
        setShouldAutoScroll(true);
        setIsUserScrolling(false);

        await sendChatMessage(messageToProcess);
    };

    const sendChatMessage = async (query: string) => {
        setIsLoading(true);
        const tempId = Date.now();

        // Temporary loading message
        setMessages(prev => [...prev, { id: tempId, content: '', sender: 'system', streaming: true }]);

        try {
            const response = await fetch(CHAT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    user_id: "11111111-1111-1111-1111-111111111111",
                    query_id: "query_1",
                    file_id_list: selectedFiles,
                    stream: true
                })
            });

            if (!response.ok) throw new Error("Network response was not ok");

            // Check if it's a stream or not
            const contentType = response.headers.get('Content-Type');
            const isStream = true;

            if (isStream) {
                const reader = response.body!.getReader();
                const decoder = new TextDecoder("utf-8");

                let currentContent = '';

                const updateMessage = async (text: string) => {
                    const chunkSize = 10;
                    for (let i = 0; i < text.length; i += chunkSize) {
                        const chunk = text.substring(i, i + chunkSize);
                        currentContent += chunk;

                        setMessages(prev => {
                            const updated = [...prev];
                            const last = updated[updated.length - 1];
                            if (last?.streaming) {
                                updated[updated.length - 1] = { ...last, content: currentContent };
                            }
                            return updated;
                        });

                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                };

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    await updateMessage(chunk);
                }

                // Finalize streaming message
                setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last?.streaming) {
                        updated[updated.length - 1] = { ...last, streaming: false, content: currentContent };
                    }
                    return updated;
                });

            } else {
                // Non-streaming JSON response
                const data = await response.json();
                const content = data.final_response || "No result found.";

                setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last?.streaming) {
                        updated[updated.length - 1] = { ...last, streaming: false, content };
                    }
                    return updated;
                });
            }

        } catch (error: any) {
            setMessages(prev => [...prev, { content: `An error occurred: ${error.message}`, sender: "system" }]);
            toast({ 
                title: "Error", 
                description: "Failed to send message", 
                variant: "destructive" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        inputMessage,
        setInputMessage,
        isLoading,
        setSelectedFiles,
        selectedFiles,
        handleSubmit,
        chatContainerRef,
    };
};
