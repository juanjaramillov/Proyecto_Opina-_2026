import React, { useState } from 'react';

export interface FallbackAvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    name: string;
    containerClassName?: string;
    fallbackClassName?: string;
}

export const FallbackAvatar: React.FC<FallbackAvatarProps> = ({
    src,
    name,
    alt,
    className = '',
    containerClassName = '',
    fallbackClassName = '',
    ...props
}) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // If there's an explicit src string but it's empty, or an error happened, show fallback
    const shouldShowFallback = !src || src.trim() === '' || hasError;

    // Extract the first visible letter of the name
    const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

    if (shouldShowFallback) {
        return (
            <div
                className={`flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 text-primary-800 font-extrabold rounded-full shadow-inner ${containerClassName} ${fallbackClassName}`}
            >
                {initial}
            </div>
        );
    }

    return (
        <div className={`relative flex items-center justify-center w-full h-full ${containerClassName}`}>
            {!isLoaded && !shouldShowFallback && (
                <div className={`absolute inset-0 bg-slate-100/60 animate-[pulse_1s_infinite] rounded-3xl backdrop-blur-sm z-0 shadow-inner ${className}`} />
            )}
            <img
                src={src}
                alt={alt || name}
                className={`object-contain transition-opacity duration-500 z-10 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                onError={() => {
                    setHasError(true);
                    setIsLoaded(true);
                }}
                onLoad={() => setIsLoaded(true)}
                {...props}
            />
        </div>
    );
};

