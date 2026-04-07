import { useState, useEffect } from 'react';
import api from '../services/api';

export const useFetchData = (endpoint, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(endpoint);
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        if (endpoint) {
            fetchData();
        }
    }, [endpoint, ...dependencies]);

    return { data, loading, error, refetch: () => {} };
};

export const useFetchById = (endpoint, id) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`${endpoint}/${id}`);
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint, id]);

    return { data, loading, error };
};

export const usePostData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const post = async (endpoint, payload) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post(endpoint, payload);
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { post, loading, error };
};
