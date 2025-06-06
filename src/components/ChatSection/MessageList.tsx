
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from "remark-gemoji";
import { Message } from './useChatMessages';
import { PulseLoader } from './PulseLoader';
import './ChatSection.css';


interface MessageListProps {
    messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const components = {
        table: ({ node, ...props }: any) => (
            <div className="table-container">
                <table className="markdown-table" {...props} />
            </div>
        ),
        thead: ({ node, ...props }: any) => <thead className="markdown-thead" {...props} />,
        tbody: ({ node, ...props }: any) => <tbody className="markdown-tbody" {...props} />,
        tr: ({ node, ...props }: any) => <tr className="markdown-tr" {...props} />,
        th: ({ node, ...props }: any) => <th className="markdown-th" {...props} />,
        td: ({ node, ...props }: any) => <td className="markdown-td" {...props} />,
        p: ({ node, ...props }: any) => <p className="markdown-paragraph" {...props} />,
        h1: ({ node, ...props }: any) => <h1 className="markdown-heading markdown-h1" {...props} />,
        h2: ({ node, ...props }: any) => <h2 className="markdown-heading markdown-h2" {...props} />,
        h3: ({ node, ...props }: any) => <h3 className="markdown-heading markdown-h3" {...props} />,
        h4: ({ node, ...props }: any) => <h4 className="markdown-heading markdown-h4" {...props} />,
        h5: ({ node, ...props }: any) => <h5 className="markdown-heading markdown-h5" {...props} />,
        h6: ({ node, ...props }: any) => <h6 className="markdown-heading markdown-h6" {...props} />,
        hr: ({ node, ...props }: any) => <hr className="markdown-hr" {...props} />,
        ul: ({ node, ...props }: any) => <ul className="markdown-ul" {...props} />,
        ol: ({ node, ...props }: any) => <ol className="markdown-ol" {...props} />,
        li: ({ node, ...props }: any) => <li className="markdown-li" {...props} />,
        blockquote: ({ node, ...props }: any) => <blockquote className="markdown-blockquote" {...props} />,
    };

    return (
        <>
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'system-message'}`}>
                    {msg.sender === 'system' && (
                        <div className="bot-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#d4076a"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                <circle cx="12" cy="5" r="2" />
                                <path d="M12 7v4" />
                                <line x1="8" y1="16" x2="8" y2="16" />
                                <line x1="16" y1="16" x2="16" y2="16" />
                            </svg>
                        </div>
                    )}
                    <div className="message-content">
                        {msg.streaming && msg.content === '' ? (
                            <div className="loading-indicator">
                                <PulseLoader />
                            </div>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkGemoji]}
                                components={components}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
};
