import { OpenDatabase } from '@/controllers/databaseManager';
import * as SQLite from 'expo-sqlite';

// Create the Embedding Index Table with SQLite Index
export const CreateEmbeddingIndexTable = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
        DROP INDEX IF EXISTS idx_hash;
        DROP TABLE IF EXISTS embedding_index;
        CREATE TABLE  embedding_index (
            filepath TEXT PRIMARY KEY,
            hash TEXT NOT NULL,
            embeddings TEXT NOT NULL
        );
        CREATE INDEX idx_hash ON embedding_index (hash);
    `);
    await loadIndex(db);
};

// Insert or Update Embedding Index
export const SaveEmbeddingIndex = async (db: SQLite.SQLiteDatabase, filepath: string, embedding: number[]) => {
    const hash = hashEmbedding(embedding);
    await db.runAsync(
        `INSERT INTO embedding_index (filepath, hash, embeddings) VALUES (?, ?, ?)
        ON CONFLICT(filepath) DO UPDATE SET hash = excluded.hash, embeddings = excluded.embeddings;`,
        [filepath, hash, JSON.stringify(embedding)]
    );
};

// Find Similar Assets Using SQLite Index
export const FindSimilarAssets = async (filepathA: string, assets: Asset[]) => {
    const db = await OpenDatabase();


    // Retrieve the embedding for the query asset
    const assetAEmbeddingRow : IndexRow | null = await db.getFirstAsync('SELECT * FROM embedding_index WHERE filepath = ?', [filepathA]);
    if (!assetAEmbeddingRow) {
        console.log(`Asset not found for filepath: ${filepathA}`);
        return [];
    }

    const queryEmbedding = JSON.parse(assetAEmbeddingRow.embeddings);
    const queryHash = assetAEmbeddingRow.hash;

    // Find candidates using SQLite index on hash
    const candidateRows : IndexRow[] = await db.getAllAsync('SELECT * FROM embedding_index WHERE hash = ?', [queryHash]);

    // Compute similarity only for candidates with the same hash
    const candidateFP = candidateRows
        .filter(row => row.filepath !== filepathA)
        .map(row => ({ uri: row.filepath, similarity: cosineSimilarity(queryEmbedding, JSON.parse(row.embeddings)) }))
        .filter(item => item.similarity >= 0.7)
        .map(item => item.uri);

    return candidateFP.map(uri => assets.find(asset => asset.uri === uri) as Asset);
};

const loadIndex = async (db: SQLite.SQLiteDatabase) => {
    const rows : Row[] = await db.getAllAsync('SELECT * FROM images');
    for (const row of rows) {
        await db.runAsync('INSERT INTO embedding_index (filepath, hash, embeddings) VALUES (?, ?, ?)', [
            row.filepath,
            hashEmbedding(JSON.parse(row.embeddings), rows.length),
            row.embeddings,
        ]);
    }
};

// Hashing function remains unchanged
const hashEmbedding = (embedding: number[], dbSize : number): string => {
    const numBits : number = Math.log2(dbSize);
    return embedding.slice(0, numBits).map(val => (val > 0 ? '1' : '0')).join('');
};

// Cosine similarity function remains unchanged
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
