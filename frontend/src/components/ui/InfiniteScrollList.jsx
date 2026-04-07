import React, { useState, useCallback } from 'react';
import { useInfiniteScroll } from '../hooks/useLazyLoad';
import { Loader2 } from 'lucide-react';

export const InfiniteScrollList = ({ 
    items = [], 
    renderItem, 
    onLoadMore,
    hasMore = true,
    isLoading = false,
    className = '',
    itemClassName = ''
}) => {
    const observerTarget = useInfiniteScroll(onLoadMore, hasMore);

    return (
        <div className={`space-y-4 ${className}`}>
            {items.map((item, idx) => (
                <div key={item.id || idx} className={itemClassName}>
                    {renderItem(item, idx)}
                </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="size-6 text-primary animate-spin" />
                </div>
            )}

            {/* Intersection observer target */}
            {hasMore && <div ref={observerTarget} className="h-4" />}

            {/* End of list message */}
            {!hasMore && items.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    Fin de la liste
                </div>
            )}
        </div>
    );
};

export default InfiniteScrollList;
