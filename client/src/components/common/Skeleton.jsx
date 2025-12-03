import React from 'react';

const Skeleton = ({ className = '', variant = 'text' }) => {
    const baseClass = 'animate-pulse bg-gray-200 rounded';

    const variantClasses = {
        text: 'h-4',
        title: 'h-6',
        circle: 'rounded-full',
        rect: 'rounded-lg',
    };

    return (
        <div className={`${baseClass} ${variantClasses[variant]} ${className}`}></div>
    );
};

export default Skeleton;
