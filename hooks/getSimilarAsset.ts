import { useEffect, useState, useCallback } from 'react';
import { getAssets } from './getAssets';
import { FindSimilarAssets } from '@/controllers/embeddingManager';

export const GetSimilarAssets = (filepathA: string) => {
    const [similarAssets, setSimilarAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { assets } = getAssets('all');

    const refetch = useCallback(async () => {
        if (!assets || assets.length === 0) return;

        setLoading(true);

        try {
            const validAssets: Asset[] = await FindSimilarAssets(filepathA, assets);
            setSimilarAssets(validAssets);
        } catch (error) {
            console.log("Failed to find similar assets:", error);
            setError("Failed to find similar assets");
        } finally {
            setLoading(false);
        }
    }, [assets, filepathA]);

    useEffect(() => {
        refetch(); // Run the initial fetch on mount or when `filepathA` changes
    }, [filepathA, refetch]);

    return { similarAssets, loading, error, refetch };
};
