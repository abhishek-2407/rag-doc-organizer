
import React from 'react';

interface PulseLoaderProps {
    color?: string;
    size?: number;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({ color = "#d4076a", size = 10 }) => {
    return (
        <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
                <div 
                    key={i}
                    className="animate-pulse"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        backgroundColor: color,
                        animationDelay: `${i * 0.15}s`
                    }}
                />
            ))}
        </div>
    );
};
