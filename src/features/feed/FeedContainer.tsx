import React from 'react';

interface FeedContainerProps {
    children: React.ReactNode;
}

const FeedContainer: React.FC<FeedContainerProps> = ({ children }) => {
    return (
        <div className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black">
            {children}
        </div>
    );
};

export default FeedContainer;
