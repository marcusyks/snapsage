import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { getAssets } from './getAssets';

const DB_KEY = process.env.EXPO_PUBLIC_DB_KEY as string;

const cosineSimilarity = (a: number[], b: number[]): number => {
    // Initialize values for dot product and magnitudes
    let dotProduct = 0;
    let sumA = 0;
    let sumB = 0;

    // Compute dot product and magnitudes in a single loop
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        sumA += a[i] * a[i];
        sumB += b[i] * b[i];
    }

    // Calculate magnitudes
    const magnitudeA = Math.sqrt(sumA);
    const magnitudeB = Math.sqrt(sumB);

    // Check for division by zero
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Return 0 if either vector has zero magnitude
    }

    return dotProduct / (magnitudeA * magnitudeB); // Return cosine similarity value
};


// Function to calculate similarity between two assets
const similarity = async (filepathA: string, embeddingsB: string, db: SQLite.SQLiteDatabase): Promise<boolean | null> => {
    try {
        // Get asset A from database using its filepath
        const assetAEmbedding: Row = await db.getFirstAsync('SELECT * FROM images WHERE filepath = ?', [filepathA]) as Row;

        // Check if asset A was found
        if (!assetAEmbedding) {
            console.log(`Asset not found for filepath: ${filepathA}`);
            return null; // Return null if asset A is not found
        }

        const parsedEmbeddingString = assetAEmbedding.embeddings;
        const embeddingsAArray = JSON.parse(parsedEmbeddingString); // Parse embedding string to array
        const embeddingsBArray = JSON.parse(embeddingsB); // Parse embedding string to array

        // Compare both embeddings using cosine similarity function
        const simScore = cosineSimilarity(embeddingsAArray, embeddingsBArray);

        // Establish whether asset A is similar to asset B based on a threshold
        const similarityThreshold = 0.5;
        return simScore >= similarityThreshold;

    } catch (error) {
        console.log(`Error getting row for similarity search: ${error}`);
        return null;
    }
};

export const GetSimilarAssets = (filepathA: string) => {
    const [similarAssets, setSimilarAssets] = useState<Asset[]>([]); // State for similar assets
    const [loading, setLoading] = useState<boolean>(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state
    const { assets } = getAssets('all');

    useEffect(() => {
        if (!assets || assets.length === 0) return; //only run similarity search when assets arrive

        const fetchSimilarAssets = async () => {
            setLoading(true); // Set loading state
            const db = await SQLite.openDatabaseAsync(DB_KEY); // Open the database

            try {
                const dbRows: Row[] = await db.getAllAsync('SELECT * FROM images WHERE filepath != ? AND embeddings IS NOT NULL', filepathA); // Fetch all non-null assets
                const similarityResults: (boolean | null)[] = await Promise.all(
                    dbRows.map(async (row) => {
                        const r = await similarity(filepathA, row.embeddings, db); // Check similarity for each asset
                        return r;
                    })
                );
                // Filter valid assets based on similarity results
                const validAssetRows: Row[] = dbRows.filter((_, index) => similarityResults[index] === true);
                const validAssets: Asset[] = assets.filter(asset =>
                    validAssetRows.some(validRow => validRow.filepath == asset.uri)
                );
                setSimilarAssets(validAssets); // Set similar assets
            } catch (error) {
                console.log("Failed to find similar assets:", error);
                setError("Failed to find similar assets"); // Set error state
            } finally {
                setLoading(false);
            }
        };

        fetchSimilarAssets(); // Fetch similar assets when filepathA changes
    }, [assets]);

    return { similarAssets, loading, error }; // Return similar assets, loading state, and error state
};
