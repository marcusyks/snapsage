import { OpenDatabase } from '@/controllers/databaseManager';
import * as SQLite from 'expo-sqlite';


// LHS Function: Convert an embedding to a hash
const hashEmbedding = (embedding: number[], numBits: number = 3): string => {
    return embedding
        .slice(0, numBits) // Reduce dimensionality
        .map(val => (val > 0 ? '1' : '0')) // Convert positive values to 1, negatives to 0
        .join('');
};

// Cosine Similarity Function (same as before)
const cosineSimilarity = (a: number[], b: number[]): number => {
    let dotProduct = 0, sumA = 0, sumB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        sumA += a[i] * a[i];
        sumB += b[i] * b[i];
    }

    const magnitudeA = Math.sqrt(sumA);
    const magnitudeB = Math.sqrt(sumB);

    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

// Precompute LHS Hash Index
const createLHSIndex = async (db: SQLite.SQLiteDatabase) => {
    const rows: Row[] = await db.getAllAsync('SELECT * FROM images WHERE embeddings IS NOT NULL');
    const index: Record<string, { hash: string, embedding: number[] }> = {};

    rows.forEach(row => {
        const embedding = JSON.parse(row.embeddings);
        const hash = hashEmbedding(embedding);
        index[row.filepath] = { hash, embedding };
    });

    return index;
};

// Save LHS Index to Database
const saveIndexToDb = async (index: Record<string, { hash: string, embedding: number[] }>, db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM embedding_index');

    for (const filepath in index) {
        await db.runAsync('INSERT INTO embedding_index (filepath, hash, embeddings) VALUES (?, ?, ?)', [
            filepath,
            index[filepath].hash,
            JSON.stringify(index[filepath].embedding),
        ]);
    }
};

// Load LHS Index from Database
const loadIndexFromDb = async (db: SQLite.SQLiteDatabase): Promise<Record<string, { hash: string, embedding: number[] }>> => {
    const rows: IndexRow[] = await db.getAllAsync('SELECT * FROM embedding_index');
    const index: Record<string, { hash: string, embedding: number[] }> = {};

    rows.forEach(row => {
        index[row.filepath] = {
            hash: row.hash,
            embedding: JSON.parse(row.embeddings),
        };
    });

    return index;
};

// Find Similar Images Using LHS Buckets
const findSimilarLHS = (queryEmbedding: number[], queryHash: string, index: Record<string, { hash: string, embedding: number[] }>, threshold: number = 0.7): string[] => {
    const results: string[] = [];

    Object.keys(index).forEach(filepath => {
        if (index[filepath].hash === queryHash) { // Only check items in the same LHS bucket
            const storedEmbedding = index[filepath].embedding;
            const simScore = cosineSimilarity(queryEmbedding, storedEmbedding);
            if (simScore >= threshold) {
                results.push(filepath);
            }
        }
    });

    return results;
};

// Create the Embedding Index Table with LHS Hash
export const CreateEmbeddingIndexTable = async (db: SQLite.SQLiteDatabase) => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS embedding_index (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filepath TEXT UNIQUE NOT NULL,
            hash TEXT NOT NULL,
            embeddings TEXT NOT NULL
        );
    `;
    // const createTableQuery = `DROP TABLE embedding_index`;
    db.execAsync(createTableQuery);
};

// Find Similar Assets Using LHS
export const FindSimilarAssets = async (filepathA: string, assets: Asset[]) => {
    const db = await OpenDatabase();

    // Load pre-saved index or create a new one if database updates
    let index = await loadIndexFromDb(db);
    if (Object.keys(index).length != assets.length) {
        index = await createLHSIndex(db);
        await saveIndexToDb(index, db);
    }

    // Retrieve the embedding for the query asset
    const assetAEmbeddingRow: Row | null = await db.getFirstAsync('SELECT * FROM images WHERE filepath = ?', [filepathA]);
    if (!assetAEmbeddingRow) {
        console.log(`Asset not found for filepath: ${filepathA}`);
        return [];
    }

    const queryEmbedding = JSON.parse(assetAEmbeddingRow.embeddings);
    const queryHash = hashEmbedding(queryEmbedding);

    // Find similar assets using LHS hash-based lookup
    const similarFilePaths = findSimilarLHS(queryEmbedding, queryHash, index);

    // Filter the assets that match the similar file paths
    const validAssets: Asset[] = assets.filter(asset =>
        similarFilePaths.includes(asset.uri) && asset.uri !== filepathA
    );

    return validAssets;
};
