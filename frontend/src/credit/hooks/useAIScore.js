import { useState, useEffect } from 'react';
import creditService from '../services/creditService';

export function useAIScore() {
    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshScore = async () => {
        setLoading(true);
        try {
            const data = await creditService.getScore();
            setScoreData(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshScore();
    }, []);

    return { scoreData, loading, error, refreshScore };
}
