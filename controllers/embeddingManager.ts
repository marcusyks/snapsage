import { OpenDatabase } from '@/controllers/databaseManager';
import * as SQLite from 'expo-sqlite';

const cosineSimilarity = (a: number[], b: number[]): number => {
    let dotProduct = 0;
    let sumA = 0;
    let sumB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        sumA += a[i] * a[i];
        sumB += b[i] * b[i];
    }

    const magnitudeA = Math.sqrt(sumA);
    const magnitudeB = Math.sqrt(sumB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
};

const similarity = async (filepathA: string, embeddingsB: string, db: SQLite.SQLiteDatabase): Promise<boolean | null> => {
    try {
        const assetAEmbedding: Row = await db.getFirstAsync('SELECT * FROM images WHERE filepath = ?', [filepathA]) as Row;

        if (!assetAEmbedding) {
            console.log(`Asset not found for filepath: ${filepathA}`);
            return null;
        }

        const parsedEmbeddingString = assetAEmbedding.embeddings;
        const embeddingsAArray = JSON.parse(parsedEmbeddingString);
        const embeddingsBArray = JSON.parse(embeddingsB);

        const simScore = cosineSimilarity(embeddingsAArray, embeddingsBArray);

        const similarityThreshold = 0.7;
        return simScore >= similarityThreshold;

    } catch (error) {
        console.log(`Error getting row for similarity search: ${error}`);
        return null;
    }
};

export const FindSimilarAssets = async (filepathA: string, assets: Asset[]) => {
    const db = await OpenDatabase();
    const dbRows: Row[] = await db.getAllAsync('SELECT * FROM images WHERE filepath != ? AND embeddings IS NOT NULL', filepathA);
    const similarityResults: (boolean | null)[] = await Promise.all(
        dbRows.map(async (row) => {
            const r = await similarity(filepathA, row.embeddings, db);
            return r;
        })
    );

    const validAssetRows: Row[] = dbRows.filter((_, index) => similarityResults[index] === true);
    const validAssets: Asset[] = assets.filter(asset =>
        validAssetRows.some(validRow => validRow.filepath == asset.uri)
    );
    return validAssets;
};