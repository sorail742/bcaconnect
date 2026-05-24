import { useState, useCallback } from 'react';
import api from '../services/api';

export const usePaginatedData = (endpoint, pageSize = 20) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPage = useCallback(async (pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(endpoint, {
                params: {
                    page: pageNum,
                    limit: pageSize
                }
            });

            const newData = response.data.data || response.data;
            const total = response.data.total || newData.length;

            if (pageNum === 1) {
                setData(newData);
            } else {
                setData(prev => [...prev, ...newData]);
            }

            setPage(pageNum);
            setHasMore(data.length + newData.length < total);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [endpoint, pageSize, data.length]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchPage(page + 1);
        }
    }, [page, loading, hasMore, fetchPage]);

    const reset = useCallback(() => {
        setData([]);
        setPage(1);
        setHasMore(true);
        fetchPage(1);
    }, [fetchPage]);

    return {
        data,
        page,
        hasMore,
        loading,
        error,
        loadMore,
        reset,
        fetchPage
    };
};

export default usePaginatedData;
